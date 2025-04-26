"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleAnalyzerAgent = exports.ArticleAnalysisOutputSchema = void 0;
const core_1 = require("@mastra/core");
const openai_1 = require("@ai-sdk/openai");
const types_1 = require("../types");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const topics = Object.values(types_1.Topic);
const sentiments = Object.values(types_1.Sentiment);
// Add Zod schema for the final output including digest
exports.ArticleAnalysisOutputSchema = zod_1.z.object({
    sentiment: zod_1.z.nativeEnum(types_1.Sentiment),
    topic: zod_1.z.nativeEnum(types_1.Topic),
    digest: zod_1.z
        .string()
        .min(10)
        .max(150)
        .describe("A short, positive, esoteric digest of the news story (10-150 chars)"),
});
// Define the single tool for structured output
const analysisReportTool = (0, tools_1.createTool)({
    id: "report-analysis-and-digest",
    description: "Report the sentiment, topic, and a short digest of the article analysis.",
    inputSchema: exports.ArticleAnalysisOutputSchema,
    execute: (_a) => __awaiter(void 0, [_a], void 0, function* ({ context }) {
        console.log("context", context);
        return context;
    }),
});
exports.articleAnalyzerAgent = new core_1.Agent({
    name: "ArticleAnalyzerAgent",
    instructions: `You are an expert analyst agent tasked with processing news articles.
Analyze the provided text to determine its overall sentiment, classify its main topic, and generate a concise, positive, slightly esoteric digest.

1.  **Sentiment Analysis**: Determine if the sentiment is ${sentiments.join(", ")}.
2.  **Topic Classification**: Classify the topic as one of ${topics.join(", ")}.
3.  **Digest Generation**: Write a very short (1-2 sentence, 10-150 characters) digest of the article. The digest should have a positive or neutral tone, even if the article is negative, and be somewhat abstract or esoteric in style.

**You MUST use the report-analysis-and-digest tool to provide your final answer.** Include the determined sentiment, topic, and the generated digest in the tool call.`,
    model: (0, openai_1.openai)("gpt-4o-nano"), // Use a capable model
    tools: { analysisReportTool },
});
