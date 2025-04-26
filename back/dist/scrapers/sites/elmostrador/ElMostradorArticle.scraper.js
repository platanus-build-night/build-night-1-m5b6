"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const cheerio = __importStar(require("cheerio"));
const types_1 = require("../../types");
class ElMostradorArticleScraper {
    fetchArticleHtml(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`Fetching El Mostrador article: ${url}`);
                const response = yield axios_1.default.get(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
                    },
                });
                if (typeof response.data === "string") {
                    return response.data;
                }
                console.error(`Fetched data is not a string from ${url}`);
                return null;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                const responseStatus = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
                console.error(`Error fetching El Mostrador article ${url}: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ""}`);
                return null;
            }
        });
    }
    // Parses the main content from the article HTML
    parseContent(html, url) {
        const $ = cheerio.load(html);
        // Extract metadata and content based on El Mostrador structure
        const title = $("h1.d-the-single__title").text().trim();
        const authorName = $("div.d-the-single-authors a.the-by__permalink")
            .first()
            .text()
            .trim();
        const publishedDateString = $("time.d-the-single__date").attr("datetime");
        let isoPublishedDate = undefined;
        if (publishedDateString) {
            try {
                // Assuming the datetime attribute is in a format JS Date can parse (like YYYY-MM-DD)
                isoPublishedDate = new Date(publishedDateString).toISOString();
            }
            catch (e) {
                console.warn(`Could not parse date string "${publishedDateString}" for El Mostrador article ${url}: ${e.message}`);
            }
        }
        // --- Content Extraction ---
        let content = "";
        // Target paragraphs within the main text wrapper
        const mainContentContainer = $("div.d-the-single-wrapper__text");
        if (mainContentContainer.length > 0) {
            console.log(`Extracting content using 'div.d-the-single-wrapper__text p' strategy for ${url}`);
            mainContentContainer.find("p").each((_idx, el) => {
                const text = $(el).text().trim();
                if (text) {
                    // Avoid empty paragraphs
                    content += text + "\n\n";
                }
            });
        }
        else {
            console.warn(`Main content container 'div.d-the-single-wrapper__text' not found for ${url}. Content might be missing.`);
            // Fallback: Try the excerpt if main content fails?
            const excerpt = $("p.d-the-single__excerpt").text().trim();
            if (excerpt) {
                console.log("Using excerpt as fallback content.");
                content = excerpt;
            }
        }
        // If content is still empty, log a warning
        if (!content.trim()) {
            console.warn(`Could not extract meaningful content for article: ${url}`);
        }
        return {
            url,
            title: title || undefined,
            author: types_1.AuthorSource.ElMostrador,
            publishedDate: isoPublishedDate,
            content: content.trim(),
        };
    }
    scrapeArticle(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield this.fetchArticleHtml(url);
            if (!html) {
                console.error(`Failed to get HTML for El Mostrador article: ${url}`);
                return null;
            }
            try {
                const articleDetail = this.parseContent(html, url);
                if (!articleDetail.content) {
                    console.warn(`El Mostrador article content appears empty after parsing: ${url}`);
                }
                return articleDetail;
            }
            catch (error) {
                console.error(`Error parsing El Mostrador article content for ${url}:`, error);
                return null;
            }
        });
    }
}
exports.default = ElMostradorArticleScraper;
