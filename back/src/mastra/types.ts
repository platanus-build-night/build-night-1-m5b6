import { z } from 'zod';
import { ScrapedArticleDetail } from '../scrapers/types';

// Zod schema for input validation
export const ScrapedArticleDetailSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  author: z.string().optional(),
  publishedDate: z.string().optional(), // Could be refined with z.date() or date string validation
  content: z.string().min(1), // Ensure content is not empty
});

export const ArticleAnalysisInputSchema = z.object({
  article: ScrapedArticleDetailSchema,
});

export enum Sentiment {
  Positive = 'Positive',
  Negative = 'Negative',
  Neutral = 'Neutral',
}

export enum Topic {
  Nature = 'Nature',
  Social = 'Social',
  Science = 'Science',
  Technology = 'Technology',
  Health = 'Health',
  Arts = 'Arts',
}

export interface ArticleAnalysisInput {
  article: ScrapedArticleDetail;
}

export interface ArticleAnalysisOutput {
  sentiment: Sentiment;
  topic: Topic;
} 