import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";

// Placeholder selectors - these need to be verified by inspecting an actual La Nacion article page
const ARTICLE_TITLE_SELECTOR = 'h1.entry-title'; // Example selector, needs verification
const ARTICLE_CONTENT_SELECTOR = '.td-post-content'; // Example selector, needs verification
const ARTICLE_DATE_SELECTOR = 'time.entry-date'; // Example selector, needs verification

class LaNacioneScraper {
    private async fetchArticleHtml(url: string): Promise<string | null> {
        try {
            console.log(`Fetching article: ${url}`);
            const response = await axios.get<string>(url, {
                headers: { // Use standard browser headers
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                }
            });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const responseStatus = (error as any)?.response?.status;
            console.error(`Error fetching La Nacion article ${url}: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`);
            return null;
        }
    }

    private parseArticleHtml(html: string, url: string): Omit<ScrapedArticleDetail, 'analysis'> | null {
        try {
            const $ = cheerio.load(html);

            const title = $(ARTICLE_TITLE_SELECTOR).first().text().trim();
            const content = $(ARTICLE_CONTENT_SELECTOR).text().trim(); // Adjust based on actual structure (might need .html() or more specific selection)
            const publishedDateString = $(ARTICLE_DATE_SELECTOR).attr('datetime'); // Or .text() depending on the element

            if (!title || !content) {
                console.warn(`Could not extract title or content for La Nacion article: ${url}`);
                return null;
            }

            let isoPublishedDate: string | undefined = undefined;
            if (publishedDateString) {
                try {
                    isoPublishedDate = new Date(publishedDateString).toISOString();
                } catch (e) {
                    console.warn(`Could not parse date string "${publishedDateString}" for La Nacion article ${url}: ${(e as Error).message}`);
                }
            }

            return {
                url,
                title,
                author: AuthorSource.LaNacion, // Set source
                publishedDate: isoPublishedDate,
                content: content, // Perform cleaning if necessary
            };
        } catch (parseError) {
            console.error(`Error parsing La Nacion article HTML for ${url}: ${(parseError as Error).message}`);
            return null;
        }
    }

    public async scrapeArticle(url: string): Promise<Omit<ScrapedArticleDetail, 'analysis'> | null> {
        const html = await this.fetchArticleHtml(url);
        if (!html) {
            return null;
        }
        return this.parseArticleHtml(html, url);
    }
}

export default LaNacionArticleScraper; 