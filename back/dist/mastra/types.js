"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = exports.Sentiment = exports.ArticleAnalysisInputSchema = exports.ScrapedArticleDetailSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../scrapers/types");
// Zod schema for input validation
exports.ScrapedArticleDetailSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    title: zod_1.z.string().optional(),
    author: zod_1.z.nativeEnum(types_1.AuthorSource),
    publishedDate: zod_1.z.string().optional(), // Could be refined with z.date() or date string validation
    content: zod_1.z.string().min(1), // Ensure content is not empty
});
exports.ArticleAnalysisInputSchema = zod_1.z.object({
    article: exports.ScrapedArticleDetailSchema,
});
var Sentiment;
(function (Sentiment) {
    Sentiment["Positive"] = "Positive";
    Sentiment["Negative"] = "Negative";
    Sentiment["Neutral"] = "Neutral";
})(Sentiment || (exports.Sentiment = Sentiment = {}));
var Topic;
(function (Topic) {
    Topic["Nature"] = "Nature";
    Topic["Social"] = "Social";
    Topic["Science"] = "Science";
    Topic["Technology"] = "Technology";
    Topic["Health"] = "Health";
    Topic["Arts"] = "Arts";
})(Topic || (exports.Topic = Topic = {}));
