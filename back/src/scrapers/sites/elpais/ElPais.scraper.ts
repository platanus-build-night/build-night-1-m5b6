import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";
import { generateAndAddAnalysisToArticle } from "../../utils";
import { saveArticles } from "../../../data-source";
import { Article } from "../../../models/articles.model";
// Import the actual article scraper
import ElPaisArticleScraper from "./ElPaisArticle.scraper";

// Interface for items extracted from the list page
interface ElPaisListItem {
  title: string;
  url: string;
}

// Base URL for El País
const SITE_BASE_URL = "https://elpais.com";
const LIST_PAGE_URL = `${SITE_BASE_URL}/chile/actualidad/`;

class ElPaisScraper {
  /**
   * Fetches the HTML content of the El País Chile actuality page.
   */
  private async fetchListPageHtml(): Promise<string | null> {
    try {
      console.log(`Fetching list page: ${LIST_PAGE_URL}`);
      const response = await axios.get<string>(LIST_PAGE_URL, {
        headers: {
          // Standard browser headers
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        },
      });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const responseStatus = (error as any)?.response?.status;
      console.error(
        `Error fetching El País list page: ${message}${
          responseStatus ? ` (Status: ${responseStatus})` : ""
        }`
      );
      return null;
    }
  }

  /**
   * Parses the list page HTML to extract article titles and URLs.
   */
  private parseListPageHtml(html: string): ElPaisListItem[] {
    try {
      const $ = cheerio.load(html);
      const articles: ElPaisListItem[] = [];
      console.log("Parsing El País list page HTML...");

      // Select each article card within the main content area
      $("main#main-content article.c.c-d").each((_index, element) => {
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
          } catch (e) {
            console.warn(
              `Skipping list item: Invalid URL found: ${relativeUrl} - ${
                (e as Error).message
              }`
            );
          }
        } else {
          console.warn(
            "Skipping article card: Could not find title or URL.",
            card.html()?.substring(0, 100) + "..."
          ); // Log part of the card HTML for debugging
        }
      });

      console.log(
        `Parsed ${articles.length} article list items from El País page.`
      );
      return articles;
    } catch (parseError) {
      console.error(
        `Error parsing El País list page HTML: ${(parseError as Error).message}`
      );
      return [];
    }
  }

  /**
   * Fetches and parses detailed content for multiple articles concurrently.
   */
  private async scrapeArticleDetails(
    articleListItems: ElPaisListItem[]
  ): Promise<ScrapedArticleDetail[]> {
    if (articleListItems.length === 0) {
      return [];
    }
    console.log(
      `Scraping details for ${articleListItems.length} El País articles...`
    );

    const articleScraper = new ElPaisArticleScraper();
    // Consider adding concurrency control (e.g., p-limit)
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
            `Skipping El País article (no content found): ${articleListItems[index]?.url}`
          );
        }
      } else if (result.status === "rejected") {
        console.warn(
          `Failed to scrape El País article ${articleListItems[index]?.url}: ${result.reason}`
        );
      }
    });

    console.log(
      `Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} El País articles.`
    );
    return successfulDetailedArticles;
  }

  /**
   * Filters and tags articles using the analysis utility.
   */
  protected async filterAndTag(
    articles: ScrapedArticleDetail[]
  ): Promise<ScrapedArticleDetail[]> {
    // Ensure AuthorSource.ElPais exists in your types/enum before using it
    // For now, we'll map it - adjust if needed
    const articlesWithCorrectSource = articles.map((a) => ({
      ...a,
      author: AuthorSource.ElPais as any,
    }));

    const articlesWithAnalysis = await Promise.all(
      articlesWithCorrectSource.map(generateAndAddAnalysisToArticle)
    );
    return articlesWithAnalysis;
  }

  /**
   * Main scraping method for El País Chile.
   */
  public async scrape(): Promise<ScrapedArticleDetail[]> {
    console.log("Starting El País (Chile) scrape process...");

    const listPageHtml = await this.fetchListPageHtml();
    if (!listPageHtml) {
      console.error("Failed to fetch El País list page. Exiting scrape.");
      return [];
    }

    const articleListItems = this.parseListPageHtml(listPageHtml);
    if (articleListItems.length === 0) {
      console.log(
        "No article list items found on El País page. Exiting scrape."
      );
      return [];
    }

    const uniqueArticleListItems = Array.from(
      new Map(articleListItems.map((item) => [item.url, item])).values()
    );
    console.log(
      `Found ${uniqueArticleListItems.length} unique article list items.`
    );

    // Scrape details using the actual implementation
    const detailedArticles = await this.scrapeArticleDetails(
      uniqueArticleListItems
    );

    // If after scraping details, no articles have content, log and exit
    if (detailedArticles.length === 0) {
      console.log(
        "No El País articles with content could be scraped. Exiting scrape."
      );
      return [];
    }

    // Filter, tag, and save
    try {
      const finalArticles = await this.filterAndTag(detailedArticles);
      console.log(
        `Analysis added to ${finalArticles.length} El País articles.`
      );

      await saveArticles(finalArticles as Article[]);
      console.log(
        `Successfully saved ${finalArticles.length} El País articles.`
      );

      return finalArticles;
    } catch (error) {
      console.error(
        `Error during final processing/saving for El País: ${
          (error as Error).message
        }`
      );
      return detailedArticles; // Return successfully scraped (but potentially unprocessed) articles
    }
  }
}

export default ElPaisScraper;
