"use client"

import { useState, useEffect } from "react"
import { MoonIcon, EyeIcon } from "@heroicons/react/24/outline"
import FeaturedHeadline from "@/components/featured-headline"
import CategoryCard from "@/components/category-card"
// import GraphMode from "@/components/graph-mode" // Not used in this layout
import { mockCategories, mockFeaturedHeadline } from "@/lib/mock-data"
import { motion } from "framer-motion"
import DayNightVisor from "@/components/day-night-visor"


export default function Home() {
  // Remove mode and expandedCategory state
  const [isDaytime, setIsDaytime] = useState(true)
  const [timeUntilChange, setTimeUntilChange] = useState("")
  // New state to control overlay visibility independently
  const [isNightOverlayVisible, setIsNightOverlayVisible] = useState(true)

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

  // Calculate positioning for orbiting categories
  const numCategories = mockCategories.length
  const orbitRadius = 300 // Increased radius for a larger orbit
  const angleStep = (2 * Math.PI) / numCategories

  return (
    // Main container: Full height, flex column, centered, relative for positioning children
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

      {/* Orbiting Categories Container - Explicitly Centered */}
      <motion.div
        className="absolute planet"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        animate={{ rotate: 360 }} // Continuous rotation
        transition={{ ease: "linear", duration: 60, repeat: Infinity }} // Adjust duration for speed
      >
        {mockCategories.map((category, index) => {
          const angle = angleStep * index - Math.PI / 2 // Start from top (-90 deg)
          const x = orbitRadius * Math.cos(angle)
          const y = orbitRadius * Math.sin(angle)

          return (
            <motion.div
              key={category.id}
              className="absolute planet"
              style={{
                left: '50%',
                top: '50%',
                x: x - 40, // Center the card (half of w-20)
                y: y - 40, // Center the card (half of h-20),
                pointerEvents: 'auto' // Make cards interactive
              }}
              // Counter-rotate the card itself to keep it upright
              animate={{ rotate: -360 }}
              transition={{ ease: "linear", duration: 60, repeat: Infinity }}
            >
              <CategoryCard category={category} />
            </motion.div>
          )
        })}
      </motion.div>

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
  )
}

// Remove springTransition as it's not directly used here anymore
