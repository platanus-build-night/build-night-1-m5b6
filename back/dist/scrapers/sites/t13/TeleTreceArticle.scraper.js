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
class TeleTreceArticleScraper {
    fetchArticleHtml(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Simple GET request, mimic browser User-Agent
                const response = yield axios_1.default.get(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
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
                return null;
            }
        });
    }
    // Parses the main content from the article HTML
    parseContent(html, url) {
        const $ = cheerio.load(html);
        // Find the main article container
        const mainArticle = $("main.articulo-detalle article");
        const title = mainArticle.find('h1[itemprop="headline"]').text().trim();
        const author = mainArticle.find(".autor a").text().trim();
        const publishedDate = mainArticle
            .find('time[itemprop="datePublished"]')
            .attr("datetime");
        // Select the core content area
        const contentElement = mainArticle.find(".cuerpo-content");
        // Remove known non-content elements before extracting text
        contentElement
            .find(".ads13, .leetambien, .embed, #t13-envivo, #article-inread-desktop, .banner-google-news, #banner-13go, .articulo-categorias, .cuerpo-share")
            .remove();
        // Extract text from relevant tags within the content area
        let content = "";
        contentElement.find("p, h2, h3, li").each((_idx, el) => {
            const text = $(el).text().trim();
            if (text) {
                content += text + "\n\n"; // Add paragraphs/newlines
            }
        });
        return {
            url,
            title: title || undefined,
            author: types_1.AuthorSource.T13,
            publishedDate: publishedDate || undefined,
            content: content.trim(), // Trim trailing newlines
        };
    }
    // Public method to scrape a single article
    scrapeArticle(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield this.fetchArticleHtml(url);
            if (!html) {
                console.error(`Failed to get HTML for article: ${url}`);
                return null;
            }
            try {
                const articleDetail = this.parseContent(html, url);
                return articleDetail;
            }
            catch (error) {
                console.error(`Error parsing article content for ${url}:`, error);
                return null;
            }
        });
    }
}
exports.default = TeleTreceArticleScraper;
