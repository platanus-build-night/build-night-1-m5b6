"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MoonIcon, EyeIcon } from "@heroicons/react/24/outline"
import FeaturedHeadline from "@/components/featured-headline"
// Rename import for clarity
// import CategoryCard from "@/components/topic-card"
import TopicCard from "@/components/topic-circle" // Assuming this is the correct component
import { motion, AnimatePresence } from "framer-motion"
import DayNightVisor from "@/components/day-night-visor"
import { useArticles } from "../hooks/useArticles";
import { Topic } from "@/lib/types"
import { getTopicGradient, topicNames } from "@/lib/topic-metadata" // Import helpers
// Remove duplicate TopicCard import
// import TopicCard from "@/components/topic-card"

// Define the shape of the selected topic data
interface SelectedTopicData {
  topic: Topic;
  gradient: string;
  name: string;
}

export default function Home() {
  const router = useRouter() // Initialize router
  // Fetch articles and topics data
  // Use correct return values from hook
  const { articles, topics, loading, error } = useArticles();

  // Remove mode and expandedCategory state
  const [isDaytime, setIsDaytime] = useState(true)
  const [timeUntilChange, setTimeUntilChange] = useState("")
  // New state to control overlay visibility independently
  const [isNightOverlayVisible, setIsNightOverlayVisible] = useState(true)
  // State for the selected topic animation
  const [selectedTopicData, setSelectedTopicData] = useState<SelectedTopicData | null>(null);

  // Run once on mount to set initial state
  useEffect(() => {
    const calculateInitialTimeState = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const currentTotalSeconds = hours * 3600 + minutes * 60 + seconds
      const sunriseSeconds = 6 * 3600 // 6:00 AM
      const sunsetSeconds = 20 * 3600 // 8:00 PM

      const currentlyDaytime = currentTotalSeconds >= sunriseSeconds && currentTotalSeconds < sunsetSeconds
      setIsDaytime(currentlyDaytime)
      setIsNightOverlayVisible(!currentlyDaytime) // Set initial overlay based on time
    }
    calculateInitialTimeState()
  }, [])

  // Run interval timer for updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      const currentTotalSeconds = hours * 3600 + minutes * 60 + seconds
      const sunriseSeconds = 6 * 3600 // 6:00 AM
      const sunsetSeconds = 20 * 3600 // 8:00 PM
      const totalDaySeconds = 24 * 3600

      let nextChangeEventSeconds: number
      let currentlyDaytimeNow: boolean

      if (currentTotalSeconds >= sunriseSeconds && currentTotalSeconds < sunsetSeconds) {
        currentlyDaytimeNow = true
        nextChangeEventSeconds = sunsetSeconds
      } else {
        currentlyDaytimeNow = false
        if (currentTotalSeconds < sunriseSeconds) {
          nextChangeEventSeconds = sunriseSeconds
        } else {
          nextChangeEventSeconds = sunriseSeconds + totalDaySeconds
        }
      }

      // Update isDaytime state and potentially reset overlay visibility *only on change*
      setIsDaytime(prevIsDaytime => {
        if (prevIsDaytime !== currentlyDaytimeNow) {
          // If it just turned night, make sure overlay is visible
          if (!currentlyDaytimeNow) {
            setIsNightOverlayVisible(true)
          }
          // If it just turned day, overlay will hide automatically via render logic
          return currentlyDaytimeNow // Update state
        }
        return prevIsDaytime // No change
      })

      // Update time until change string
      const remainingSeconds = (nextChangeEventSeconds - currentTotalSeconds + totalDaySeconds) % totalDaySeconds
      const remainingHours = Math.floor(remainingSeconds / 3600)
      const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60)
      // Translate time until change string
      setTimeUntilChange(`${remainingHours}h ${remainingMinutes}m hasta ${currentlyDaytimeNow ? "el atardecer" : "el amanecer"}`)

    }, 1000) // Update every second

    return () => clearInterval(interval) // Cleanup on unmount
  }, []) // Empty dependency array ensures this effect runs once for the interval

  // Calculate positioning for orbiting TOPICS
  const numTopics = topics.length // Use topics length
  const orbitRadius = 300
  const angleStep = numTopics > 0 ? (2 * Math.PI) / numTopics : 0 // Use numTopics

  // Handle Loading State
  if (loading) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-white dark:bg-black text-black dark:text-white overflow-hidden">
        {/* Translate loading text */}
        <p>Cargando noticias...</p>
      </main>
    );
  }

  // Handle Error State
  if (error) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-white dark:bg-black text-black dark:text-white overflow-hidden">
        {/* Translate error text */}
        <p className="text-red-500">Error al cargar noticias: {error.message}</p>
      </main>
    );
  }

  // Main component render when data is loaded
  return (
    // Wrap main content with AnimatePresence
    <AnimatePresence>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-white dark:bg-black text-black dark:text-white overflow-hidden">
        {/* Center Content Area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-medium font-serif mb-4 pointer-events-auto">houp.cl</h1>
            <DayNightVisor isDaytime={isDaytime} timeUntilChange={timeUntilChange} />
            {isDaytime && (
              <div className="mt-4 max-w-sm pointer-events-auto">
                {/* <FeaturedHeadline headline={mockFeaturedHeadline.headline} digest={mockFeaturedHeadline.digest} /> */}
              </div>
            )}
          </div>
        </div>

        {/* Orbiting TOPICS Container - Explicitly Centered */}
        <motion.div
          className="absolute planet"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{ rotate: 360 }}
          transition={{ ease: "linear", duration: 60, repeat: Infinity }}
        >
          {/* Map over fetched TOPICS */} 
          {topics.map((topic, index) => { // Use topics array
            const angle = angleStep * index - Math.PI / 2
            const x = orbitRadius * Math.cos(angle)
            const y = orbitRadius * Math.sin(angle)

            // Get metadata for the card and potential animation
            const gradient = getTopicGradient(topic);
            const name = topicNames[topic] || topic;
            const layoutId = `topic-${topic}`;

            return (
              <motion.div
                key={topic} // Use topic value as key
                className="absolute"
                style={{
                  left: '50%', 
                  top: '50%',
                  // Adjust position based on center origin
                  x: `calc(-50% + ${x}px)`,
                  y: `calc(-50% + ${y}px)`,
                  pointerEvents: 'auto'
                }}
                animate={{ rotate: -360 }}
                transition={{ ease: "linear", duration: 60, repeat: Infinity }}
              >
                {/* Pass topic, layoutId, and onClick handler */}
                <TopicCard 
                  topic={topic} 
                  layoutId={layoutId} 
                  onClick={() => setSelectedTopicData({ topic, gradient, name })} 
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Conditional Fullscreen Topic Animation Overlay */} 
        {selectedTopicData && (
          <motion.div
            layoutId={`topic-${selectedTopicData.topic}`}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: selectedTopicData.gradient,
              backgroundSize: "200% 200%",
              animation: "gradientMove 8s ease infinite",
            }}
            initial={{ borderRadius: '50%' }} // Start as circle
            animate={{ borderRadius: 0 }} // Animate to square
            exit={{ opacity: 0 }} // Fade out on exit (optional)
            transition={{ type: "spring", stiffness: 200, damping: 18 }} // Increased stiffness, slightly reduced damping
            onAnimationComplete={() => {
              // Navigate after animation finishes
              router.push(`/${selectedTopicData.topic}`);
            }}
          >
            {/* Keep noise overlay if desired */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ 
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
              }}
            />
            {/* Display only the title centered */}
            <motion.h1 
              className="relative z-10 text-5xl font-bold text-white font-serif"
              initial={{ opacity: 0 }} // Fade in text
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }} // Delay text appearance slightly
            >
              {selectedTopicData.name}
            </motion.h1>
          </motion.div>
        )}

        {/* Night overlay or alternative display - Conditionally rendered based on isNightOverlayVisible */}
        {isNightOverlayVisible && !isDaytime && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20 p-4">
            <MoonIcon className="h-16 w-16 text-indigo-400 mb-4" />
            {/* Translate overlay text */}
            <h2 className="text-2xl font-medium text-white mb-2 text-center">Houp está descansando</h2>
            <p className="text-gray-400 max-w-md text-center mb-4">
              Cerramos por la noche. Vuelve después del amanecer para tu dosis diaria de noticias positivas.
            </p>
            <p className="mt-2 text-sm text-indigo-300 mb-6">{timeUntilChange}</p>

            {/* Bypass Button - Translate text */}
            <button
              onClick={() => setIsNightOverlayVisible(false)} // Hide overlay on click
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              Espiar igual
            </button>
          </div>
        )}

        {/* Remove Mode Toggle */}
      </main>
    </AnimatePresence>
  )
}

// Remove springTransition as it's not directly used here anymore
