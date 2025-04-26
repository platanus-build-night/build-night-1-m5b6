"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Article, AuthorSource } from "@/lib/types";

const cleanTitle = (title: string): string => {
  if (!title) {
    return ""; // Return empty string if input is null, undefined, or empty
  }

  let cleanedTitle = title;

  // Remove HTML quote entity
  cleanedTitle = cleanedTitle.replaceAll('&quot;', '');

  // Remove " - La Tercera"
  cleanedTitle = cleanedTitle.replace(/\s*-\s*La Tercera\s*$/i, ''); // Case-insensitive, handles surrounding whitespace

  // Remove commas
  cleanedTitle = cleanedTitle.replaceAll(',', '');

  // Remove hyphens (use replaceAll to catch multiple)
  cleanedTitle = cleanedTitle.replaceAll('-', '');

  // Optional: Trim whitespace from start and end
  cleanedTitle = cleanedTitle.trim();

  return cleanedTitle;
}

// Map AuthorSource enum to icon paths (assuming icons are in /public/icons/)
const sourceIconMap: Record<AuthorSource, string> = {
  "Emol": "/emol.jpg",
  "T13": "/t13.webp",
  "LaTercera": "/lt.jpg",
  "ElPais": "/elpais.png",
};

interface ArticleCardProps {
  article: Article;
  index: number; // For animation delay
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index }) => {
  // Get icon path safely by checking if the string key exists in the map
  const iconSrc = sourceIconMap[article.author as AuthorSource];

  return (
    <motion.div
      key={article.id}
      className="relative aspect-square overflow-hidden bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10 flex flex-col justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
        <div>
          <h2
            className={`
              text-4xl font-semibold font-serif text-black mb-4 line-clamp-5
              text-justify
            `}
          >
            {cleanTitle(article.title)}
          </h2>
          <p className="text-sm text-gray-700 mb-3 line-clamp-6">{article.digest}</p>
        </div>
        <div className="text-xs text-gray-700 flex justify-between items-center mt-auto">
          <span>&nbsp;</span>
          <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
        </div>
      </a>

      {iconSrc && (
        <Image
          src={iconSrc}
          alt={`${article.author} logo`}
          width={20}
          height={20}
          className="absolute bottom-2 left-2 h-5 w-5 rounded-sm object-contain"
        />
      )}
    </motion.div>
  );
};

export default ArticleCard; 