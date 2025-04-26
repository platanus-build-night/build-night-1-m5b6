import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";

class ElPaisArticleScraper {
  private async fetchArticleHtml(url: string): Promise<string | null> {
    try {
      console.log(`Fetching El País article: ${url}`);
      const response = await axios.get<string>(url, {
        headers: {
          // Standard browser headers
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        },
        // El País might require handling redirects or specific statuses
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Allow redirects (3xx)
        },
      });
      if (typeof response.data === "string") {
        return response.data;
      }
      console.error(`Fetched data is not a string from ${url}`);
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const responseStatus = (error as any)?.response?.status;
      console.error(
        `Error fetching El País article ${url}: ${message}${
          responseStatus ? ` (Status: ${responseStatus})` : ""
        }`
      );
      return null;
    }
  }

  // Parses the main content from the article HTML
  private parseContent(html: string, url: string): ScrapedArticleDetail {
    const $ = cheerio.load(html);

    // Extract metadata and content based on El País structure
    const title = $("article#main-content header h1.a_t").text().trim();
    // Sometimes there are multiple authors listed, get the first one for simplicity
    const authorName = $("div.a_md_a a.a_md_a_n").first().text().trim();
    // Get date from the link's data-date attribute
    const publishedDateString = $("div.a_md_f a").attr("data-date");

    let isoPublishedDate: string | undefined = undefined;
    if (publishedDateString) {
      try {
        // The date string seems to be ISO 8601 compliant already
        isoPublishedDate = new Date(publishedDateString).toISOString();
      } catch (e) {
        console.warn(
          `Could not parse date string "${publishedDateString}" for El País article ${url}: ${
            (e as Error).message
          }`
        );
      }
    }

    // --- Content Extraction ---
    let content = "";
    const mainContentContainer = $("div.a_c"); // Main content div

    if (mainContentContainer.length > 0) {
      console.log(`Extracting content using 'div.a_c p' strategy for ${url}`);
      mainContentContainer.find("p").each((_idx, el) => {
        const text = $(el).text().trim();
        // Avoid adding empty paragraphs or paragraphs that might just contain ads/links
        if (text && $(el).parents("aside").length === 0) {
          // Basic check to avoid paragraphs in asides
          content += text + "\n\n";
        }
      });
    } else {
      console.warn(
        `Main content container 'div.a_c' not found for ${url}. Content might be missing.`
      );
      // Add fallback strategies if needed (e.g., JSON-LD, though less likely for El País)
    }

    // If content is still empty, log a warning
    if (!content.trim()) {
      console.warn(`Could not extract meaningful content for article: ${url}`);
    }

    return {
      url,
      title: title || undefined,
      author: AuthorSource.ElPais,
      publishedDate: isoPublishedDate,
      content: content.trim(),
    };
  }

  // Public method to scrape a single article
  public async scrapeArticle(
    url: string
  ): Promise<ScrapedArticleDetail | null> {
    const html = await this.fetchArticleHtml(url);
    if (!html) {
      console.error(`Failed to get HTML for El País article: ${url}`);
      return null;
    }
    try {
      const articleDetail = this.parseContent(html, url);
      if (!articleDetail.content) {
        console.warn(
          `El País article content appears empty after parsing: ${url}`
        );
        // Decide if empty content should still be returned or treated as an error (returning null here)
        // return null;
      }
      return articleDetail;
    } catch (error) {
      console.error(`Error parsing El País article content for ${url}:`, error);
      return null;
    }
  }
}

export default ElPaisArticleScraper;
