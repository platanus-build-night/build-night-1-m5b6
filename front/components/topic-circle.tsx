"use client"
import { type Topic } from "@/lib/types"
import { getTopicGradient, getTopicIcon, topicNames } from "@/lib/topic-metadata"
import { motion } from "framer-motion"
import * as HeroIconsOutline from "@heroicons/react/24/outline"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"

interface TopicCardProps {
  topic: Topic
  articleCount: number
  onClick: () => void
}

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const Icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = HeroIconsOutline
  const Icon = Icons[name]

  if (!Icon) {
    console.warn(`[IconComponent] Icon not found for name: ${name}`)
    return <QuestionMarkCircleIcon className={className || "h-6 w-6 text-red-500"} />
  }

  const finalClassName = className || "h-6 w-6 text-gray-800"

  return <Icon className={finalClassName} />
}

export default function TopicCircle({ topic, articleCount, onClick }: TopicCardProps) {
  // Calculate size in rem based on article count
  const baseSizeRem = 9; // Increased base size
  const sizeIncrementRem = 0.15; // Adjusted increment
  const dynamicSizeRem = baseSizeRem + articleCount * sizeIncrementRem;
  // Cap the size to avoid excessively large cards
  const maxSizeRem = 11; // Increased max size
  const finalSizeRem = Math.min(dynamicSizeRem, maxSizeRem);

  // Get metadata using the new functions
  const gradient = getTopicGradient(topic);
  const iconName = getTopicIcon(topic);
  const name = topicNames[topic] || topic; // Fallback to topic key if name not found

  return (
    <motion.div
      onClick={onClick}
      className={`group relative rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg flex items-center justify-center text-center cursor-pointer flex-shrink-0`}
      style={{
        isolation: "isolate",
        borderRadius: '50%',
        width: `${finalSizeRem}rem`,
        height: `${finalSizeRem}rem`,
      }}
      whileHover={{ scale: 1.4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
        style={{
          background: gradient,
          backgroundSize: "200% 200%",
          animation: "gradientMove 8s ease infinite",
        }}
      >
        {/* Optional Noise Overlay */}
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity 
          "
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      {/* Icon and Text Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-1">
        <IconComponent name={iconName} className="h-4 w-4 text-white mb-0.5" />
        <p className="text-xl text-center font-medium text-white dark:text-gray-200 font-serif truncate group-hover:whitespace-normal group-hover:overflow-visible">
          {name}
        </p>
        <span className="text-[8px] text-white dark:text-gray-400 mt-0.5">
          ({articleCount} {articleCount === 1 ? 'noticia' : 'noticias'})
        </span>
      </div>
    </motion.div>
  )
}
