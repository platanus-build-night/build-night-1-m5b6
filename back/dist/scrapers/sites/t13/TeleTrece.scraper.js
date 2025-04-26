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
const TeleTreceArticle_scraper_1 = __importDefault(require("./TeleTreceArticle.scraper"));
const utils_1 = require("../../utils");
const data_source_1 = require("../../../data-source");
// --- Constants ---
const SITE_BASE_URL = "https://www.t13.cl";
const AJAX_URL = `${SITE_BASE_URL}/views/ajax?_wrapper_format=drupal_ajax`;
const AJAX_COMMAND_INSERT = "insert";
const AJAX_COMMAND_SHOW_MORE = "viewsShowMore";
const DEFAULT_HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
};
class TeleTreceScraper {
    constructor(numberOfPages = 10) {
        // Default to scraping 1 page
        if (numberOfPages < 1) {
            throw new Error("Number of pages to scrape must be at least 1.");
        }
        this.numberOfPagesToScrape = numberOfPages;
        console.log(`Initialized TeleTreceScraper to scrape ${this.numberOfPagesToScrape} page(s).`);
    }
    /**
     * Fetches the AJAX response for a specific page number containing article list HTML.
     */
    fetchListPageData(pageNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const formData = new URLSearchParams({
                view_name: "t13_loultimo_seccion",
                view_display_id: "page_1",
                view_args: "",
                view_path: "/lo-ultimo",
                view_base_path: "lo-ultimo",
                // TODO: Investigate if view_dom_id is static or needs dynamic fetching
                view_dom_id: "2f9e6a936fa9215c52b1d4e9c098bccf19bc6da3191da3d4139b7a32ef76902d",
                pager_element: "0",
                page: pageNumber.toString(),
                _drupal_ajax: "1",
                "ajax_page_state[theme]": "t13_v1",
                "ajax_page_state[theme_token]": "",
                "ajax_page_state[libraries]": "ads13/ads-management,system/base,views/views.ajax,views/views.module,views_show_more/views_show_more",
            });
            try {
                const response = yield axios_1.default.post(AJAX_URL, formData, { headers: DEFAULT_HEADERS });
                if (!Array.isArray(response.data)) {
                    console.error(`Received non-array data for page ${pageNumber}:`, response.data);
                    return null;
                }
                return response.data;
            }
            catch (error) {
                // Use generic error handling, checking for common properties
                const message = error instanceof Error ? error.message : String(error);
                const responseStatus = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
                if (responseStatus) {
                    console.error(`Response Status: ${responseStatus}`);
                }
                return null;
            }
        });
    }
    /**
     * Extracts the HTML string containing articles from the AJAX response array.
     */
    extractHtmlFromAjaxResponse(responseData) {
        const insertCommand = responseData.find((item) => item.command === AJAX_COMMAND_INSERT);
        if (insertCommand === null || insertCommand === void 0 ? void 0 : insertCommand.data) {
            console.log("Found list data using 'insert' command.");
            return insertCommand.data;
        }
        const showMoreCommand = responseData.find((item) => item.command === AJAX_COMMAND_SHOW_MORE);
        if (showMoreCommand === null || showMoreCommand === void 0 ? void 0 : showMoreCommand.data) {
            console.log("Found list data using 'viewsShowMore' command (fallback).");
            return showMoreCommand.data;
        }
        console.error("Could not find command with HTML data ('insert' or 'viewsShowMore') in AJAX response.");
        return null;
    }
    /**
     * Parses article list items (title, url, time) from an HTML string.
     */
    parseListHtml(html) {
        try {
            const $ = cheerio.load(html);
            const articles = [];
            $("a.card").each((_index, element) => {
                const card = $(element);
                const title = card.find(".titulo").text().trim();
                const relativeUrl = card.attr("href");
                const timeString = card.find(".epigrafe").text().trim();
                if (title && relativeUrl) {
                    try {
                        const url = new URL(relativeUrl, SITE_BASE_URL).toString();
                        articles.push({ title, url, time: timeString || undefined });
                    }
                    catch (e) {
                        console.warn(`Skipping list item: Error constructing URL for ${relativeUrl}: ${e.message}`);
                    }
                }
            });
            console.log(`Parsed ${articles.length} article list items from HTML chunk.`);
            return articles;
        }
        catch (parseError) {
            console.error(`Error parsing list HTML: ${parseError.message}`);
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
            console.log(`Scraping details for ${articleListItems.length} articles...`);
            const articleScraper = new TeleTreceArticle_scraper_1.default();
            // Consider adding concurrency control here (e.g., p-limit) if scraping many articles
            const detailedArticlesPromises = articleListItems.map((item) => articleScraper.scrapeArticle(item.url));
            const settledResults = yield Promise.allSettled(detailedArticlesPromises);
            const successfulDetailedArticles = [];
            settledResults.forEach((result, index) => {
                var _a;
                if (result.status === "fulfilled" && result.value) {
                    successfulDetailedArticles.push(result.value);
                }
                else if (result.status === "rejected") {
                    console.warn(`Failed to scrape article ${(_a = articleListItems[index]) === null || _a === void 0 ? void 0 : _a.url}: ${result.reason}`);
                }
                // Handle fulfilled but null results if needed (already logged in scrapeArticle)
            });
            console.log(`Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} articles.`);
            return successfulDetailedArticles;
        });
    }
    filterAndTag(articles) {
        return __awaiter(this, void 0, void 0, function* () {
            const articlesWithAnalysis = yield Promise.all(articles.map(utils_1.generateAndAddAnalysisToArticle));
            return articlesWithAnalysis;
        });
    }
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Starting scrape process for ${this.numberOfPagesToScrape} page(s)...`);
            let allArticleListItems = [];
            for (let i = 0; i < this.numberOfPagesToScrape; i++) {
                const pageNumber = i;
                const pageData = yield this.fetchListPageData(pageNumber);
                if (!pageData) {
                    console.warn(`Skipping page ${pageNumber} due to fetch error.`);
                    continue; // Optionally break or implement retries
                }
                const html = this.extractHtmlFromAjaxResponse(pageData);
                if (!html) {
                    console.warn(`Skipping page ${pageNumber} due to missing HTML data in response.`);
                    continue;
                }
                const listItems = this.parseListHtml(html);
                allArticleListItems.push(...listItems);
                console.log(`Finished processing page ${pageNumber}. Total list items so far: ${allArticleListItems.length}`);
            }
            if (allArticleListItems.length === 0) {
                console.log("No article list items found across all pages. Exiting scrape.");
                return [];
            }
            const uniqueArticleListItems = Array.from(new Map(allArticleListItems.map((item) => [item.url, item])).values());
            console.log(`Total unique article list items found: ${uniqueArticleListItems.length}`);
            const detailedArticles = yield this.scrapeArticleDetails(uniqueArticleListItems);
            try {
                const finalArticles = yield this.filterAndTag(detailedArticles);
                console.log(`Scrape process completed. Returning ${finalArticles.length} final articles.`);
                yield (0, data_source_1.saveArticles)(finalArticles);
                return finalArticles;
            }
            catch (error) {
                console.error(`Error during final filtering/tagging or saving: ${error.message}`);
                console.log(`Scrape process completed with error. Returning ${detailedArticles.length} unfiltered/unsaved detailed articles.`);
                return detailedArticles; // Return successfully scraped articles even if saving/filtering fails
            }
        });
    }
}
exports.default = TeleTreceScraper;
