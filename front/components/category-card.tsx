"use client"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import type { Category } from "@/lib/types"
import ArticlePreview from "./article-preview"
import { motion, AnimatePresence } from "framer-motion"

interface CategoryCardProps {
  category: Category
  isExpanded: boolean
  onToggle: () => void
}

// Define a shared spring transition
const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

// Variants for the content reveal using clipPath and opacity
const contentVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    width: "100%",
    transition: { 
      opacity: { duration: 0.3 },
      height: { duration: 0.4 },
      width: { duration: 0.4 },
      staggerChildren: 0.03,
      staggerDirection: -1,
      when: "afterChildren"
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    width: "100%",
    transition: { 
      ...springTransition, 
      duration: 0.5, 
      staggerChildren: 0.05,
      delayChildren: 0.1,
      when: "beforeChildren"
    },
  },
}

const itemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.25
    } 
  }, 
}

export default function CategoryCard({ category, isExpanded, onToggle }: CategoryCardProps) {
  return (
    <motion.div
      layout // Let layout handle size/position
      transition={springTransition} // Apply spring to layout changes
      className={`group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg ${isExpanded ? "col-span-full" : ""
        }`}
    >
      <div
        className="relative cursor-pointer group-hover:brightness-105 transition-filter duration-200"
        onClick={onToggle}
        style={{ isolation: "isolate" }}
      >
        <div
          className="absolute inset-0 opacity-90 bg-gradient-to-br"
          style={{
            background: category.gradient,
            backgroundSize: "200% 200%",
            animation: "gradientMove 8s ease infinite",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
            }}
          />
        </div>

        {/* Header Content - Now includes Title and Count */}
        <div className="relative z-10 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-medium font-serif text-white mb-1">{category.name}</h3>
            <p className="text-sm text-white/80">{category.articles.length} Articles</p>
          </div>
          <ChevronRightIcon
            className={`h-5 w-5 text-white transition-transform duration-300 ease-out mt-1 ${ // Added mt-1 for alignment
              isExpanded ? "rotate-90" : ""
              }`}
          />
        </div>
      </div>

      {/* Framer Motion Animated Expansion */}
      <AnimatePresence initial={false} mode="sync">
        {isExpanded && (
          <motion.div
            key="content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative overflow-hidden"
          >
            {/* Animated Border Separator */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { duration: 0.4, delay: 0.1 } }}
              exit={{ scaleX: 0, transition: { duration: 0.2 } }}
              style={{ originX: 0 }}
            />
            {/* Grid container - apply variants directly here for staggering */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
            >
              {category.articles.map((article) => (
                <ArticlePreview key={article.id} article={article} variants={itemVariants} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
