import axios from "axios";
import { ScrapedArticleDetail, AuthorSource } from "../../types";

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
    console.log(`Initialized EmolScraper: pages=${this.numberOfPages}, size=${this.pageSize}`);
  }

  /**
   * Fetches one "page" of the EMOL API (size items starting from `from`).
   */
  private async fetchPage(from: number): Promise<EmolApiResponse | null> {
    const url = `${EmolScraper.BASE_URL}${EmolScraper.ENDPOINT}/nacional/0`;
    const params = { size: this.pageSize, from };
    console.log(`Fetching EMOL page: from=${from}, size=${this.pageSize}`);

    try {
      const response = await axios.get<EmolApiResponse>(url, { params });
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error fetching EMOL data (from=${from}): ${message}`);
      return null;
    }
  }

  /**
   * Helper to decode unicode escapes and HTML entities, then strip tags.
   */
  private cleanHtmlContent(rawContent: string | undefined): string {
    if (!rawContent) return "";

    try {
      // 1. Decode basic unicode escapes (like \u003C -> <)
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
      return {
        url: src.permalink,
        title: src.titulo?.trim(),
        author: AuthorSource.Emol, // Always set author to Emol
        publishedDate: src.fechaPublicacion,
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
      console.log(`Page ${page} complete, total articles so far: ${allArticles.length}`);
    }

    // Deduplicate by URL
    const unique = Array.from(
      new Map(allArticles.map(a => [a.url, a])).values()
    );
    console.log(`Scrape complete: ${unique.length} unique articles found.`);
    return unique;
  }
}

export default EmolScraper;
