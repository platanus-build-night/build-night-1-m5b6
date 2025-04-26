import { useState, useEffect, useCallback } from "react";
import axios from "axios";
// Only import necessary types from lib/types
import type { Article, ArticlesApiResponse, Topic, AuthorSource } from "../lib/types";

const API_URL = "http://localhost:3000/articles";

export function useArticles() {
  const [allFetchedArticles, setAllFetchedArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [positiveArticles, setPositiveArticles] = useState<Article[]>([]);
  const [negativeArticles, setNegativeArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allAuthors, setAllAuthors] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      setAllFetchedArticles([]);
      setArticles([]);
      setPositiveArticles([]);
      setNegativeArticles([]);
      setTopics([]);
      setAllAuthors([]);
      setSelectedAuthors([]);

      try {
        const response = await axios.get<ArticlesApiResponse>(API_URL);
        const data = response.data;

        // Basic validation
        if (!data || !Array.isArray(data.articles)) {
          throw new Error("Invalid API response structure");
        }

        // Process articles: just add id (or validate if needed)
        let processed = data.articles.map(article => {
          if (!article || typeof article !== 'object' || !article.url || !article.topic || !article.author) {
            console.warn("Skipping invalid or topic-less article object:", article);
            return null;
          }
          return {
            ...article,
            id: article.url, 
          };
        }).filter((article): article is Article => article !== null);

        // --- Shuffle the processed articles --- 
        for (let i = processed.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [processed[i], processed[j]] = [processed[j], processed[i]]; // Swap elements
        }
        // ---------------------------------------

        setAllFetchedArticles(processed);

        const uniqueAuthors = Array.from(new Set(processed.map(a => a.author))).sort();
        setAllAuthors(uniqueAuthors);

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

  useEffect(() => {
    let filtered = allFetchedArticles;
    if (selectedAuthors.length > 0) {
      filtered = allFetchedArticles.filter(article =>
        selectedAuthors.includes(article.author)
      );
    }

    setArticles(filtered);
    setPositiveArticles(filtered.filter(article => article.sentiment === "positive"));
    setNegativeArticles(filtered.filter(article => article.sentiment === "negative"));

    const uniqueTopics = Array.from(new Set(filtered.map(article => article.topic)));
    setTopics(uniqueTopics);

  }, [allFetchedArticles, selectedAuthors]);

  const updateSelectedAuthors = useCallback((newSelection: string[]) => {
    setSelectedAuthors(newSelection);
  }, []);

  return {
    articles, 
    positiveArticles, 
    negativeArticles, 
    topics, 
    allAuthors, 
    selectedAuthors, 
    updateSelectedAuthors, 
    loading, 
    error 
  };
}
