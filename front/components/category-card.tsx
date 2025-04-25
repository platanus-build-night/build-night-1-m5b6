"use client"
import type { Category } from "@/lib/types"
import { motion } from "framer-motion"
import * as HeroIconsOutline from "@heroicons/react/24/outline"
import * as HeroIconsSolid from "@heroicons/react/24/solid" // Keep solid for potential hover

interface CategoryCardProps {
  category: Category
  // Remove isExpanded and onToggle props
}

// Dynamically select icon component based on name
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  // Try outline first, then solid as fallback (adjust if needed)
  const Icon = (HeroIconsOutline as any)[name] || (HeroIconsSolid as any)[name]
  return Icon ? <Icon className={className} /> : null
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Simplified component: Circle with gradient and icon
  return (
    <motion.div
      // Remove layout prop if not needed for this static circle
      // transition={springTransition} // Remove complex transition initially
      className="group relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg flex items-center justify-center text-center cursor-pointer"
      style={{ isolation: "isolate" }} // Keep for gradient layering
      whileHover={{ scale: 1.1 }} // Add simple hover effect
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
        style={{
          background: category.gradient,
          backgroundSize: "200% 200%",
          animation: "gradientMove 8s ease infinite",
        }}
      >
        {/* Optional Noise Overlay */}
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      {/* Icon and Text Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-2">
        {category.icon && (
          <IconComponent name={category.icon} className="h-6 w-6 text-white mb-0.5" />
        )}
        <p className="text-xs font-medium text-white truncate group-hover:whitespace-normal group-hover:overflow-visible">
          {category.name}
        </p>
      </div>

      {/* Remove expansion section (AnimatePresence, article grid, etc.) */}
    </motion.div>
  )
}
