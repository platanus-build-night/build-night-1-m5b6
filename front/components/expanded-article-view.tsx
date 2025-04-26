import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Article, AuthorSource } from '@/lib/types';
import { getTopicGradient, getLightTopicGradient } from '@/lib/topic-metadata';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

// Re-use or import necessary helpers/maps
const sourceIcon: Record<AuthorSource, { symbol?: string; src?: string }> = {
  Emol: { src: "/emol.jpg" },
  T13: { src: "/t13.webp" },
  LaTercera: { src: "/lt.jpg" },
  ElPais: { src: "/elpais.png" },
  ElMostrador: { src: "/elmostrador.png" }, // Assuming this exists
};

const cleanTitle = (t: string) =>
  t
    ?.replaceAll("&quot;", "")
    .replace(/\s*-\s*La Tercera\s*$/i, "")
    .replaceAll(/[,-]/g, "")
    .trim() || "";

const getScoreColor = (score: number | undefined): string => {
  if (score === undefined || score < 0 || score > 100) {
    return 'hsl(0, 0%, 60%)'; 
  }
  const hue = (score / 100) * 120;
  return `hsl(${hue}, 90%, 40%)`;
};

// --- Copy Helper functions from ArticleCard --- 
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

const highlightMatches = (text: string | undefined | null, query: string, highlightBackground: string): React.ReactNode => {
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
// --- End Copied Helpers --- 

interface ExpandedArticleViewProps {
  article: Article;
  layoutId: string;
  onClose: () => void;
  searchQuery: string;
}

const ExpandedArticleView: React.FC<ExpandedArticleViewProps> = ({ article, layoutId, onClose, searchQuery }) => {
  const { symbol, src } = sourceIcon[article.author as AuthorSource] || {};
  const gradientValue = getTopicGradient(article.topic);
  const scoreValue = article.score;
  const formattedScore = scoreValue !== undefined ? `${Math.round(scoreValue)}%` : null;
  const scoreColor = getScoreColor(scoreValue);
  const lightGradientValue = getLightTopicGradient(article.topic);

  // Effect to handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        layoutId={layoutId}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Wrap content for delayed fade-in */}
        <motion.div
          className="flex flex-col flex-grow overflow-hidden" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.2 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors z-50 bg-white/50 dark:bg-gray-700/50 rounded-full p-1"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto p-6 pt-8 md:p-8 md:pt-10">
            <h2
              className="font-serif text-3xl md:text-4xl leading-tight text-gray-900 dark:text-gray-100 mb-4 pr-10"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              {highlightMatches(cleanTitle(article.title), searchQuery, lightGradientValue)}
            </h2>

            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-sans text-gray-800 dark:text-gray-200 mb-6 text-justify">
              {highlightMatches(article.content || article.digest, searchQuery, lightGradientValue)}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            {/* Left: Icon + Score + Author */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
               {symbol ? (
                  <span className="text-lg text-gray-500">
                    <i className={`sf-symbol sf-symbol-${symbol}`} />
                  </span> 
               ) : (
                  src ? <Image src={src} alt={article.author} width={24} height={24} className="rounded-sm object-cover" /> : null
               )}
               {formattedScore && <span style={{ color: scoreColor }} className="font-semibold text-xs">{formattedScore}</span>}
               <span className="hidden md:inline">{article.author}</span>
            </div>

            {/* Right: Date + External Link */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <time dateTime={article.publishedDate}>{new Date(article.publishedDate).toLocaleDateString()}</time>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                aria-label="Leer artículo completo"
              >
                Visitar
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Accent Bar (Outside fading content) */}
        <div className="absolute top-0 left-0 w-full h-2" style={{ background: gradientValue }} />

      </motion.div>
    </motion.div>
  );
};

export default ExpandedArticleView; 