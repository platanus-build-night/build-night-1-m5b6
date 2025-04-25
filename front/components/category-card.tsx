"use client"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import type { Category } from "@/lib/types"
import ArticlePreview from "./article-preview"

interface CategoryCardProps {
  category: Category
  isExpanded: boolean
  onToggle: () => void
}

export default function CategoryCard({ category, isExpanded, onToggle }: CategoryCardProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        isExpanded ? "col-span-full" : ""
      }`}
    >
      <div className="relative cursor-pointer" onClick={onToggle}>
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-90 bg-gradient-to-br"
          style={{
            background: category.gradient,
            backgroundSize: "200% 200%",
            animation: "gradientMove 8s ease infinite",
          }}
        >
          {/* Grainy texture */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
            }}
          />
        </div>

        <div className="relative z-10 p-6 flex justify-between items-center">
          <h3 className="text-xl font-medium text-white">{category.name}</h3>
          <ChevronRightIcon className={`h-5 w-5 text-white transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-950 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.articles.map((article) => (
              <ArticlePreview key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
