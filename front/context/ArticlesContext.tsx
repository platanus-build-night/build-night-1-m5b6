"use client";

// context/ArticlesContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import type { Article, ArticlesApiResponse, Topic, AuthorSource } from '../lib/types';

const API_URL = "http://localhost:3000/articles";

interface ArticlesContextProps {
  allFetchedArticles: Article[]; // Unfiltered, shuffled list
  articles: Article[]; // Author-filtered list
  positiveArticles: Article[];
  negativeArticles: Article[];
  topics: Topic[];
  allAuthors: string[];
  selectedAuthors: string[];
  updateSelectedAuthors: (newSelection: string[]) => void;
  totalCountsPerAuthor: Record<string, number>;
  topicCountsPerAuthor: Record<Topic, Record<string, number>>;
  loading: boolean;
  error: Error | null;
}

const ArticlesContext = createContext<ArticlesContextProps | undefined>(undefined);

export const ArticlesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allFetchedArticles, setAllFetchedArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [positiveArticles, setPositiveArticles] = useState<Article[]>([]);
  const [negativeArticles, setNegativeArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allAuthors, setAllAuthors] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [totalCountsPerAuthor, setTotalCountsPerAuthor] = useState<Record<string, number>>({});
  const [topicCountsPerAuthor, setTopicCountsPerAuthor] = useState<Record<Topic, Record<string, number>>>({} as Record<Topic, Record<string, number>>);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch and process initial data
  useEffect(() => {
    const fetchArticles = async () => {
       setLoading(true);
       setError(null);
       setAllFetchedArticles([]); setArticles([]); setPositiveArticles([]);
       setNegativeArticles([]); setTopics([]); setAllAuthors([]);
       setSelectedAuthors([]); setTotalCountsPerAuthor({}); setTopicCountsPerAuthor({} as Record<Topic, Record<string, number>>);

      try {
        const response = await axios.get<ArticlesApiResponse>(API_URL);
        const data = response.data;
        if (!data || !Array.isArray(data.articles)) {
          throw new Error("Invalid API response structure");
        }

        let processed = data.articles.map(article => { 
            if (!article || typeof article !== 'object' || !article.url || !article.topic || !article.author) { return null; }
            return { ...article, id: article.url }; 
        })
                             .filter((a): a is Article => a !== null);

        // Shuffle
        for (let i = processed.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1));
            [processed[i], processed[j]] = [processed[j], processed[i]];
         }

        setAllFetchedArticles(processed); // Store full list

        // Calculate Counts
        const totalCounts: Record<string, number> = {};
        const topicCounts: Record<Topic, Record<string, number>> = {} as Record<Topic, Record<string, number>>;

        processed.forEach(article => {
          totalCounts[article.author] = (totalCounts[article.author] || 0) + 1;
          if (!topicCounts[article.topic]) {
            topicCounts[article.topic] = {};
          }
          topicCounts[article.topic][article.author] = (topicCounts[article.topic][article.author] || 0) + 1;
        });
        setTotalCountsPerAuthor(totalCounts);
        setTopicCountsPerAuthor(topicCounts);

        // Extract unique authors
        const uniqueAuthors = Array.from(new Set(processed.map(a => a.author))).sort();
        setAllAuthors(uniqueAuthors);
        setSelectedAuthors(uniqueAuthors); // Select all authors by default

      } catch (err) { 
        console.error("Error fetching articles:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
      finally { setLoading(false); }
    };
    fetchArticles();
  }, []);

  // Filter articles whenever the base list or selected authors change
  useEffect(() => {
    let filtered = allFetchedArticles;
    if (selectedAuthors.length > 0) {
      filtered = allFetchedArticles.filter(article => selectedAuthors.includes(article.author));
    }
    setArticles(filtered);
    setPositiveArticles(filtered.filter(a => a.sentiment === "positive"));
    setNegativeArticles(filtered.filter(a => a.sentiment === "negative"));
    const uniqueTopics = Array.from(new Set(filtered.map(a => a.topic)));
    setTopics(uniqueTopics);
  }, [allFetchedArticles, selectedAuthors]);

  const updateSelectedAuthors = useCallback((newSelection: string[]) => {
    setSelectedAuthors(newSelection);
  }, []);

  const value = {
    allFetchedArticles, articles, positiveArticles, negativeArticles, topics,
    allAuthors, selectedAuthors, updateSelectedAuthors, totalCountsPerAuthor,
    topicCountsPerAuthor, loading, error
  };

  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
};

// Custom hook to use the context
export const useArticlesContext = () => {
  const context = useContext(ArticlesContext);
  if (context === undefined) {
    throw new Error('useArticlesContext must be used within an ArticlesProvider');
  }
  return context;
}; 