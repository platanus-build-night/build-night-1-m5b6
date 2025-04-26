import { JsonController, Get, Res } from "routing-controllers";
import { response, Response } from "express";
import TeleTreceScraper from "../scrapers/sites/t13/TeleTrece.scraper";
import EmolScraper from "../scrapers/sites/emol/Emol.scraper";
import LaTerceraScraper from "../scrapers/sites/latercera/LaTercera.scraper";

@JsonController("/scrape")
export class ScraperController {
  @Get("/t13")
  async scrapeTeleTrece(@Res() response: Response): Promise<Response> {
    try {
      const scraper = new TeleTreceScraper();
      const articles = await scraper.scrape();
      return response.json({
        total: articles.length,
        articles: articles,
      });
    } catch (error) {
      console.error("Error scraping TeleTrece:", error);
      return response.status(500).json({
        message: "Error scraping TeleTrece",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get("/emol")
  async scrapeEmol(@Res() response: Response): Promise<Response> {
    try {
      const scraper = new EmolScraper();
      const articles = await scraper.scrape();
      return response.json({
        total: articles.length,
        articles: articles,
      });
    } catch (error) {
      console.error("Error scraping Emol:", error);
      return response.status(500).json({
        message: "Error scraping Emol",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get("/latercera")
  async scrapeLaTercera(@Res() response: Response): Promise<Response> {
    try {
      const scraper = new LaTerceraScraper();
      const articles = await scraper.scrape();
      return response.json({
        total: articles.length,
        articles: articles,
      });
    } catch (error) {
      console.error("Error scraping La Tercera:", error);
      return response.status(500).json({
        message: "Error scraping La Tercera",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
