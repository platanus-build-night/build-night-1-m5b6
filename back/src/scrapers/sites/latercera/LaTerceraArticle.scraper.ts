import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticleDetail, AuthorSource } from "../../types";

class LaTerceraArticleScraper {
    private async fetchArticleHtml(url: string): Promise<string | null> {
        try {
            console.log(`Fetching article: ${url}`);
            const response = await axios.get<string>(url, {
                headers: {
                    // Mimic browser headers
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
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
                `Error fetching article ${url}: ${message}${responseStatus ? ` (Status: ${responseStatus})` : ''}`
            );
            return null;
        }
    }

    // Parses the main content from the article HTML
    private parseContent(html: string, url: string): ScrapedArticleDetail {
        const $ = cheerio.load(html);

        // Extract metadata
        const title = $('meta[property="og:title"]').attr('content')?.trim();
        const publishedDateString = $('meta[property="article:published_time"]').attr('content');

        let isoPublishedDate: string | undefined = undefined;
        if (publishedDateString) {
            try {
                isoPublishedDate = new Date(publishedDateString).toISOString();
            } catch (e) {
                console.warn(`Could not parse date string "${publishedDateString}" for La Tercera article ${url}: ${(e as Error).message}`);
            }
        }

        // --- Content Extraction ---
        let content = "";

        // Strategy 1: Try finding a main content container and extracting <p> tags
        // Common La Tercera containers might be '.single-content', 'article .body', etc.
        // Let's inspect the provided example's structure.
        // The example has <div class="single-content content ..."
        const mainContentContainer = $('div.single-content'); // Adjust selector if needed

        if (mainContentContainer.length > 0) {
             console.log(`Using main content container strategy for ${url}`);
             mainContentContainer.find('p').each((_idx, el) => {
                 const text = $(el).text().trim();
                 if (text) {
                     content += text + "\n\n";
                 }
             });
        } else {
             // Strategy 2: Fallback to parsing JSON-LD if main container fails
             console.warn(`Main content container not found for ${url}. Trying JSON-LD.`);
             try {
                const jsonLdScript = $('script[type="application/ld+json"]').html();
                if (jsonLdScript) {
                    const jsonData = JSON.parse(jsonLdScript);
                    if (jsonData && jsonData.articleBody) {
                        content = jsonData.articleBody.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim(); // Basic HTML stripping
                         console.log(`Extracted content from JSON-LD for ${url}`);
                    } else {
                         console.warn(`JSON-LD found but no articleBody for ${url}.`);
                    }
                } else {
                    console.warn(`JSON-LD script not found for ${url}.`);
                }
             } catch(jsonError) {
                console.error(`Error parsing JSON-LD for ${url}: ${(jsonError as Error).message}`);
             }
        }

         // If content is still empty after both strategies, log a warning
        if (!content) {
           console.warn(`Could not extract content for article: ${url}`);
           // Strategy 3: As a last resort, grab all <p> tags in the body? Risky.
           // $('body').find('p').each... - uncomment if desperate
        }


        return {
            url,
            title: title || undefined, // Use extracted title or undefined
            author: AuthorSource.LaTercera, // Use the enum value
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
            console.error(`Failed to get HTML for article: ${url}`);
            return null;
        }
        try {
            const articleDetail = this.parseContent(html, url);
             if (!articleDetail.content) {
                 console.warn(`Article content appears empty after parsing: ${url}`);
             }
            return articleDetail;
        } catch (error) {
            console.error(`Error parsing article content for ${url}:`, error);
            return null;
        }
    }
}

export default LaTerceraArticleScraper;
// Export ScrapedArticleDetail if needed by the main scraper directly
// export { ScrapedArticleDetail }; 