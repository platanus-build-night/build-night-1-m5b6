import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";
import { generateAndAddAnalysisToArticle } from "../../utils";
import { saveArticles } from "../../../data-source";
import { Article } from "../../../models/articles.model";
// Import the actual article scraper
import ElMostradorArticleScraper from './ElMostradorArticle.scraper';

// Interface for items extracted from the list page
interface ElMostradorListItem {
    title: string;
    url: string;
}

// Base URL for El Mostrador
const SITE_BASE_URL = "https://www.elmostrador.cl";

class ElMostradorScraper {
    /**
     * Fetches the HTML content of the El Mostrador homepage.
     */
    private async fetchHomepageHtml(): Promise<string | null> {
        try {
            console.log(`Fetching homepage: ${SITE_BASE_URL}/`);
            const response = await axios.get<string>(SITE_BASE_URL, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                }
            });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const responseStatus = (error as any)?.response?.status;
            console.error(
                `Error fetching El Mostrador homepage: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`
            );
            return null;
        }
    }

    /**
     * Parses the homepage HTML to extract article titles and URLs.
     */
    private parseHomepageHtml(html: string): ElMostradorListItem[] {
        try {
            const $ = cheerio.load(html);
            const articles: ElMostradorListItem[] = [];
            const seenUrls = new Set<string>();
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
                            } else {
                                 // console.log(`Skipping probable non-article link: ${url}`);
                            }
                        } catch (e) {
                             console.warn(`Skipping invalid URL: ${url} - ${(e as Error).message}`);
                        }
                     }
                }
            });

            console.log(`Parsed ${articles.length} unique article list items from El Mostrador homepage.`);
            return articles;
        } catch (parseError) {
            console.error(
                `Error parsing El Mostrador homepage HTML: ${(parseError as Error).message}`
            );
            return [];
        }
    }

     /**
     * Fetches and parses detailed content for multiple articles concurrently.
     */
    private async scrapeArticleDetails(
        articleListItems: ElMostradorListItem[]
    ): Promise<ScrapedArticleDetail[]> {
        if (articleListItems.length === 0) {
            return [];
        }
        console.log(`Scraping details for ${articleListItems.length} El Mostrador articles...`);

        const articleScraper = new ElMostradorArticleScraper();
        const detailedArticlesPromises = articleListItems.map((item) =>
            articleScraper.scrapeArticle(item.url)
        );

        const settledResults = await Promise.allSettled(detailedArticlesPromises);

        const successfulDetailedArticles: ScrapedArticleDetail[] = [];
        settledResults.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value) {
                if (result.value.content) {
                    successfulDetailedArticles.push(result.value);
                } else {
                    console.warn(
                        `Skipping El Mostrador article (no content found): ${articleListItems[index]?.url}`
                    );
                }
            } else if (result.status === "rejected") {
                console.warn(
                    `Failed to scrape El Mostrador article ${articleListItems[index]?.url}: ${result.reason}`
                );
            }
        });

        console.log(
            `Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} El Mostrador articles.`
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
     * Main scraping method for El Mostrador.
     */
    public async scrape(): Promise<ScrapedArticleDetail[]> {
        console.log("Starting El Mostrador scrape process...");

        const homepageHtml = await this.fetchHomepageHtml();
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
        const detailedArticles = await this.scrapeArticleDetails(articleListItems);

        if (detailedArticles.length === 0) {
             console.log(
                "No El Mostrador articles with content could be scraped. Exiting scrape."
            );
            return [];
        }

        // Filter, tag, and save
        try {
            const finalArticles = await this.filterAndTag(detailedArticles);
            console.log(`Analysis added to ${finalArticles.length} El Mostrador articles.`);

            await saveArticles(finalArticles as Article[]);
            console.log(`Successfully saved ${finalArticles.length} El Mostrador articles.`);

            return finalArticles;
        } catch (error) {
            console.error(
                `Error during final processing/saving for El Mostrador: ${(error as Error).message}`
            );
            return detailedArticles;
        }
    }
}

export default ElMostradorScraper; 