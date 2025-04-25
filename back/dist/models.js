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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapedArticleDetail = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("./scrapers/types"); // Adjust path if necessary
const types_2 = require("./mastra/types"); // Adjust path if necessary
let ScrapedArticleDetail = class ScrapedArticleDetail {
};
exports.ScrapedArticleDetail = ScrapedArticleDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: types_1.AuthorSource,
        nullable: false,
    }),
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }) // Storing as varchar as per interface
    ,
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "publishedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }) // Use 'text' for potentially long content
    ,
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: types_2.Sentiment,
        nullable: true,
    }),
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "sentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: types_2.Topic,
        nullable: true,
    }),
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ScrapedArticleDetail.prototype, "digest", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScrapedArticleDetail.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScrapedArticleDetail.prototype, "updatedAt", void 0);
exports.ScrapedArticleDetail = ScrapedArticleDetail = __decorate([
    (0, typeorm_1.Entity)("scraped_articles")
], ScrapedArticleDetail);
