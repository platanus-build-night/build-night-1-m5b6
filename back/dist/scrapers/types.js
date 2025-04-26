"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = exports.Sentiment = exports.ArticleAnalysisInputSchema = exports.ScrapedArticleDetailSchema = exports.AuthorSource = void 0;
const zod_1 = require("zod");
var AuthorSource;
(function (AuthorSource) {
    AuthorSource["Emol"] = "Emol";
    AuthorSource["T13"] = "T13";
    AuthorSource["LaTercera"] = "LaTercera";
    AuthorSource["ElPais"] = "ElPais";
    AuthorSource["ElMostrador"] = "ElMostrador";
    AuthorSource["LaNacion"] = "LaNacion";
})(AuthorSource || (exports.AuthorSource = AuthorSource = {}));
exports.ScrapedArticleDetailSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    title: zod_1.z.string().optional(),
    author: zod_1.z.nativeEnum(AuthorSource),
    publishedDate: zod_1.z.string().optional(), // Could be refined with z.date() or date string validation
    content: zod_1.z.string().min(1), // Ensure content is not empty
});
exports.ArticleAnalysisInputSchema = zod_1.z.object({
    article: exports.ScrapedArticleDetailSchema,
});
var Sentiment;
(function (Sentiment) {
    Sentiment["Positive"] = "positive";
    Sentiment["Negative"] = "negative";
    Sentiment["Neutral"] = "neutral";
})(Sentiment || (exports.Sentiment = Sentiment = {}));
var Topic;
(function (Topic) {
    Topic["Social"] = "social";
    Topic["Science"] = "science";
    Topic["Technology"] = "tech";
    Topic["Arts"] = "arts";
    Topic["Sports"] = "sports";
    Topic["Business"] = "business";
})(Topic || (exports.Topic = Topic = {}));
