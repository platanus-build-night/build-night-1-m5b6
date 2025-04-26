import { z } from "zod";

export enum AuthorSource {
  Emol = "Emol",
  T13 = "T13",
  LaTercera = "LaTercera",
}

export interface ScrapedArticleDetail {
  url: string;
  title?: string;
  author: AuthorSource;
  publishedDate?: string;
  content: string;

  sentiment?: string;
  topic?: string;
  digest?: string;
}

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
