"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Article, AuthorSource } from "@/lib/types";
import { getTopicGradient } from "@/lib/topic-metadata";

// Map sources to SF Symbols where possible, else fallback image
const sourceIcon: Record<AuthorSource, { symbol?: string; src?: string }> = {
  Emol: { src: "/emol.jpg" },
  T13: { symbol: "tv.fill" }, // SF Symbol example
  LaTercera: { src: "/lt.jpg" },
  ElPais: { symbol: "newspaper.fill" },
};

const cleanTitle = (t: string) =>
  t
    ?.replaceAll("&quot;", "")
    .replace(/\s*-\s*La Tercera\s*$/i, "")
    .replaceAll(/[,-]/g, "")
    .trim() || "";

interface ArticleCardProps {
  article: Article;
  index: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  const { symbol, src } = sourceIcon[article.author as AuthorSource] || {};
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="
        w-[calc(50%-0.75rem)] /* Width for 2 columns with gap-6 */
        relative flex flex-col justify-between
        bg-white/5 backdrop-blur-xl
        rounded-2xl
        shadow-lg hover:shadow-2xl
        transition-transform duration-200 ease-out
        hover:scale-105 active:scale-100
        overflow-hidden
      "
    >
      {/* tiny accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ background: getTopicGradient(article.topic) }}
      />

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full p-6"
      >
        {/* Headline */}
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

        {/* Digest */}
        <p className="flex-1 font-sans text-base leading-relaxed text-gray-700 mb-6">
          {article.digest}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          {/* Source Icon */}
          {symbol ? (
            <span className="text-lg text-gray-500">
              <i className={`sf-symbol sf-symbol-${symbol}`} />
            </span>
          ) : (
            <Image
              src={src!}
              alt={article.author}
              width={24}
              height={24}
              className="rounded-sm object-cover"
            />
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
