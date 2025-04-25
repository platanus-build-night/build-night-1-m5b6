import axios from 'axios';

interface ScrapedArticle {
  title: string;
  url: string;
  contentSnippet?: string;
  publishedDate?: Date;
  tags?: string[];
}

abstract class BaseScraper {
  protected siteUrl: string;

  constructor(siteUrl: string) {
    this.siteUrl = siteUrl;
  }

  protected async fetchHtml(url: string): Promise<string | null> {
    try {
      const response = await axios.get<unknown>(url);
      if (typeof response.data === 'string') {
        return response.data;
      }
      console.error(`Fetched data is not a string from ${url}. Type: ${typeof response.data}`);
      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  protected abstract parse(html: string): Promise<ScrapedArticle[]>;

  protected abstract filterAndTag(articles: ScrapedArticle[]): Promise<ScrapedArticle[]>;

  public async scrape(): Promise<ScrapedArticle[]> {
    const html = await this.fetchHtml(this.siteUrl);
    if (!html) {
      console.error(`Scraping failed: Could not fetch HTML from ${this.siteUrl}`);
      return [];
    }

    try {
      const parsedArticles = await this.parse(html);
      const finalArticles = await this.filterAndTag(parsedArticles);
      return finalArticles;
    } catch (error) {
       console.error(`Error during parsing or filtering for ${this.siteUrl}:`, error);
       return [];
    }

  }
}

export { BaseScraper, ScrapedArticle };