import type { Article } from "@/lib/types"
import { motion, Variants } from "framer-motion"

interface ArticlePreviewProps {
  article: Article
  variants?: Variants
}

export default function ArticlePreview({ article, variants }: ArticlePreviewProps) {
  return (
    <motion.div
      variants={variants}
      className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          {/* Placeholder for image */}
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-medium mb-1 line-clamp-2">{article.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{article.summary}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-400">{article.date}</span>
          <button className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Read more
          </button>
        </div>
      </div>
    </motion.div>
  )
}
