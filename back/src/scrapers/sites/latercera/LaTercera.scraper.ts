import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";
import { generateAndAddAnalysisToArticle } from "../../utils";
import { saveArticles } from "../../../data-source";
import { Article } from "../../../models/articles.model";
import LaTerceraArticleScraper from "./LaTerceraArticle.scraper";

// Interface for items extracted from the list page
interface LaTerceraListItem {
    title: string;
    url: string;
}

// Base URL for La Tercera
const SITE_BASE_URL = "https://www.latercera.com";

class LaTerceraScraper {
    /**
     * Fetches the HTML content of the La Tercera homepage.
     */
    private async fetchHomepageHtml(): Promise<string | null> {
        try {
            console.log(`Fetching homepage: ${SITE_BASE_URL}/`);
            const response = await axios.get<string>(SITE_BASE_URL, {
                headers: {
                    // Add headers if necessary, e.g., User-Agent
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const responseStatus = (error as any)?.response?.status;
            console.error(
                `Error fetching La Tercera homepage: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`
            );
            return null;
        }
    }

    /**
     * Parses the homepage HTML to extract article titles and URLs.
     */
    private parseHomepageHtml(html: string): LaTerceraListItem[] {
        try {
            const $ = cheerio.load(html);
            const articles: LaTerceraListItem[] = [];
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
                    } catch (e) {
                        console.warn(
                            `Skipping list item: Error constructing URL for ${relativeUrl}: ${(e as Error).message}`
                        );
                    }
                } else {
                     // Fallback: try image link if headline link fails
                     const imageLink = card.find('.story-card__image a.base-link');
                     const imgRelativeUrl = imageLink.attr('href');
                     const imgTitle = imageLink.attr('aria-label') || card.find('.story-card__headline').text().trim() || 'Title not found'; // Try aria-label or headline text as fallback

                     if(imgRelativeUrl) {
                        try {
                            const url = new URL(imgRelativeUrl, SITE_BASE_URL).toString();
                             articles.push({ title: imgTitle, url });
                        } catch (e) {
                             console.warn(
                                `Skipping list item (fallback): Error constructing URL for ${imgRelativeUrl}: ${(e as Error).message}`
                            );
                        }
                     } else {
                        console.warn("Skipping card: Could not find title or URL.");
                     }
                }
            });

            console.log(`Parsed ${articles.length} article list items from homepage.`);
            return articles;
        } catch (parseError) {
            console.error(
                `Error parsing La Tercera homepage HTML: ${(parseError as Error).message}`
            );
            return [];
        }
    }

    /**
     * Fetches and parses detailed content for multiple articles concurrently.
     */
    private async scrapeArticleDetails(
        articleListItems: LaTerceraListItem[]
    ): Promise<ScrapedArticleDetail[]> {
        if (articleListItems.length === 0) {
            return [];
        }
        console.log(`Scraping details for ${articleListItems.length} La Tercera articles...`);

        const articleScraper = new LaTerceraArticleScraper();
        // Consider adding concurrency control here (e.g., p-limit) if scraping many articles
        const detailedArticlesPromises = articleListItems.map((item) =>
            articleScraper.scrapeArticle(item.url)
        );

        const settledResults = await Promise.allSettled(detailedArticlesPromises);

        const successfulDetailedArticles: ScrapedArticleDetail[] = [];
        settledResults.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value) {
                // Ensure the result has content before adding
                if (result.value.content) {
                    successfulDetailedArticles.push(result.value);
                } else {
                    console.warn(
                        `Skipping article (no content found): ${articleListItems[index]?.url}`
                    );
                }
            } else if (result.status === "rejected") {
                console.warn(
                    `Failed to scrape article ${articleListItems[index]?.url}: ${result.reason}`
                );
            }
            // Handle fulfilled but null results (already logged in scrapeArticle)
        });

        console.log(
            `Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} La Tercera articles.`
        );
        return successfulDetailedArticles;
    }

    /**
     * Filters and tags articles using the analysis utility.
     */
    protected async filterAndTag(
        articles: ScrapedArticleDetail[]
    ): Promise<ScrapedArticleDetail[]> {
        const articlesWithAnalysis = await Promise.all(
            articles.map(generateAndAddAnalysisToArticle)
        );
        return articlesWithAnalysis;
    }

    /**
     * Main scraping method for La Tercera.
     */
    public async scrape(): Promise<ScrapedArticleDetail[]> {
        console.log("Starting La Tercera scrape process...");

        const homepageHtml = await this.fetchHomepageHtml();
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
        const uniqueArticleListItems = Array.from(
            new Map(articleListItems.map((item) => [item.url, item])).values()
        );
        console.log(`Found ${uniqueArticleListItems.length} unique article list items.`);

        // Scrape details using the new method
        const detailedArticles = await this.scrapeArticleDetails(uniqueArticleListItems);

        // If after scraping details, no articles have content, log and exit
        if (detailedArticles.length === 0) {
             console.log(
                "No articles with content could be scraped. Exiting scrape."
            );
            return [];
        }

        // Filter, tag, and save
        try {
            // Filter/Tagging step (might be incomplete if content isn't scraped)
            const finalArticles = await this.filterAndTag(detailedArticles);
            console.log(`Analysis added to ${finalArticles.length} articles.`);

            // Save articles to the database
            await saveArticles(finalArticles as Article[]);
             console.log(`Successfully saved ${finalArticles.length} articles.`);

            return finalArticles;
        } catch (error) {
            console.error(
                `Error during final processing/saving: ${(error as Error).message}`
            );
            // Return successfully scraped (but potentially unprocessed) articles even if saving/filtering fails
            return detailedArticles;
        }
    }
}

export default LaTerceraScraper; 