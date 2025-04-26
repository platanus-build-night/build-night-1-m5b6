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
const utils_1 = require("../../utils");
const data_source_1 = require("../../../data-source");
// Import the actual article scraper
const ElPaisArticle_scraper_1 = __importDefault(require("./ElPaisArticle.scraper"));
// Base URL for El País
const SITE_BASE_URL = "https://elpais.com";
const LIST_PAGE_URL = `${SITE_BASE_URL}/chile/actualidad/`;
class ElPaisScraper {
    /**
     * Fetches the HTML content of the El País Chile actuality page.
     */
    fetchListPageHtml() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`Fetching list page: ${LIST_PAGE_URL}`);
                const response = yield axios_1.default.get(LIST_PAGE_URL, {
                    headers: {
                        // Standard browser headers
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
                    },
                });
                return response.data;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                const responseStatus = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
                console.error(`Error fetching El País list page: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ""}`);
                return null;
            }
        });
    }
    /**
     * Parses the list page HTML to extract article titles and URLs.
     */
    parseListPageHtml(html) {
        try {
            const $ = cheerio.load(html);
            const articles = [];
            console.log("Parsing El País list page HTML...");
            // Select each article card within the main content area
            $("main#main-content article.c.c-d").each((_index, element) => {
                var _a;
                const card = $(element);
                const headlineLink = card.find("h2.c_t a"); // Target the link within the h2 title
                const title = headlineLink.text().trim();
                let relativeUrl = headlineLink.attr("href");
                // Sometimes URLs might be absolute, check before prepending base URL
                if (relativeUrl && !relativeUrl.startsWith("http")) {
                    // Prepend base URL only if it's a relative path
                    relativeUrl = new URL(relativeUrl, SITE_BASE_URL).toString();
                }
                if (title && relativeUrl) {
                    // Ensure it's a valid, full URL before adding
                    try {
                        // Validate URL structure (optional but good practice)
                        new URL(relativeUrl);
                        articles.push({ title, url: relativeUrl });
                    }
                    catch (e) {
                        console.warn(`Skipping list item: Invalid URL found: ${relativeUrl} - ${e.message}`);
                    }
                }
                else {
                    console.warn("Skipping article card: Could not find title or URL.", ((_a = card.html()) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) + "..."); // Log part of the card HTML for debugging
                }
            });
            console.log(`Parsed ${articles.length} article list items from El País page.`);
            return articles;
        }
        catch (parseError) {
            console.error(`Error parsing El País list page HTML: ${parseError.message}`);
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
            console.log(`Scraping details for ${articleListItems.length} El País articles...`);
            const articleScraper = new ElPaisArticle_scraper_1.default();
            // Consider adding concurrency control (e.g., p-limit)
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
                        console.warn(`Skipping El País article (no content found): ${(_a = articleListItems[index]) === null || _a === void 0 ? void 0 : _a.url}`);
                    }
                }
                else if (result.status === "rejected") {
                    console.warn(`Failed to scrape El País article ${(_b = articleListItems[index]) === null || _b === void 0 ? void 0 : _b.url}: ${result.reason}`);
                }
            });
            console.log(`Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} El País articles.`);
            return successfulDetailedArticles;
        });
    }
    /**
     * Filters and tags articles using the analysis utility.
     */
    filterAndTag(articles) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure AuthorSource.ElPais exists in your types/enum before using it
            // For now, we'll map it - adjust if needed
            const articlesWithCorrectSource = articles.map((a) => (Object.assign(Object.assign({}, a), { author: types_1.AuthorSource.ElPais })));
            const articlesWithAnalysis = yield Promise.all(articlesWithCorrectSource.map(utils_1.generateAndAddAnalysisToArticle));
            return articlesWithAnalysis;
        });
    }
    /**
     * Main scraping method for El País Chile.
     */
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Starting El País (Chile) scrape process...");
            const listPageHtml = yield this.fetchListPageHtml();
            if (!listPageHtml) {
                console.error("Failed to fetch El País list page. Exiting scrape.");
                return [];
            }
            const articleListItems = this.parseListPageHtml(listPageHtml);
            if (articleListItems.length === 0) {
                console.log("No article list items found on El País page. Exiting scrape.");
                return [];
            }
            const uniqueArticleListItems = Array.from(new Map(articleListItems.map((item) => [item.url, item])).values());
            console.log(`Found ${uniqueArticleListItems.length} unique article list items.`);
            // Scrape details using the actual implementation
            const detailedArticles = yield this.scrapeArticleDetails(uniqueArticleListItems);
            // If after scraping details, no articles have content, log and exit
            if (detailedArticles.length === 0) {
                console.log("No El País articles with content could be scraped. Exiting scrape.");
                return [];
            }
            // Filter, tag, and save
            try {
                const finalArticles = yield this.filterAndTag(detailedArticles);
                console.log(`Analysis added to ${finalArticles.length} El País articles.`);
                yield (0, data_source_1.saveArticles)(finalArticles);
                console.log(`Successfully saved ${finalArticles.length} El País articles.`);
                return finalArticles;
            }
            catch (error) {
                console.error(`Error during final processing/saving for El País: ${error.message}`);
                return detailedArticles; // Return successfully scraped (but potentially unprocessed) articles
            }
        });
    }
}
exports.default = ElPaisScraper;
