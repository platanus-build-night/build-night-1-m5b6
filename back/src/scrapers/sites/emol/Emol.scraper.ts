import axios from "axios";
import { ScrapedArticleDetail, AuthorSource } from "../../types";
import { generateAndAddAnalysisToArticle } from "../../utils";
import { saveArticles } from "../../../data-source";
import { Article } from "../../../models/articles.model";

interface EmolApiHit {
  _source: {
    autor?: string;
    fuente?: string;
    fechaPublicacion?: string;
    texto?: string;
    permalink: string;
    titulo?: string;
  };
}

interface EmolApiResponse {
  took: number;
  timed_out: boolean;
  hits: {
    total: number;
    hits: EmolApiHit[];
  };
}

class EmolScraper {
  private readonly numberOfPages: number;
  private readonly pageSize: number;
  private static readonly BASE_URL = "https://newsapi.ecn.cl";
  private static readonly ENDPOINT = "/NewsApi/emol/seccionFiltrada";

  /**
   * @param numberOfPages how many pages of results to fetch (each pageSize items)
   * @param pageSize items per page (max 100)
   */
  constructor(numberOfPages: number = 1, pageSize: number = 100) {
    if (numberOfPages < 1) {
      throw new Error("numberOfPages must be at least 1");
    }
    if (pageSize < 1 || pageSize > 100) {
      throw new Error("pageSize must be between 1 and 100");
    }
    this.numberOfPages = numberOfPages;
    this.pageSize = pageSize;
    console.log(
      `Initialized EmolScraper: pages=${this.numberOfPages}, size=${this.pageSize}`
    );
  }

  private async fetchPage(from: number): Promise<EmolApiResponse | null> {
    const url = `${EmolScraper.BASE_URL}${EmolScraper.ENDPOINT}/nacional/0`;
    const params = { size: this.pageSize, from };

    try {
      const response = await axios.get<EmolApiResponse>(url, { params });
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return null;
    }
  }

  private cleanHtmlContent(rawContent: string | undefined): string {
    if (!rawContent) return "";

    try {
      let text = rawContent.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) =>
        String.fromCharCode(parseInt(grp, 16))
      );

      // 2. Decode common HTML entities
      text = text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      // 3. Strip remaining HTML tags
      text = text.replace(/<[^>]*>/g, " ");

      // 4. Clean up whitespace
      text = text.replace(/\s\s+/g, " ").trim();

      return text;
    } catch (error) {
      console.error("Error cleaning content:", error);
      return rawContent; // Return raw content on error
    }
  }

  /**
   * Parses API response into our ScrapedArticleDetail interface.
   */
  private parseResponse(data: EmolApiResponse): ScrapedArticleDetail[] {
    const hits = data.hits?.hits || [];
    console.log(`Parsing ${hits.length} hits`);
    return hits.map((hit) => {
      const src = hit._source;
      const publishedDateString = src.fechaPublicacion;
      let isoPublishedDate: string | undefined = undefined;
      if (publishedDateString) {
        try {
          // Attempt to parse the date string and convert to ISO format (UTC)
          isoPublishedDate = new Date(publishedDateString).toISOString();
        } catch (e) {
          console.warn(
            `Could not parse date string "${publishedDateString}" for Emol article ${
              src.permalink
            }: ${(e as Error).message}`
          );
        }
      }

      return {
        url: src.permalink,
        title: src.titulo?.trim(),
        author: AuthorSource.Emol, // Always set author to Emol
        publishedDate: isoPublishedDate,
        content: this.cleanHtmlContent(src.texto), // Clean the content
      };
    });
  }

  /**
   * Public method: fetches and aggregates multiple pages of results.
   */
  public async scrape(): Promise<ScrapedArticleDetail[]> {
    console.log(`Starting EMOL scrape for ${this.numberOfPages} page(s)...`);
    const allArticles: ScrapedArticleDetail[] = [];

    for (let page = 0; page < this.numberOfPages; page++) {
      const from = page * this.pageSize;
      const pageData = await this.fetchPage(from);
      if (!pageData) {
        console.warn(`Skipping page ${page} due to fetch error.`);
        continue;
      }

      const articles = this.parseResponse(pageData);
      allArticles.push(...articles);
      console.log(
        `Page ${page} complete, total articles so far: ${allArticles.length}`
      );
    }

    // Deduplicate by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map((a) => [a.url, a])).values()
    );
    console.log(
      `Scrape complete: ${uniqueArticles.length} unique articles found.`
    );

    const analysedArticles = await Promise.all(
      uniqueArticles.map(generateAndAddAnalysisToArticle)
    );

    try {
      await saveArticles(analysedArticles as Article[]);
    } catch (error) {
      console.error(
        `Error saving analysed articles: ${(error as Error).message}`
      );
    }

    return analysedArticles;
  }
}

export default EmolScraper;
