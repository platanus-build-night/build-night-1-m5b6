export const enum Topic {
  Social = "social",
  Science = "science",
  Technology = "tech",
  Arts = "arts",
  Sports = "sports",
  Business = "business",
}


export enum Sentiment {
  Positive = "positive",
  Negative = "negative",
  Neutral = "neutral",
}

export interface Article {
  id: string; // Derived from URL
  url: string;
  title: string;
  author: string; // Consider using AuthorSource enum if available
  publishedDate: string;
  content: string;
  sentiment: Sentiment;
  topic: Topic;
  digest: string;
  createdAt: string;
  updatedAt: string;
  score: number;
}

export interface ArticlesApiResponse {
  total: number;
  articles: Article[];
}

// --- Metadata moved to lib/topic-metadata.ts ---
// Remove topicNames, getTopicGradient, getTopicIcon

export enum AuthorSource {
  Emol = "Emol",
  T13 = "T13",
  LaTercera = "LaTercera",
  ElPais = "ElPais",
  ElMostrador = "ElMostrador",
}
