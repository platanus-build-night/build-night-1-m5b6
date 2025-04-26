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
import Footer from "@/components/footer"
import FullscreenTransition from "@/components/fullscreen-transition"; // Import the new component

// Define the shape of the selected topic data
interface SelectedTopicData {
  topic: Topic;
  gradient: string;
  name: string;
  // layoutId: string; // No longer needed for this animation
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
  const [isTransitioning, setIsTransitioning] = useState(false); // New state for triggering animations

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

  // Handle click on TopicCard
  const handleTopicClick = (topicData: SelectedTopicData) => {
    // Prefetch the destination route
    router.prefetch(`/${topicData.topic}`);

    setSelectedTopicData(topicData); // Set the data for the overlay
    setIsTransitioning(true); // Trigger the transition animations
  };

  // Handle Loading State
  if (loading) {
    return (
      // Maintain main layout structure but only show title
      <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <main className="relative flex-grow flex flex-col items-center justify-center p-6 overflow-hidden">
          {/* Only the title centered */}
          <h1 className="text-3xl font-medium font-serif mb-4">houp.cl</h1>
        </main>
        {/* Footer is omitted during loading for simplicity */}
      </div>
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="relative flex-grow flex flex-col items-center justify-center p-6 overflow-hidden"> {/* Adjusted main styles */}
        {/* Wrap main content area for fade-out animation */}
        <motion.div
          className="w-full h-full flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }} // Disable interactions during fade out
        >
          {/* Center Content Area */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-medium font-serif mb-4 pointer-events-auto">houp.cl</h1>
              <DayNightVisor />

            </div>
          </div>

          <motion.div
            className="absolute planet"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", duration: 200, repeat: Infinity }}
          >
            {topics.map((topic, index) => {
              const angle = angleStep * index - Math.PI / 2
              const x = orbitRadius * Math.cos(angle)
              const y = orbitRadius * Math.sin(angle)

              const gradient = getTopicGradient(topic);
              const name = topicNames[topic] || topic;
              // const layoutId = `topic-${topic}`; // No longer needed

              return (
                <motion.div
                  key={topic}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    x: `calc(-50% + ${x}px)`,
                    y: `calc(-50% + ${y}px)`,
                    pointerEvents: 'auto'
                  }}
                  initial={{ opacity: 1 }} // Start visible
                >
                  {/* Inner div handles the counter-rotation */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ ease: "linear", duration: 199, repeat: Infinity }}
                  >
                    <TopicCard
                      topic={topic}
                      // layoutId={layoutId} // Remove layoutId
                      onClick={() => handleTopicClick({ topic, gradient, name })} // Call new handler
                    />
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div> {/* End of fade-out wrapper */}

        {/* Conditional Fullscreen Topic Animation Overlay - Render outside the fading wrapper */}
        <AnimatePresence>
          {selectedTopicData && (
            <FullscreenTransition
              topicData={selectedTopicData}
              onFadeInComplete={() => {
                // Ensure navigation only happens once animation is fully complete
                if (selectedTopicData?.topic) {
                    router.push(`/${selectedTopicData.topic}`);
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* {isNightOverlayVisible && !isDaytime && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20 p-4">
            <MoonIcon className="h-16 w-16 text-indigo-400 mb-4" />
            <h2 className="text-2xl font-se text-white mb-2 text-center">Houp está descansando</h2>
            <p className="text-gray-400 max-w-md text-center mb-4">
              Cerramos por la noche. Vuelve después del amanecer para tu dosis diaria de noticias positivas.
            </p>
            <p className="mt-2 text-sm text-indigo-300 mb-6">{timeUntilChange}</p>

            <button
              onClick={() => setIsNightOverlayVisible(false)} // Hide overlay on click
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              Espiar igual
            </button>
          </div>
        )} */}

      </main>
      <Footer /> {/* Footer is now outside main, at the bottom of the flex container */}
    </div>
  )
}

// Remove springTransition as it's not directly used here anymore
