"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Article, AuthorSource } from "@/lib/types";
import { getTopicGradient, getLightTopicGradient, sourceIcon   } from "@/lib/topic-metadata";
import {
  ArrowTopRightOnSquareIcon,
  FaceFrownIcon,
  UserIcon, // Using UserIcon for neutral
  FaceSmileIcon 
} from '@heroicons/react/24/outline'; // Using outline for consistency

const cleanTitle = (t: string) =>
  t
    ?.replaceAll("&quot;", "")
    .replace(/\s*-\s*La Tercera\s*$/i, "")
    .replaceAll(/[,-]/g, "")
    .trim() || "";

// Define variants for the accent bar
const barVariants = {
  rest: {
    height: "0.25rem", // Corresponds to h-1
    transition: { duration: 0.2, ease: "easeOut" }
  },
  hover: {
    height: "0.5rem", // Corresponds to h-2
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

// Helper function to escape regex special characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Helper function to highlight search terms
const highlightMatches = (text: string, query: string, highlightBackground: string): React.ReactNode => {
  if (!query || !text) {
    return text || "";
  }

  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part)
      ? <span key={index} style={{ background: highlightBackground }} className="text-black rounded-sm px-0.5">{part}</span>
      : part
  );
};

// Helper function to get color based on score (0-100)
const getScoreColor = (score: number | undefined): string => {
  if (score === undefined || score < 0 || score > 100) {
    return 'hsl(0, 0%, 60%)'; // Default gray
  }
  const hue = (score / 100) * 120; // 0-100 maps to 0-120 (red to green)
  return `hsl(${hue}, 70%, 45%)`; // Adjusted saturation/lightness slightly
};

// Helper function to get sentiment icon based on score
const getSentimentIcon = (score: number | undefined): React.ElementType => {
  if (score === undefined) return UserIcon; // Default to neutral if no score
  if (score < 40) return FaceFrownIcon;
  if (score < 70) return UserIcon;
  return FaceSmileIcon;
};

interface ArticleCardProps {
  article: Article;
  index: number;
  pageIndex: number;
  searchQuery: string;
  layoutId: string;
  onClick: () => void;
  isExpanded: boolean;
}

export default function ArticleCard({ article, index, pageIndex, searchQuery, layoutId, onClick, isExpanded }: ArticleCardProps) {
  const { symbol, src } = sourceIcon[article.author as AuthorSource] || {};

  // Get both normal and light gradients
  const topicValue = article.topic;
  const gradientValue = getTopicGradient(topicValue);
  const lightGradientValue = getLightTopicGradient(topicValue); // Get light gradient

  // Format sentiment score as percentage
  const scoreValue = article.score;
  const formattedScore = scoreValue !== undefined
    ? `${Math.round(scoreValue)}` // Just the number for the badge
    : null;
  const scoreColor = getScoreColor(scoreValue); 
  const SentimentIcon = getSentimentIcon(scoreValue); // Get the icon component

  // Hide card content immediately during expansion animation
  const visibilityClass = isExpanded ? 'invisible' : 'visible';

  // Conditionally render the shortcut hint
  const showHint = pageIndex >= 0 && pageIndex < 4; // Only show for first 4 items

  return (
    <motion.article
      layoutId={layoutId}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
      whileHover={isExpanded ? {} : { scale: 1.03 }}
      className={`
        w-[calc(50%-0.75rem)] /* Width for 2 columns with gap-6 */
        relative flex flex-col justify-between
        bg-white/10 backdrop-blur-xl
        rounded-2xl
        shadow-lg ${isExpanded ? '' : 'cursor-pointer'} /* Add cursor pointer only when not expanded */
        overflow-hidden
        ${visibilityClass} /* Control visibility */
      `}
    >
      {/* Accent bar - Explicitly set height for testing */}
      <motion.div
        className="absolute top-0 left-0 w-full"
        // Apply gradient AND explicit height in style prop
        style={{ background: gradientValue, height: "0.25rem" }}
        variants={barVariants} // Keep variants for hover animation
        initial="rest"       // Keep initial state reference
        whileHover="hover"
      />

      <div className="flex flex-col h-full p-6 pt-8">
        <h2
          className="
            font-serif text-2xl md:text-3xl
            leading-tight text-gray-900 dark:text-gray-100
            mb-4
          "
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          {highlightMatches(cleanTitle(article.title), searchQuery, lightGradientValue)}
        </h2>

        <p className="flex-1 font-sans text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          {highlightMatches(article.digest, searchQuery, lightGradientValue)}
        </p>

        {/* Footer - Add relative positioning */}
        <div className="relative flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-auto pt-4">
          {/* Left side: Source Icon + Sentiment Icon & Badge */}
          <div className="flex items-center gap-3"> {/* Increased gap slightly */}
            {/* Source Icon */}
            {symbol ? (
              <span className="text-lg text-gray-500">
                <i className={`sf-symbol sf-symbol-${symbol}`} />
              </span>
            ) : (
              // Add null check for src before rendering Image
              src ? (
                <Image
                  src={src}
                  alt={article.author}
                  width={24}
                  height={24}
                  className="rounded-sm object-cover"
                />
              ) : null // Render nothing if src is also missing
            )}
            
            {/* Sentiment Icon & Badge Container */}
            <div className="relative">
              <SentimentIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              {/* Score Badge */}
              {formattedScore !== null && (
                <span 
                  className="absolute -top-1.5 -right-1.5 
                             min-w-[16px] h-4 px-1 flex items-center justify-center 
                             rounded-full text-[9px] font-medium text-white
                             ring-1 ring-white dark:ring-gray-900/80 shadow-sm"
                  style={{ backgroundColor: scoreColor }} // Use scoreColor for badge background
                  title={`${Math.round(scoreValue!)}%`}
                >
                  {formattedScore}
                </span>
              )}
            </div>
          </div>

          {/* Shortcut Hint (Bottom Center) */}
          {showHint && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 pointer-events-none"> {/* Positioned bottom-center */}
              <kbd className="inline-flex items-center px-1 py-0 rounded-sm border border-gray-400 dark:border-gray-600 bg-gray-200/50 dark:bg-gray-800/50 text-[9px] font-sans text-gray-500 dark:text-gray-400 opacity-40">
                ⌥{pageIndex + 1}
              </kbd>
            </div>
          )}

          {/* Right side: Date + External Link */}
          <div className="flex items-center gap-3">
            <time dateTime={article.publishedDate}>
              {new Date(article.publishedDate).toLocaleDateString()}
            </time>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Leer artículo completo"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
