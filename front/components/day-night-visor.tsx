"use client"
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid" // Using solid icons
import { useEffect, useState } from "react"

interface DayNightVisorProps {
  isDaytime: boolean
  timeUntilChange: string
}

const sunriseHour = 6 // 6 AM
const sunsetHour = 20 // 8 PM
const totalDayHours = 24
const dayDurationHours = sunsetHour - sunriseHour
const nightDurationHours = totalDayHours - dayDurationHours

export default function DayNightVisor({ isDaytime, timeUntilChange }: DayNightVisorProps) {
  const [progress, setProgress] = useState(0) // 0 to 1 representing cycle progress

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const currentTimeInHours = hours + minutes / 60 + seconds / 3600

      let currentProgress = 0
      if (isDaytime) {
        // Progress through the day (6 AM to 8 PM)
        currentProgress = (currentTimeInHours - sunriseHour) / dayDurationHours
      } else {
        // Progress through the night
        if (currentTimeInHours >= sunsetHour) {
          // Evening/night part (8 PM to midnight)
          currentProgress = (currentTimeInHours - sunsetHour) / nightDurationHours
        } else {
          // Early morning part (midnight to 6 AM)
          currentProgress = (currentTimeInHours + (totalDayHours - sunsetHour)) / nightDurationHours
        }
      }
      setProgress(Math.max(0, Math.min(1, currentProgress))) // Clamp between 0 and 1
    }

    calculateProgress()
    const interval = setInterval(calculateProgress, 60000) // Update progress every minute

    return () => clearInterval(interval)
  }, [isDaytime]) // Recalculate if isDaytime changes (though page logic handles this)

  // SVG properties
  const svgWidth = 200
  const svgHeight = 100 // Half the width for a semicircle
  const cx = svgWidth / 2
  const cy = svgHeight
  const radius = svgWidth / 2

  // Calculate sun/moon position along the arc
  // Angle goes from Math.PI (left, sunrise/sunset) to 0 (right, sunset/sunrise)
  // For daytime: progress 0 (sunrise) is PI, progress 1 (sunset) is 0
  // For nighttime: progress 0 (sunset) is 0, progress 1 (sunrise) is PI
  const angle = isDaytime ? Math.PI * (1 - progress) : Math.PI * progress

  const iconX = cx + radius * Math.cos(angle)
  const iconY = cy - radius * Math.sin(angle) // Y is inverted in SVG

  const iconSize = 20 // Size of the sun/moon icon

  const dayGradientId = "dayGradient"
  const nightGradientId = "nightGradient"

  return (
    <div className="relative w-full max-w-[200px] mx-auto flex flex-col items-center">
      {/* SVG Visor */}
      <svg width={svgWidth} height={svgHeight + iconSize / 2} viewBox={`0 0 ${svgWidth} ${svgHeight + iconSize / 2}`}>
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id={dayGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "rgb(251 191 36)", stopOpacity: 1 }} /> {/* amber-400 */}
            <stop offset="100%" style={{ stopColor: "rgb(253 186 116)", stopOpacity: 1 }} /> {/* amber-300 */}
          </linearGradient>
          <linearGradient id={nightGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "rgb(79 70 229)", stopOpacity: 1 }} /> {/* indigo-700 */}
            <stop offset="100%" style={{ stopColor: "rgb(129 140 248)", stopOpacity: 1 }} /> {/* indigo-400 */}
          </linearGradient>
        </defs>

        {/* Background Arc */}
        <path
          d={`M 0 ${cy} A ${radius} ${radius} 0 0 1 ${svgWidth} ${cy}`}
          fill={isDaytime ? `url(#${dayGradientId})` : `url(#${nightGradientId})`}
          stroke={isDaytime ? "rgb(252 211 77)" : "rgb(99 102 241)"} // amber-300 / indigo-500
          strokeWidth="1"
        />

        {/* Sun/Moon Icon */}
        <g transform={`translate(${iconX - iconSize / 2}, ${iconY - iconSize / 2})`}>
          {isDaytime ? (
            <SunIcon className="h-5 w-5 text-yellow-300" style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))" }} />
          ) : (
            <MoonIcon className="h-5 w-5 text-indigo-200" style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))" }} />
          )}
        </g>
      </svg>

      {/* Timer Text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{timeUntilChange}</p>
    </div>
  )
} 