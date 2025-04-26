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
class LaTerceraArticleScraper {
    fetchArticleHtml(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`Fetching article: ${url}`);
                const response = yield axios_1.default.get(url, {
                    headers: {
                        // Mimic browser headers
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
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
                console.error(`Error fetching article ${url}: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`);
                return null;
            }
        });
    }
    // Parses the main content from the article HTML
    parseContent(html, url) {
        var _a;
        const $ = cheerio.load(html);
        // Extract metadata
        const title = (_a = $('meta[property="og:title"]').attr('content')) === null || _a === void 0 ? void 0 : _a.trim();
        const publishedDateString = $('meta[property="article:published_time"]').attr('content');
        let isoPublishedDate = undefined;
        if (publishedDateString) {
            try {
                isoPublishedDate = new Date(publishedDateString).toISOString();
            }
            catch (e) {
                console.warn(`Could not parse date string "${publishedDateString}" for La Tercera article ${url}: ${e.message}`);
            }
        }
        // --- Content Extraction ---
        let content = "";
        // Strategy 1: Try finding a main content container and extracting <p> tags
        // Common La Tercera containers might be '.single-content', 'article .body', etc.
        // Let's inspect the provided example's structure.
        // The example has <div class="single-content content ..."
        const mainContentContainer = $('div.single-content'); // Adjust selector if needed
        if (mainContentContainer.length > 0) {
            console.log(`Using main content container strategy for ${url}`);
            mainContentContainer.find('p').each((_idx, el) => {
                const text = $(el).text().trim();
                if (text) {
                    content += text + "\n\n";
                }
            });
        }
        else {
            // Strategy 2: Fallback to parsing JSON-LD if main container fails
            console.warn(`Main content container not found for ${url}. Trying JSON-LD.`);
            try {
                const jsonLdScript = $('script[type="application/ld+json"]').html();
                if (jsonLdScript) {
                    const jsonData = JSON.parse(jsonLdScript);
                    if (jsonData && jsonData.articleBody) {
                        content = jsonData.articleBody.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim(); // Basic HTML stripping
                        console.log(`Extracted content from JSON-LD for ${url}`);
                    }
                    else {
                        console.warn(`JSON-LD found but no articleBody for ${url}.`);
                    }
                }
                else {
                    console.warn(`JSON-LD script not found for ${url}.`);
                }
            }
            catch (jsonError) {
                console.error(`Error parsing JSON-LD for ${url}: ${jsonError.message}`);
            }
        }
        // If content is still empty after both strategies, log a warning
        if (!content) {
            console.warn(`Could not extract content for article: ${url}`);
            // Strategy 3: As a last resort, grab all <p> tags in the body? Risky.
            // $('body').find('p').each... - uncomment if desperate
        }
        return {
            url,
            title: title || undefined, // Use extracted title or undefined
            author: types_1.AuthorSource.LaTercera, // Use the enum value
            publishedDate: isoPublishedDate,
            content: content.trim(),
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
                if (!articleDetail.content) {
                    console.warn(`Article content appears empty after parsing: ${url}`);
                }
                return articleDetail;
            }
            catch (error) {
                console.error(`Error parsing article content for ${url}:`, error);
                return null;
            }
        });
    }
}
exports.default = LaTerceraArticleScraper;
// Export ScrapedArticleDetail if needed by the main scraper directly
// export { ScrapedArticleDetail }; 
