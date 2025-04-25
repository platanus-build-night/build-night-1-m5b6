import axios from "axios";
import * as cheerio from "cheerio";
import TeleTreceArticleScraper, { ScrapedArticleDetail } from './TeleTreceArticle.scraper'; // Import the article scraper

// Interface for the initial list item parsed from the AJAX response
interface ArticleListItem {
  title: string;
  url: string;
  time?: string;
}

// Define the structure of the Ajax response items
interface AjaxResponseItem {
  command: string;
  data?: string;
}

class TeleTreceScraper {
  private url = "https://www.t13.cl/views/ajax?_wrapper_format=drupal_ajax";

  // Fetches the initial AJAX response containing the list HTML
  protected async fetchListHtml(): Promise<AjaxResponseItem[] | null> {
    console.log("Fetching article list HTML...");
    const formData = new URLSearchParams({
      view_name: "t13_loultimo_seccion",
      view_display_id: "page_1",
      view_args: "",
      view_path: "/lo-ultimo",
      view_base_path: "lo-ultimo",
      view_dom_id: "2f9e6a936fa9215c52b1d4e9c098bccf19bc6da3191da3d4139b7a32ef76902d",
      pager_element: "0",
      page: "0",
      _drupal_ajax: "1",
      "ajax_page_state[theme]": "t13_v1",
      "ajax_page_state[theme_token]": "",
      "ajax_page_state[libraries]": "ads13/ads-management,system/base,views/views.ajax,views/views.module,views_show_more/views_show_more",
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    try {
      const response = await axios.post<AjaxResponseItem[]>(this.url, formData, { headers });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.error("List response data is not an array:", response.data);
      return null;
    } catch (error) {
      console.error(`Error fetching article list AJAX data from ${this.url}:`, error);
      return null;
    }
  }

  // Parses the list of articles from the AJAX response array
  protected async parseList(responseData: AjaxResponseItem[]): Promise<ArticleListItem[]> {
    console.log(`Attempting to parse article list response array...`);
    const insertCommandData = responseData.find(item => item.command === 'insert');
    const viewsShowMoreData = responseData.find(item => item.command === 'viewsShowMore');

    let html: string | undefined;
    if (insertCommandData && typeof insertCommandData.data === 'string') {
      html = insertCommandData.data;
      console.log("Found list data using 'insert' command.");
    } else if (viewsShowMoreData && typeof viewsShowMoreData.data === 'string') {
      html = viewsShowMoreData.data;
      console.log("Found list data using 'viewsShowMore' command.");
    } else {
      console.error("Could not find 'insert' or 'viewsShowMore' command with HTML data in list response.");
      return [];
    }

    return this.parseListHtml(html);
  }

  // Parses article list items from HTML
  private parseListHtml(html: string): ArticleListItem[] {
    const $ = cheerio.load(html);
    const articles: ArticleListItem[] = [];
    const siteBaseUrl = 'https://www.t13.cl';

    $('a.card').each((_index, element) => {
      const card = $(element);
      const title = card.find('.titulo').text().trim();
      const relativeUrl = card.attr('href');
      const timeString = card.find('.epigrafe').text().trim();

      if (title && relativeUrl) {
        try {
          const url = new URL(relativeUrl, siteBaseUrl).toString();
          articles.push({ title, url, time: timeString || undefined });
        } catch (e) {
          console.error(`Error constructing URL for list item ${relativeUrl}:`, e);
        }
      }
    });
    console.log(`Parsed ${articles.length} article list items from HTML.`);
    return articles;
  }

  // Optional filter/tag step for the *detailed* articles
  protected async filterAndTag(articles: ScrapedArticleDetail[]): Promise<ScrapedArticleDetail[]> {
    console.log(`Filtering and tagging ${articles.length} detailed articles...`);
    // Add any filtering/tagging logic for the full articles here
    return articles;
  }

  // Main method to scrape the list and then individual articles
  public async scrape(): Promise<ScrapedArticleDetail[]> {
    const listResponseData = await this.fetchListHtml(); // Fetch the list

    if (!listResponseData) {
      console.error("Scraping failed: No list response data received");
      return [];
    }

    let articleListItems: ArticleListItem[] = [];
    try {
      articleListItems = await this.parseList(listResponseData); // Parse the list
    } catch (error) {
      console.error("Error parsing article list:", error);
      return [];
    }

    if (articleListItems.length === 0) {
        console.log("No article list items found to scrape details for.");
        return [];
    }

    console.log(`Found ${articleListItems.length} articles in list. Scraping details...`);
    const articleScraper = new TeleTreceArticleScraper();
    const detailedArticlesPromises = articleListItems.map(item => 
        articleScraper.scrapeArticle(item.url) // Call the article scraper for each URL
    );

    // Wait for all article scraping promises to resolve
    const detailedArticlesResults = await Promise.all(detailedArticlesPromises);

    // Filter out any null results (errors during individual scraping)
    const successfulDetailedArticles = detailedArticlesResults.filter(
        (article): article is ScrapedArticleDetail => article !== null
    );

    console.log(`Successfully scraped details for ${successfulDetailedArticles.length} articles.`);

    // Run the final filter/tag step on the detailed articles
    try {
        const finalArticles = await this.filterAndTag(successfulDetailedArticles);
        return finalArticles;
    } catch (error) {
        console.error("Error during final filtering/tagging:", error);
        return successfulDetailedArticles; // Return successfully scraped articles even if filtering fails
    }
  }
}

export default TeleTreceScraper;
