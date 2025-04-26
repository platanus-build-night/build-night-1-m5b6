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
// Placeholder selectors - these need to be verified by inspecting an actual La Nacion article page
const ARTICLE_TITLE_SELECTOR = 'h1.entry-title'; // Example selector, needs verification
const ARTICLE_CONTENT_SELECTOR = '.td-post-content'; // Example selector, needs verification
const ARTICLE_DATE_SELECTOR = 'time.entry-date'; // Example selector, needs verification
class LaNacioneScraper {
    fetchArticleHtml(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`Fetching article: ${url}`);
                const response = yield axios_1.default.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                    }
                });
                return response.data;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                const responseStatus = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
                console.error(`Error fetching La Nacion article ${url}: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`);
                return null;
            }
        });
    }
    parseArticleHtml(html, url) {
        try {
            const $ = cheerio.load(html);
            const title = $(ARTICLE_TITLE_SELECTOR).first().text().trim();
            const content = $(ARTICLE_CONTENT_SELECTOR).text().trim(); // Adjust based on actual structure (might need .html() or more specific selection)
            const publishedDateString = $(ARTICLE_DATE_SELECTOR).attr('datetime'); // Or .text() depending on the element
            if (!title || !content) {
                console.warn(`Could not extract title or content for La Nacion article: ${url}`);
                return null;
            }
            let isoPublishedDate = undefined;
            if (publishedDateString) {
                try {
                    isoPublishedDate = new Date(publishedDateString).toISOString();
                }
                catch (e) {
                    console.warn(`Could not parse date string "${publishedDateString}" for La Nacion article ${url}: ${e.message}`);
                }
            }
            return {
                url,
                title,
                author: types_1.AuthorSource.LaNacion, // Set source
                publishedDate: isoPublishedDate,
                content: content, // Perform cleaning if necessary
            };
        }
        catch (parseError) {
            console.error(`Error parsing La Nacion article HTML for ${url}: ${parseError.message}`);
            return null;
        }
    }
    scrapeArticle(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield this.fetchArticleHtml(url);
            if (!html) {
                return null;
            }
            return this.parseArticleHtml(html, url);
        });
    }
}
exports.default = LaNacionArticleScraper;
