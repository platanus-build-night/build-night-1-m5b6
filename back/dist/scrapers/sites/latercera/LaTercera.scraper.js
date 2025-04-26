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
const LaTerceraArticle_scraper_1 = __importDefault(require("./LaTerceraArticle.scraper"));
// Base URL for La Tercera
const SITE_BASE_URL = "https://www.latercera.com";
class LaTerceraScraper {
    /**
     * Fetches the HTML content of the La Tercera homepage.
     */
    fetchHomepageHtml() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`Fetching homepage: ${SITE_BASE_URL}/`);
                const response = yield axios_1.default.get(SITE_BASE_URL, {
                    headers: {
                        // Add headers if necessary, e.g., User-Agent
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                return response.data;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                const responseStatus = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
                console.error(`Error fetching La Tercera homepage: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`);
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
            console.log("Parsing La Tercera homepage HTML...");
            // Select each story card based on the provided HTML structure
            $('.story-card').each((_index, element) => {
                const card = $(element);
                // Find the headline link
                const headlineLink = card.find('.story-card__headline a.base-link');
                const title = headlineLink.text().trim();
                const relativeUrl = headlineLink.attr('href');
                if (title && relativeUrl) {
                    try {
                        // Resolve the relative URL to an absolute URL
                        const url = new URL(relativeUrl, SITE_BASE_URL).toString();
                        articles.push({ title, url });
                    }
                    catch (e) {
                        console.warn(`Skipping list item: Error constructing URL for ${relativeUrl}: ${e.message}`);
                    }
                }
                else {
                    // Fallback: try image link if headline link fails
                    const imageLink = card.find('.story-card__image a.base-link');
                    const imgRelativeUrl = imageLink.attr('href');
                    const imgTitle = imageLink.attr('aria-label') || card.find('.story-card__headline').text().trim() || 'Title not found'; // Try aria-label or headline text as fallback
                    if (imgRelativeUrl) {
                        try {
                            const url = new URL(imgRelativeUrl, SITE_BASE_URL).toString();
                            articles.push({ title: imgTitle, url });
                        }
                        catch (e) {
                            console.warn(`Skipping list item (fallback): Error constructing URL for ${imgRelativeUrl}: ${e.message}`);
                        }
                    }
                    else {
                        console.warn("Skipping card: Could not find title or URL.");
                    }
                }
            });
            console.log(`Parsed ${articles.length} article list items from homepage.`);
            return articles;
        }
        catch (parseError) {
            console.error(`Error parsing La Tercera homepage HTML: ${parseError.message}`);
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
            console.log(`Scraping details for ${articleListItems.length} La Tercera articles...`);
            const articleScraper = new LaTerceraArticle_scraper_1.default();
            // Consider adding concurrency control here (e.g., p-limit) if scraping many articles
            const detailedArticlesPromises = articleListItems.map((item) => articleScraper.scrapeArticle(item.url));
            const settledResults = yield Promise.allSettled(detailedArticlesPromises);
            const successfulDetailedArticles = [];
            settledResults.forEach((result, index) => {
                var _a, _b;
                if (result.status === "fulfilled" && result.value) {
                    // Ensure the result has content before adding
                    if (result.value.content) {
                        successfulDetailedArticles.push(result.value);
                    }
                    else {
                        console.warn(`Skipping article (no content found): ${(_a = articleListItems[index]) === null || _a === void 0 ? void 0 : _a.url}`);
                    }
                }
                else if (result.status === "rejected") {
                    console.warn(`Failed to scrape article ${(_b = articleListItems[index]) === null || _b === void 0 ? void 0 : _b.url}: ${result.reason}`);
                }
                // Handle fulfilled but null results (already logged in scrapeArticle)
            });
            console.log(`Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} La Tercera articles.`);
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
     * Main scraping method for La Tercera.
     */
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Starting La Tercera scrape process...");
            const homepageHtml = yield this.fetchHomepageHtml();
            if (!homepageHtml) {
                console.error("Failed to fetch La Tercera homepage. Exiting scrape.");
                return [];
            }
            const articleListItems = this.parseHomepageHtml(homepageHtml);
            if (articleListItems.length === 0) {
                console.log("No article list items found on the homepage. Exiting scrape.");
                return [];
            }
            // Deduplicate based on URL before scraping details
            const uniqueArticleListItems = Array.from(new Map(articleListItems.map((item) => [item.url, item])).values());
            console.log(`Found ${uniqueArticleListItems.length} unique article list items.`);
            // Scrape details using the new method
            const detailedArticles = yield this.scrapeArticleDetails(uniqueArticleListItems);
            // If after scraping details, no articles have content, log and exit
            if (detailedArticles.length === 0) {
                console.log("No articles with content could be scraped. Exiting scrape.");
                return [];
            }
            // Filter, tag, and save
            try {
                // Filter/Tagging step (might be incomplete if content isn't scraped)
                const finalArticles = yield this.filterAndTag(detailedArticles);
                console.log(`Analysis added to ${finalArticles.length} articles.`);
                // Save articles to the database
                yield (0, data_source_1.saveArticles)(finalArticles);
                console.log(`Successfully saved ${finalArticles.length} articles.`);
                return finalArticles;
            }
            catch (error) {
                console.error(`Error during final processing/saving: ${error.message}`);
                // Return successfully scraped (but potentially unprocessed) articles even if saving/filtering fails
                return detailedArticles;
            }
        });
    }
}
exports.default = LaTerceraScraper;
