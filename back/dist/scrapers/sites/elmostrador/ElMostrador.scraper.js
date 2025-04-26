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
const utils_1 = require("../../utils");
const data_source_1 = require("../../../data-source");
// Import the actual article scraper
const ElMostradorArticle_scraper_1 = __importDefault(require("./ElMostradorArticle.scraper"));
// Base URL for El Mostrador
const SITE_BASE_URL = "https://www.elmostrador.cl";
class ElMostradorScraper {
    /**
     * Fetches the HTML content of the El Mostrador homepage.
     */
    fetchHomepageHtml() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`Fetching homepage: ${SITE_BASE_URL}/`);
                const response = yield axios_1.default.get(SITE_BASE_URL, {
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
                console.error(`Error fetching El Mostrador homepage: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`);
                return null;
            }
        });
    }
    /**
     * Parses the homepage HTML to extract article titles and URLs.
     */
    parseHomepageHtml(html) {
        try {
            const $ = cheerio.load(html);
            const articles = [];
            const seenUrls = new Set();
            console.log("Parsing El Mostrador homepage HTML...");
            // Target links within common article card structures that have '__permalink' in their class
            $('main.main a[class*="__permalink"]').each((_index, element) => {
                const link = $(element);
                const url = link.attr('href');
                let title = link.text().trim();
                // If the link itself has no text, try to find the title in a parent/sibling element
                // Heuristic: Look for a common title element within the link's card parent
                if (!title) {
                    const card = link.closest('[class*="-card"], [class*="__card"]'); // Find closest card-like parent
                    title = card.find('h1, h2, h3').first().text().trim(); // Find first heading within the card
                }
                if (url && title && url.startsWith(SITE_BASE_URL) && !seenUrls.has(url)) {
                    // Basic validation: check if it's an El Mostrador URL and not already seen
                    if (!url.includes('/autor/') && !url.includes('/categoria/') && !url.includes('/tag/')) { // Avoid author/category links
                        try {
                            // Further validation: ensure it's a plausible article path
                            const parsedUrl = new URL(url);
                            // Simple check: path usually has multiple segments for articles
                            if (parsedUrl.pathname.split('/').filter(Boolean).length > 1) {
                                articles.push({ title, url });
                                seenUrls.add(url);
                            }
                            else {
                                // console.log(`Skipping probable non-article link: ${url}`);
                            }
                        }
                        catch (e) {
                            console.warn(`Skipping invalid URL: ${url} - ${e.message}`);
                        }
                    }
                }
            });
            console.log(`Parsed ${articles.length} unique article list items from El Mostrador homepage.`);
            return articles;
        }
        catch (parseError) {
            console.error(`Error parsing El Mostrador homepage HTML: ${parseError.message}`);
            return [];
        }
    }
    /**
    * Fetches and parses detailed content for multiple articles concurrently.
    */
    scrapeArticleDetails(articleListItems) {
        return __awaiter(this, void 0, void 0, function* () {
            if (articleListItems.length === 0) {
                return [];
            }
            console.log(`Scraping details for ${articleListItems.length} El Mostrador articles...`);
            const articleScraper = new ElMostradorArticle_scraper_1.default();
            const detailedArticlesPromises = articleListItems.map((item) => articleScraper.scrapeArticle(item.url));
            const settledResults = yield Promise.allSettled(detailedArticlesPromises);
            const successfulDetailedArticles = [];
            settledResults.forEach((result, index) => {
                var _a, _b;
                if (result.status === "fulfilled" && result.value) {
                    if (result.value.content) {
                        successfulDetailedArticles.push(result.value);
                    }
                    else {
                        console.warn(`Skipping El Mostrador article (no content found): ${(_a = articleListItems[index]) === null || _a === void 0 ? void 0 : _a.url}`);
                    }
                }
                else if (result.status === "rejected") {
                    console.warn(`Failed to scrape El Mostrador article ${(_b = articleListItems[index]) === null || _b === void 0 ? void 0 : _b.url}: ${result.reason}`);
                }
            });
            console.log(`Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} El Mostrador articles.`);
            return successfulDetailedArticles;
        });
    }
    /**
    * Filters and tags articles using the analysis utility.
    */
    filterAndTag(articles) {
        return __awaiter(this, void 0, void 0, function* () {
            const articlesWithAnalysis = yield Promise.all(articles.map(utils_1.generateAndAddAnalysisToArticle));
            return articlesWithAnalysis;
        });
    }
    /**
     * Main scraping method for El Mostrador.
     */
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Starting El Mostrador scrape process...");
            const homepageHtml = yield this.fetchHomepageHtml();
            if (!homepageHtml) {
                console.error("Failed to fetch El Mostrador homepage. Exiting scrape.");
                return [];
            }
            const articleListItems = this.parseHomepageHtml(homepageHtml);
            if (articleListItems.length === 0) {
                console.log("No article list items found on El Mostrador homepage. Exiting scrape.");
                return [];
            }
            // Deduplication is handled within parseHomepageHtml using seenUrls Set
            // Scrape details using the actual implementation
            const detailedArticles = yield this.scrapeArticleDetails(articleListItems);
            if (detailedArticles.length === 0) {
                console.log("No El Mostrador articles with content could be scraped. Exiting scrape.");
                return [];
            }
            // Filter, tag, and save
            try {
                const finalArticles = yield this.filterAndTag(detailedArticles);
                console.log(`Analysis added to ${finalArticles.length} El Mostrador articles.`);
                yield (0, data_source_1.saveArticles)(finalArticles);
                console.log(`Successfully saved ${finalArticles.length} El Mostrador articles.`);
                return finalArticles;
            }
            catch (error) {
                console.error(`Error during final processing/saving for El Mostrador: ${error.message}`);
                return detailedArticles;
            }
        });
    }
}
exports.default = ElMostradorScraper;
