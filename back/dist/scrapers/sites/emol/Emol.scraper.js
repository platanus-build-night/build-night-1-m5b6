"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../../types");
class EmolScraper {
    /**
     * @param numberOfPages how many pages of results to fetch (each pageSize items)
     * @param pageSize items per page (max 100)
     */
    constructor(numberOfPages = 1, pageSize = 100) {
        if (numberOfPages < 1) {
            throw new Error("numberOfPages must be at least 1");
        }
        if (pageSize < 1 || pageSize > 100) {
            throw new Error("pageSize must be between 1 and 100");
        }
        this.numberOfPages = numberOfPages;
        this.pageSize = pageSize;
        console.log(`Initialized EmolScraper: pages=${this.numberOfPages}, size=${this.pageSize}`);
    }
    /**
     * Fetches one "page" of the EMOL API (size items starting from `from`).
     */
    fetchPage(from) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${EmolScraper.BASE_URL}${EmolScraper.ENDPOINT}/nacional/0`;
            const params = { size: this.pageSize, from };
            try {
                const response = yield axios_1.default.get(url, { params });
                return response.data;
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                return null;
            }
        });
    }
    /**
     * Helper to decode unicode escapes and HTML entities, then strip tags.
     */
    cleanHtmlContent(rawContent) {
        if (!rawContent)
            return "";
        try {
            // 1. Decode basic unicode escapes (like \u003C -> <)
            let text = rawContent.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
            // 2. Decode common HTML entities
            text = text
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
            // 3. Strip remaining HTML tags
            text = text.replace(/<[^>]*>/g, " ");
            // 4. Clean up whitespace
            text = text.replace(/\s\s+/g, " ").trim();
            return text;
        }
        catch (error) {
            console.error("Error cleaning content:", error);
            return rawContent; // Return raw content on error
        }
    }
    /**
     * Parses API response into our ScrapedArticleDetail interface.
     */
    parseResponse(data) {
        var _a;
        const hits = ((_a = data.hits) === null || _a === void 0 ? void 0 : _a.hits) || [];
        console.log(`Parsing ${hits.length} hits`);
        return hits.map((hit) => {
            var _a;
            const src = hit._source;
            return {
                url: src.permalink,
                title: (_a = src.titulo) === null || _a === void 0 ? void 0 : _a.trim(),
                author: types_1.AuthorSource.Emol, // Always set author to Emol
                publishedDate: src.fechaPublicacion,
                content: this.cleanHtmlContent(src.texto), // Clean the content
            };
        });
    }
    /**
     * Public method: fetches and aggregates multiple pages of results.
     */
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Starting EMOL scrape for ${this.numberOfPages} page(s)...`);
            const allArticles = [];
            for (let page = 0; page < this.numberOfPages; page++) {
                const from = page * this.pageSize;
                const pageData = yield this.fetchPage(from);
                if (!pageData) {
                    console.warn(`Skipping page ${page} due to fetch error.`);
                    continue;
                }
                const articles = this.parseResponse(pageData);
                allArticles.push(...articles);
                console.log(`Page ${page} complete, total articles so far: ${allArticles.length}`);
            }
            // Deduplicate by URL
            const unique = Array.from(new Map(allArticles.map(a => [a.url, a])).values());
            console.log(`Scrape complete: ${unique.length} unique articles found.`);
            return unique;
        });
    }
}
EmolScraper.BASE_URL = "https://newsapi.ecn.cl";
EmolScraper.ENDPOINT = "/NewsApi/emol/seccionFiltrada";
exports.default = EmolScraper;
