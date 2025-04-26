"use client";

import React from "react";
import { motion } from "framer-motion";
import { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  index: number; // For animation delay
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index }) => {
  return (
    <motion.div
      key={article.id} // Keep key here for Framer Motion list animations if needed
      className="aspect-square overflow-hidden bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10 flex flex-col justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      {/* Content within the card */}
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full"> {/* Anchor takes full height */}
        <div> {/* Container for title and content */}
          {/* Add a specific class for drop cap styling */}
          <h2 className="text-lg font-semibold font-serif text-black mb-2 line-clamp-2 article-title-dropcap">{article.title}</h2>
          <p className="text-sm text-gray-700 mb-3 line-clamp-6">{article.content}</p>
        </div>
        <div className="text-xs text-gray-700 flex justify-between items-center mt-auto">
          <span>{article.author}</span>
          <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
        </div>
      </a>
    </motion.div>
  );
};

export default ArticleCard; 