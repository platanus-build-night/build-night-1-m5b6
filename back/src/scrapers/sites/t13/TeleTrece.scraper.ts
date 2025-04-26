import axios from "axios";
import * as cheerio from "cheerio";
import TeleTreceArticleScraper, {
  ScrapedArticleDetail,
} from "./TeleTreceArticle.scraper";
import { AuthorSource } from "../../types"; // Import Enums from main types file
import { Sentiment, Topic } from "../../../mastra/types"; // Correct path for enums
import {
  articleAnalyzerAgent,
  ArticleAnalysisOutputSchema, // Import schema for validation
  ArticleAnalysisOutput, // Import output type
} from "../../../mastra/agents/articleAnalyzerAgent"; // Import the agent directly
import { generateAndAddAnalysisToArticle } from "../../utils";
import { saveArticles } from "../../../data-source";
import { Article } from "../../../models/articles.model"; // Correct import path for Article
// --- Interfaces ---
interface ArticleListItem {
  title: string;
  url: string;
  time?: string;
}

interface AjaxResponseItem {
  command: string;
  data?: string;
  // Other potential properties can be added here if needed
}

// --- Constants ---

const SITE_BASE_URL = "https://www.t13.cl";
const AJAX_URL = `${SITE_BASE_URL}/views/ajax?_wrapper_format=drupal_ajax`;
const AJAX_COMMAND_INSERT = "insert";
const AJAX_COMMAND_SHOW_MORE = "viewsShowMore";
const DEFAULT_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
};

class TeleTreceScraper {
  private readonly numberOfPagesToScrape: number;

  constructor(numberOfPages: number = 10) {
    // Default to scraping 1 page
    if (numberOfPages < 1) {
      throw new Error("Number of pages to scrape must be at least 1.");
    }
    this.numberOfPagesToScrape = numberOfPages;
    console.log(
      `Initialized TeleTreceScraper to scrape ${this.numberOfPagesToScrape} page(s).`
    );
  }

  /**
   * Fetches the AJAX response for a specific page number containing article list HTML.
   */
  private async fetchListPageData(
    pageNumber: number
  ): Promise<AjaxResponseItem[] | null> {
    const formData = new URLSearchParams({
      view_name: "t13_loultimo_seccion",
      view_display_id: "page_1",
      view_args: "",
      view_path: "/lo-ultimo",
      view_base_path: "lo-ultimo",
      // TODO: Investigate if view_dom_id is static or needs dynamic fetching
      view_dom_id:
        "2f9e6a936fa9215c52b1d4e9c098bccf19bc6da3191da3d4139b7a32ef76902d",
      pager_element: "0",
      page: pageNumber.toString(),
      _drupal_ajax: "1",
      "ajax_page_state[theme]": "t13_v1",
      "ajax_page_state[theme_token]": "",
      "ajax_page_state[libraries]":
        "ads13/ads-management,system/base,views/views.ajax,views/views.module,views_show_more/views_show_more",
    });

    try {
      const response = await axios.post<AjaxResponseItem[]>(
        AJAX_URL,
        formData,
        { headers: DEFAULT_HEADERS }
      );

      if (!Array.isArray(response.data)) {
        console.error(
          `Received non-array data for page ${pageNumber}:`,
          response.data
        );
        return null;
      }
      return response.data;
    } catch (error) {
      // Use generic error handling, checking for common properties
      const message = error instanceof Error ? error.message : String(error);
      const responseStatus = (error as any)?.response?.status;
      if (responseStatus) {
        console.error(`Response Status: ${responseStatus}`);
      }
      return null;
    }
  }

  /**
   * Extracts the HTML string containing articles from the AJAX response array.
   */
  private extractHtmlFromAjaxResponse(
    responseData: AjaxResponseItem[]
  ): string | null {
    const insertCommand = responseData.find(
      (item) => item.command === AJAX_COMMAND_INSERT
    );
    if (insertCommand?.data) {
      console.log("Found list data using 'insert' command.");
      return insertCommand.data;
    }

    const showMoreCommand = responseData.find(
      (item) => item.command === AJAX_COMMAND_SHOW_MORE
    );
    if (showMoreCommand?.data) {
      console.log("Found list data using 'viewsShowMore' command (fallback).");
      return showMoreCommand.data;
    }

    console.error(
      "Could not find command with HTML data ('insert' or 'viewsShowMore') in AJAX response."
    );
    return null;
  }

  /**
   * Parses article list items (title, url, time) from an HTML string.
   */
  private parseListHtml(html: string): ArticleListItem[] {
    try {
      const $ = cheerio.load(html);
      const articles: ArticleListItem[] = [];

      $("a.card").each((_index, element) => {
        const card = $(element);
        const title = card.find(".titulo").text().trim();
        const relativeUrl = card.attr("href");
        const timeString = card.find(".epigrafe").text().trim();

        if (title && relativeUrl) {
          try {
            const url = new URL(relativeUrl, SITE_BASE_URL).toString();
            articles.push({ title, url, time: timeString || undefined });
          } catch (e) {
            console.warn(
              `Skipping list item: Error constructing URL for ${relativeUrl}: ${
                (e as Error).message
              }`
            );
          }
        }
      });
      console.log(
        `Parsed ${articles.length} article list items from HTML chunk.`
      );
      return articles;
    } catch (parseError) {
      console.error(
        `Error parsing list HTML: ${(parseError as Error).message}`
      );
      return [];
    }
  }

  /**
   * Fetches and parses detailed content for multiple articles concurrently.
   */
  private async scrapeArticleDetails(
    articleListItems: ArticleListItem[]
  ): Promise<ScrapedArticleDetail[]> {
    if (articleListItems.length === 0) {
      return [];
    }
    console.log(`Scraping details for ${articleListItems.length} articles...`);

    const articleScraper = new TeleTreceArticleScraper();
    // Consider adding concurrency control here (e.g., p-limit) if scraping many articles
    const detailedArticlesPromises = articleListItems.map((item) =>
      articleScraper.scrapeArticle(item.url)
    );

    const settledResults = await Promise.allSettled(detailedArticlesPromises);

    const successfulDetailedArticles: ScrapedArticleDetail[] = [];
    settledResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        successfulDetailedArticles.push(result.value);
      } else if (result.status === "rejected") {
        console.warn(
          `Failed to scrape article ${articleListItems[index]?.url}: ${result.reason}`
        );
      }
      // Handle fulfilled but null results if needed (already logged in scrapeArticle)
    });

    console.log(
      `Successfully scraped details for ${successfulDetailedArticles.length} out of ${articleListItems.length} articles.`
    );
    return successfulDetailedArticles;
  }

  protected async filterAndTag(
    articles: ScrapedArticleDetail[]
  ): Promise<ScrapedArticleDetail[]> {
    const articlesWithAnalysis = await Promise.all(
      articles.map(generateAndAddAnalysisToArticle)
    );
    return articlesWithAnalysis;
  }

  public async scrape(): Promise<ScrapedArticleDetail[]> {
    console.log(
      `Starting scrape process for ${this.numberOfPagesToScrape} page(s)...`
    );
    let allArticleListItems: ArticleListItem[] = [];

    for (let i = 0; i < this.numberOfPagesToScrape; i++) {
      const pageNumber = i;
      const pageData = await this.fetchListPageData(pageNumber);
      if (!pageData) {
        console.warn(`Skipping page ${pageNumber} due to fetch error.`);
        continue; // Optionally break or implement retries
      }

      const html = this.extractHtmlFromAjaxResponse(pageData);
      if (!html) {
        console.warn(
          `Skipping page ${pageNumber} due to missing HTML data in response.`
        );
        continue;
      }

      const listItems = this.parseListHtml(html);
      allArticleListItems.push(...listItems);
      console.log(
        `Finished processing page ${pageNumber}. Total list items so far: ${allArticleListItems.length}`
      );
    }

    if (allArticleListItems.length === 0) {
      console.log(
        "No article list items found across all pages. Exiting scrape."
      );
      return [];
    }

    const uniqueArticleListItems = Array.from(
      new Map(allArticleListItems.map((item) => [item.url, item])).values()
    );
    console.log(
      `Total unique article list items found: ${uniqueArticleListItems.length}`
    );

    const detailedArticles = await this.scrapeArticleDetails(
      uniqueArticleListItems
    );

    try {
      const finalArticles = await this.filterAndTag(detailedArticles);
      console.log(
        `Scrape process completed. Returning ${finalArticles.length} final articles.`
      );
      await saveArticles(finalArticles as Article[]);
      return finalArticles;
    } catch (error) {
      console.error(
        `Error during final filtering/tagging or saving: ${(error as Error).message}`
      );
      console.log(
        `Scrape process completed with error. Returning ${detailedArticles.length} unfiltered/unsaved detailed articles.`
      );
      return detailedArticles; // Return successfully scraped articles even if saving/filtering fails
    }
  }
}

export default TeleTreceScraper;
