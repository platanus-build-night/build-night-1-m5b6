"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Article, AuthorSource } from "@/lib/types";
import { getTopicGradient, getLightTopicGradient } from "@/lib/topic-metadata";

// Map sources to SF Symbols where possible, else fallback image
const sourceIcon: Record<AuthorSource, { symbol?: string; src?: string }> = {
  Emol: { src: "/emol.jpg" },
  T13: { src: "/t13.webp" }, // SF Symbol example
  LaTercera: { src: "/lt.jpg" },
  ElPais: { src: "/elpais.png" },
  ElMostrador: { src: "/elmostrador.png" },
};

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

interface ArticleCardProps {
  article: Article;
  index: number;
  searchQuery: string;
}

export default function ArticleCard({ article, index, searchQuery }: ArticleCardProps) {
  const { symbol, src } = sourceIcon[article.author as AuthorSource] || {};

  // Get both normal and light gradients
  const topicValue = article.topic;
  const gradientValue = getTopicGradient(topicValue);
  const lightGradientValue = getLightTopicGradient(topicValue); // Get light gradient

  // --- DEBUG LOGGING START ---
  // console.log(`Article ID: ${article.id}, Topic: ${topicValue}, Gradient: ${gradientValue}`);
  // --- DEBUG LOGGING END ---

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
      whileHover={{ scale: 1.03 }}
      className="
        w-[calc(50%-0.75rem)] /* Width for 2 columns with gap-6 */
        relative flex flex-col justify-between
        bg-white/5 backdrop-blur-xl
        rounded-2xl
        shadow-lg
        overflow-hidden
      "
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

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full p-6 pt-8"
      >
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

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
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

          {/* Date */}
          <time dateTime={article.publishedDate}>
            {new Date(article.publishedDate).toLocaleDateString()}
          </time>
        </div>
      </a>
    </motion.article>
  );
}
