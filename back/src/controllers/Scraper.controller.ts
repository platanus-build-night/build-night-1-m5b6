import { JsonController, Get, Res } from "routing-controllers";
import { response, Response } from "express";
import TeleTreceScraper from "../scrapers/sites/t13/TeleTrece.scraper";
import EmolScraper from "../scrapers/sites/emol/Emol.scraper";
import LaTerceraScraper from "../scrapers/sites/latercera/LaTercera.scraper";
import ElPaisScraper from "../scrapers/sites/elpais/ElPais.scraper";
import ElMostradorScraper from "../scrapers/sites/elmostrador/ElMostrador.scraper";
import { ScrapedArticleDetail } from "../scrapers/types";

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

  @Get("/elpais")
  async scrapeElPais(@Res() response: Response): Promise<Response> {
    try {
      const scraper = new ElPaisScraper();
      const articles = await scraper.scrape();
      return response.json({
        total: articles.length,
        articles: articles,
      });
    } catch (error) {
      console.error("Error scraping El País:", error);
      return response.status(500).json({
        message: "Error scraping El País",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get("/elmostrador")
  async scrapeElMostrador(@Res() response: Response): Promise<Response> {
    try {
      const scraper = new ElMostradorScraper();
      const articles = await scraper.scrape();
      return response.json({
        total: articles.length,
        articles: articles,
      });
    } catch (error) {
      console.error("Error scraping El Mostrador:", error);
      return response.status(500).json({
        message: "Error scraping El Mostrador",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get("/all")
  async scrapeAll(@Res() response: Response): Promise<Response> {
    console.log("Received request to scrape all sources...");
    const scrapers = [
      { name: "TeleTrece", instance: new TeleTreceScraper() },
      { name: "Emol", instance: new EmolScraper() },
      { name: "LaTercera", instance: new LaTerceraScraper() },
      { name: "ElPais", instance: new ElPaisScraper() },
      { name: "ElMostrador", instance: new ElMostradorScraper() },
    ];

    const promises = scrapers.map((s) =>
      s.instance.scrape().catch((err) => {
        console.error(`Error during ${s.name} scrape execution:`, err);
        return { error: true, source: s.name, message: err instanceof Error ? err.message : String(err) };
      })
    );

    const results = await Promise.allSettled(promises);

    const allArticles: ScrapedArticleDetail[] = [];
    const errors: { source: string; message: string }[] = [];

    results.forEach((result, index) => {
      const sourceName = scrapers[index].name;
      if (result.status === "fulfilled") {
        const value = result.value;
        if (value && typeof value === 'object' && 'error' in value && value.error === true) {
          console.warn(`Scraper ${sourceName} failed internally: ${value.message}`);
          errors.push({ source: sourceName, message: value.message });
        } else if (Array.isArray(value)) {
          console.log(`Scraper ${sourceName} finished successfully, found ${value.length} articles.`);
          allArticles.push(...value);
        } else {
          console.warn(`Scraper ${sourceName} finished with unexpected value:`, value);
          errors.push({ source: sourceName, message: 'Unexpected result format from scraper.' });
        }
      } else {
        console.error(`Scraper ${sourceName} promise rejected:`, result.reason);
        errors.push({
          source: sourceName,
          message:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        });
      }
    });

    console.log(
      `Scrape all finished. Total articles: ${allArticles.length}, Errors: ${errors.length}`
    );

    return response.json({
      total: allArticles.length,
      articles: allArticles,
      errors: errors,
    });
  }
}
