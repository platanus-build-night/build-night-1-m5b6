import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, ScrapedArticle } from '../base/BaseScraper';

// Define the expected structure of the AJAX response item containing HTML
interface AjaxResponseItem {
  command: string;
  data?: string;
  // Add other fields if needed, based on the actual response structure
}

class TeleTreceScraper extends BaseScraper {
  private ajaxUrl = 'https://www.t13.cl/views/ajax?_wrapper_format=drupal_ajax';

  constructor() {
    super('https://www.t13.cl');
  }

  // Override fetchHtml to make the specific POST request
  protected async fetchHtml(url: string): Promise<string | null> {
    // Note: The 'url' parameter (this.siteUrl) isn't directly used for fetching
    // in this overridden method, but the base class structure passes it.
    // We use this.ajaxUrl instead.

    // Construct the form data payload. Let's start with page 0.
    // You might need to adjust view_dom_id if it's dynamic.
    const formData = new URLSearchParams({
      view_name: 't13_loultimo_seccion',
      view_display_id: 'page_1',
      view_args: '',
      view_path: '/lo-ultimo',
      view_base_path: 'lo-ultimo',
      view_dom_id: '2f9e6a936fa9215c52b1d4e9c098bccf19bc6da3191da3d4139b7a32ef76902d', // This might need to be dynamic
      pager_element: '0',
      page: '0', // Fetch the first page initially
      _drupal_ajax: '1',
      'ajax_page_state[theme]': 't13_v1',
      'ajax_page_state[theme_token]': '',
      'ajax_page_state[libraries]': 'ads13/ads-management,system/base,views/views.ajax,views/views.module,views_show_more/views_show_more'
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', // Mimic browser
      // Add other headers from your curl command if necessary (e.g., Referer)
      'Referer': 'https://www.t13.cl/lo-ultimo' 
    };

    try {
      const response = await axios.post<AjaxResponseItem[]>(this.ajaxUrl, formData.toString(), { headers });

      if (Array.isArray(response.data) && response.data.length > 1) {
        // Find the element with the HTML data (assuming it's the second one with command 'viewsShowMore')
        const viewData = response.data.find(item => item.command === 'viewsShowMore');
        if (viewData && typeof viewData.data === 'string') {
          return viewData.data; // Return the HTML string
        }
      }
      console.error(`Could not find expected HTML data in AJAX response from ${this.ajaxUrl}`);
      return null;
    } catch (error) {
      console.error(`Error fetching AJAX data from ${this.ajaxUrl}:`, error);
      return null;
    }
  }

  protected async parse(html: string): Promise<ScrapedArticle[]> {
    console.log(`Parsing HTML from ${this.ajaxUrl}...`);
    const $ = cheerio.load(html);
    const articles: ScrapedArticle[] = [];

    $('a.card').each((_index, element) => {
      const card = $(element);
      const title = card.find('.titulo').text().trim();
      const relativeUrl = card.attr('href');
      const timeString = card.find('.epigrafe').text().trim();

      if (title && relativeUrl) {
        try {
          const url = new URL(relativeUrl, this.siteUrl).toString();
          articles.push({ 
            title, 
            url, 
            contentSnippet: timeString, // Use time string as snippet
            // publishedDate: undefined // Parsing timeString to Date needs more logic
          });
        } catch (e) {
          console.error(`Error constructing URL for ${relativeUrl}:`, e);
        }
      }
    });

    console.log(`Parsed ${articles.length} articles.`);
    return articles;
  }

  protected async filterAndTag(articles: ScrapedArticle[]): Promise<ScrapedArticle[]> {
     console.log(`Filtering and tagging ${articles.length} articles from ${this.siteUrl}...`);
     // Placeholder: No filtering/tagging applied yet
     return articles;
  }

  // Inherits the public scrape() method which calls fetchHtml, parse, and filterAndTag.
}

export default TeleTreceScraper; 