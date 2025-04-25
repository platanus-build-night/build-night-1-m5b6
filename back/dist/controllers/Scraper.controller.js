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
let ScraperController = class ScraperController {
    scrapeTeleTrece(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scraper = new TeleTrece_scraper_1.default();
                const articles = yield scraper.scrape();
                return response.json({
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
exports.ScraperController = ScraperController = __decorate([
    (0, routing_controllers_1.JsonController)("/scrape")
], ScraperController);
