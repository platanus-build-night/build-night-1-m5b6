import { useState, useEffect } from "react";
import axios from "axios";
// Only import necessary types from lib/types
import type { Article, ArticlesApiResponse, Topic } from "../lib/types";

const API_URL = "http://localhost:3000/articles";

export function useArticles() {
  // Keep only articles, topics, loading, and error state
  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<ArticlesApiResponse>(API_URL);
        const data = response.data;

        // Basic validation
        if (!data || !Array.isArray(data.articles)) {
          throw new Error("Invalid API response structure");
        }

        // Process articles: just add id (or validate if needed)
        const processedArticles = data.articles.map(article => {
          if (!article || typeof article !== 'object' || !article.url || !article.topic) {
            console.warn("Skipping invalid or topic-less article object:", article);
            return null; // Skip invalid articles
          }
          // Assuming API response matches Article type, just add ID
          // If API structure is different, adapt the mapping here
          return {
            ...article,
            id: article.url, // Use URL as ID
          };
        }).filter((article): article is Article => article !== null);

        // Extract unique topics
        const uniqueTopics = Array.from(new Set(processedArticles.map(article => article.topic)));

        // Set the articles state directly
        setArticles(processedArticles);
        setTopics(uniqueTopics); // Set the unique topics

      } catch (err) {
        // Simplified error handling for now
        console.error("Error fetching articles:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));

      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Return topics and articles, loading, and error
  return { articles, topics, loading, error };
}
