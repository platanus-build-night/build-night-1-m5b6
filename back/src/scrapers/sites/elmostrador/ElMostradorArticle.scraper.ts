import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";

class ElMostradorArticleScraper {
    private async fetchArticleHtml(url: string): Promise<string | null> {
        try {
            console.log(`Fetching El Mostrador article: ${url}`);
            const response = await axios.get<string>(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                }
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
                `Error fetching El Mostrador article ${url}: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`
            );
            return null;
        }
    }

    // Parses the main content from the article HTML
    private parseContent(html: string, url: string): ScrapedArticleDetail {
        const $ = cheerio.load(html);

        // Extract metadata and content based on El Mostrador structure
        const title = $('h1.d-the-single__title').text().trim();
        const authorName = $('div.d-the-single-authors a.the-by__permalink').first().text().trim();
        const publishedDateString = $('time.d-the-single__date').attr('datetime');

        let isoPublishedDate: string | undefined = undefined;
        if (publishedDateString) {
            try {
                // Assuming the datetime attribute is in a format JS Date can parse (like YYYY-MM-DD)
                isoPublishedDate = new Date(publishedDateString).toISOString();
            } catch (e) {
                console.warn(`Could not parse date string "${publishedDateString}" for El Mostrador article ${url}: ${(e as Error).message}`);
            }
        }

        // --- Content Extraction ---
        let content = "";
        // Target paragraphs within the main text wrapper
        const mainContentContainer = $('div.d-the-single-wrapper__text');

        if (mainContentContainer.length > 0) {
             console.log(`Extracting content using 'div.d-the-single-wrapper__text p' strategy for ${url}`);
             mainContentContainer.find('p').each((_idx, el) => {
                 const text = $(el).text().trim();
                 if (text) { // Avoid empty paragraphs
                     content += text + "\n\n";
                 }
             });
        } else {
             console.warn(`Main content container 'div.d-the-single-wrapper__text' not found for ${url}. Content might be missing.`);
             // Fallback: Try the excerpt if main content fails?
             const excerpt = $('p.d-the-single__excerpt').text().trim();
             if (excerpt) {
                 console.log("Using excerpt as fallback content.");
                 content = excerpt;
             }
        }

        // If content is still empty, log a warning
        if (!content.trim()) {
           console.warn(`Could not extract meaningful content for article: ${url}`);
        }

        return {
            url,
            title: title || undefined,
            author: AuthorSource.ElMostrador,
            authorDetail: authorName || undefined, // Store the specific author if found
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
            console.error(`Failed to get HTML for El Mostrador article: ${url}`);
            return null;
        }
        try {
            const articleDetail = this.parseContent(html, url);
             if (!articleDetail.content) {
                 console.warn(`El Mostrador article content appears empty after parsing: ${url}`);
             }
            return articleDetail;
        } catch (error) {
            console.error(`Error parsing El Mostrador article content for ${url}:`, error);
            return null;
        }
    }
}

export default ElMostradorArticleScraper; 