"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperController = void 0;
const routing_controllers_1 = require("routing-controllers");
const TeleTrece_scraper_1 = __importDefault(require("../scrapers/sites/t13/TeleTrece.scraper"));
const Emol_scraper_1 = __importDefault(require("../scrapers/sites/emol/Emol.scraper"));
const LaTercera_scraper_1 = __importDefault(require("../scrapers/sites/latercera/LaTercera.scraper"));
const ElPais_scraper_1 = __importDefault(require("../scrapers/sites/elpais/ElPais.scraper"));
const ElMostrador_scraper_1 = __importDefault(require("../scrapers/sites/elmostrador/ElMostrador.scraper"));
let ScraperController = class ScraperController {
    scrapeTeleTrece(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scraper = new TeleTrece_scraper_1.default();
                const articles = yield scraper.scrape();
                return response.json({
                    total: articles.length,
                    articles: articles,
                });
            }
            catch (error) {
                console.error("Error scraping TeleTrece:", error);
                return response.status(500).json({
                    message: "Error scraping TeleTrece",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    scrapeEmol(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scraper = new Emol_scraper_1.default();
                const articles = yield scraper.scrape();
                return response.json({
                    total: articles.length,
                    articles: articles,
                });
            }
            catch (error) {
                console.error("Error scraping Emol:", error);
                return response.status(500).json({
                    message: "Error scraping Emol",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    scrapeLaTercera(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scraper = new LaTercera_scraper_1.default();
                const articles = yield scraper.scrape();
                return response.json({
                    total: articles.length,
                    articles: articles,
                });
            }
            catch (error) {
                console.error("Error scraping La Tercera:", error);
                return response.status(500).json({
                    message: "Error scraping La Tercera",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    scrapeElPais(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scraper = new ElPais_scraper_1.default();
                const articles = yield scraper.scrape();
                return response.json({
                    total: articles.length,
                    articles: articles,
                });
            }
            catch (error) {
                console.error("Error scraping El País:", error);
                return response.status(500).json({
                    message: "Error scraping El País",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    scrapeElMostrador(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scraper = new ElMostrador_scraper_1.default();
                const articles = yield scraper.scrape();
                return response.json({
                    total: articles.length,
                    articles: articles,
                });
            }
            catch (error) {
                console.error("Error scraping El Mostrador:", error);
                return response.status(500).json({
                    message: "Error scraping El Mostrador",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    scrapeAll(response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Received request to scrape all sources...");
            const scrapers = [
                { name: "TeleTrece", instance: new TeleTrece_scraper_1.default() },
                { name: "Emol", instance: new Emol_scraper_1.default() },
                { name: "LaTercera", instance: new LaTercera_scraper_1.default() },
                { name: "ElPais", instance: new ElPais_scraper_1.default() },
                { name: "ElMostrador", instance: new ElMostrador_scraper_1.default() },
            ];
            const promises = scrapers.map((s) => s.instance.scrape().catch((err) => {
                console.error(`Error during ${s.name} scrape execution:`, err);
                return { error: true, source: s.name, message: err instanceof Error ? err.message : String(err) };
            }));
            const results = yield Promise.allSettled(promises);
            const allArticles = [];
            const errors = [];
            results.forEach((result, index) => {
                const sourceName = scrapers[index].name;
                if (result.status === "fulfilled") {
                    const value = result.value;
                    if (value && typeof value === 'object' && 'error' in value && value.error === true) {
                        console.warn(`Scraper ${sourceName} failed internally: ${value.message}`);
                        errors.push({ source: sourceName, message: value.message });
                    }
                    else if (Array.isArray(value)) {
                        console.log(`Scraper ${sourceName} finished successfully, found ${value.length} articles.`);
                        allArticles.push(...value);
                    }
                    else {
                        console.warn(`Scraper ${sourceName} finished with unexpected value:`, value);
                        errors.push({ source: sourceName, message: 'Unexpected result format from scraper.' });
                    }
                }
                else {
                    console.error(`Scraper ${sourceName} promise rejected:`, result.reason);
                    errors.push({
                        source: sourceName,
                        message: result.reason instanceof Error
                            ? result.reason.message
                            : String(result.reason),
                    });
                }
            });
            console.log(`Scrape all finished. Total articles: ${allArticles.length}, Errors: ${errors.length}`);
            return response.json({
                total: allArticles.length,
                articles: allArticles,
                errors: errors,
            });
        });
    }
};
exports.ScraperController = ScraperController;
__decorate([
    (0, routing_controllers_1.Get)("/t13"),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeTeleTrece", null);
__decorate([
    (0, routing_controllers_1.Get)("/emol"),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeEmol", null);
__decorate([
    (0, routing_controllers_1.Get)("/latercera"),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeLaTercera", null);
__decorate([
    (0, routing_controllers_1.Get)("/elpais"),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeElPais", null);
__decorate([
    (0, routing_controllers_1.Get)("/elmostrador"),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeElMostrador", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeAll", null);
exports.ScraperController = ScraperController = __decorate([
    (0, routing_controllers_1.JsonController)("/scrape")
], ScraperController);
