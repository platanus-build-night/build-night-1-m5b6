"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Article, AuthorSource } from "@/lib/types";
import { getTopicGradient } from "@/lib/topic-metadata";

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

interface ArticleCardProps {
  article: Article;
  index: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  const { src } = sourceIcon[article.author as AuthorSource] || {};

  // --- DEBUG LOGGING START ---
  const topicValue = article.topic;
  const gradientValue = getTopicGradient(topicValue);
  console.log(`Article ID: ${article.id}, Topic: ${topicValue}, Gradient: ${gradientValue}`);
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
            leading-tight text-gray-900
            mb-4
          "
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          {cleanTitle(article.title)}
        </h2>

        <p className="flex-1 font-sans text-base leading-relaxed text-gray-700 mb-6">
          {article.digest}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600">

          <Image
            src={src!}
            alt={article.author}
            width={24}
            height={24}
            className="rounded-sm object-cover"
          />

          <time dateTime={article.publishedDate}>
            {new Date(article.publishedDate).toLocaleDateString()}
          </time>
        </div>
      </a>
    </motion.article>
  );
}
