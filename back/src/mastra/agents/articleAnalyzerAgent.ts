import { Agent } from "@mastra/core";
import { openai } from "@ai-sdk/openai";
import { Sentiment, Topic } from "../types";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ScrapedArticleDetail } from "../../scrapers/types";

const topics = Object.values(Topic);
const sentiments = Object.values(Sentiment);

// Add Zod schema for the final output including digest
export const ArticleAnalysisOutputSchema = z.object({
  sentiment: z.nativeEnum(Sentiment),
  topic: z.nativeEnum(Topic),
  digest: z
    .string()
    .min(10)
    .max(150)
    .describe(
      "A short, positive, esoteric digest of the news story (10-150 chars)"
    ),
});

export interface ArticleAnalysisInput {
  article: ScrapedArticleDetail;
}

export interface ArticleAnalysisOutput {
  sentiment: Sentiment;
  topic: Topic;
  digest: string;
}

// Define the single tool for structured output
const analysisReportTool = createTool({
  id: "report-analysis-and-digest",
  description:
    "Report the sentiment, topic, and a short digest of the article analysis.",
  inputSchema: ArticleAnalysisOutputSchema,
  execute: async ({ context }) => {
    console.log("context", context);
    return context;
  },
});

export const articleAnalyzerAgent = new Agent({
  name: "ArticleAnalyzerAgent",
  instructions: `You are an expert analyst agent tasked with processing news articles.
Analyze the provided text to determine its overall sentiment, classify its main topic, and generate a concise, positive, slightly esoteric digest.

1.  **Sentiment Analysis**: Determine if the sentiment is ${sentiments.join(
    ", "
  )}.
2.  **Topic Classification**: Classify the topic as one of ${topics.join(", ")}.
3.  **Digest Generation**: Write a very short (1-2 sentence, 10-150 characters) digest of the article. The digest should have a positive or neutral tone, even if the article is negative, and be somewhat abstract or esoteric in style.

**You MUST use the report-analysis-and-digest tool to provide your final answer.** Include the determined sentiment, topic, and the generated digest in the tool call.`,
  model: openai("gpt-4o-mini"), // Use a capable model
  tools: { analysisReportTool },
});
