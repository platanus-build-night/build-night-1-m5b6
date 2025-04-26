import { z } from "zod";
import { ScrapedArticleDetail, AuthorSource } from "../scrapers/types";

// Zod schema for input validation
export const ScrapedArticleDetailSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  author: z.nativeEnum(AuthorSource),
  publishedDate: z.string().optional(), // Could be refined with z.date() or date string validation
  content: z.string().min(1), // Ensure content is not empty
});

export const ArticleAnalysisInputSchema = z.object({
  article: ScrapedArticleDetailSchema,
});

export enum Sentiment {
  Positive = "positive",
  Negative = "negative",
  Neutral = "neutral",
}

export enum Topic {
  Social = "social",
  Science = "science",
  Technology = "tech",
  Arts = "arts",
  Sports = "sports",
  Business = "business",
}
