"use client"

import { useState, useEffect } from "react"
import { MoonIcon } from "@heroicons/react/24/outline"
import FeaturedHeadline from "@/components/featured-headline"
import CategoryCard from "@/components/category-card"
// import GraphMode from "@/components/graph-mode" // Not used in this layout
import { mockCategories, mockFeaturedHeadline } from "@/lib/mock-data"
import { motion } from "framer-motion"
import DayNightVisor from "@/components/day-night-visor"

// TODO: Implement half-circle Day/Night indicator component
// const DayNightIndicator = ({ isDaytime }) => { ... }

export default function Home() {
  // Remove mode and expandedCategory state
  const [isDaytime, setIsDaytime] = useState(true)
  const [timeUntilChange, setTimeUntilChange] = useState("")

  useEffect(() => {
    const calculateTimeState = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      const currentTotalSeconds = hours * 3600 + minutes * 60 + seconds
      const sunriseSeconds = 6 * 3600 // 6:00 AM
      const sunsetSeconds = 20 * 3600 // 8:00 PM
      const totalDaySeconds = 24 * 3600

      let nextChangeEventSeconds: number
      let currentlyDaytime: boolean

      if (currentTotalSeconds >= sunriseSeconds && currentTotalSeconds < sunsetSeconds) {
        currentlyDaytime = true
        nextChangeEventSeconds = sunsetSeconds
      } else {
        currentlyDaytime = false
        if (currentTotalSeconds < sunriseSeconds) {
          nextChangeEventSeconds = sunriseSeconds
        } else {
          nextChangeEventSeconds = sunriseSeconds + totalDaySeconds
        }
      }

      setIsDaytime(currentlyDaytime)

      const remainingSeconds = (nextChangeEventSeconds - currentTotalSeconds + totalDaySeconds) % totalDaySeconds
      const remainingHours = Math.floor(remainingSeconds / 3600)
      const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60)
      setTimeUntilChange(`${remainingHours}h ${remainingMinutes}m until ${currentlyDaytime ? "sunset" : "sunrise"}`)
    }

    calculateTimeState()
    const interval = setInterval(calculateTimeState, 1000)
    return () => clearInterval(interval)
  }, [])

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

      {/* Night overlay or alternative display */}
      {!isDaytime && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
          <MoonIcon className="h-16 w-16 text-indigo-400 mb-4" />
          <h2 className="text-2xl font-medium text-white mb-2">Houp is resting</h2>
          <p className="text-gray-400 max-w-md text-center">
            We're closed for the night. Return after sunrise for your daily dose of positive news.
          </p>
          <p className="mt-2 text-sm text-indigo-300">{timeUntilChange}</p>
        </div>
      )}

      {/* Remove Mode Toggle */}
    </main>
  )
}

// Remove springTransition as it's not directly used here anymore
