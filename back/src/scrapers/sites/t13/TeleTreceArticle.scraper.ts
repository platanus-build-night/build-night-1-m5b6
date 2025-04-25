import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";

class TeleTreceArticleScraper {
  private async fetchArticleHtml(url: string): Promise<string | null> {
    console.log(`Fetching article HTML from: ${url}`);
    try {
      // Simple GET request, mimic browser User-Agent
      const response = await axios.get<string>(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        },
      });
      if (typeof response.data === "string") {
        return response.data;
      }
      console.error(`Fetched data is not a string from ${url}`);
      return null;
    } catch (error) {
      console.error(`Error fetching article HTML from ${url}:`, error);
      return null;
    }
  }

  // Parses the main content from the article HTML
  private parseContent(html: string, url: string): ScrapedArticleDetail {
    const $ = cheerio.load(html);

    // Find the main article container
    const mainArticle = $("main.articulo-detalle article");

    const title = mainArticle.find('h1[itemprop="headline"]').text().trim();
    const author = mainArticle.find(".autor a").text().trim();
    const publishedDate = mainArticle
      .find('time[itemprop="datePublished"]')
      .attr("datetime");

    // Select the core content area
    const contentElement = mainArticle.find(".cuerpo-content");

    // Remove known non-content elements before extracting text
    contentElement
      .find(
        ".ads13, .leetambien, .embed, #t13-envivo, #article-inread-desktop, .banner-google-news, #banner-13go, .articulo-categorias, .cuerpo-share"
      )
      .remove();

    // Extract text from relevant tags within the content area
    let content = "";
    contentElement.find("p, h2, h3, li").each((_idx, el) => {
      const text = $(el).text().trim();
      if (text) {
        content += text + "\n\n"; // Add paragraphs/newlines
      }
    });

    return {
      url,
      title: title || undefined,
      author: AuthorSource.T13,
      publishedDate: publishedDate || undefined,
      content: content.trim(), // Trim trailing newlines
    };
  }

  // Public method to scrape a single article
  public async scrapeArticle(
    url: string
  ): Promise<ScrapedArticleDetail | null> {
    const html = await this.fetchArticleHtml(url);
    if (!html) {
      console.error(`Failed to get HTML for article: ${url}`);
      return null;
    }
    try {
      const articleDetail = this.parseContent(html, url);
      return articleDetail;
    } catch (error) {
      console.error(`Error parsing article content for ${url}:`, error);
      return null;
    }
  }
}

export default TeleTreceArticleScraper;
export { ScrapedArticleDetail };
