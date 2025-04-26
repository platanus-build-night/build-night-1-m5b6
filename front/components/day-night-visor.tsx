// components/DayNightVisor.tsx
"use client";

import { useState, useEffect } from "react";

const SUNRISE_HOUR = 6;
const SUNSET_HOUR = 20;

// Renamed and made default export
export default function DayNightVisor() {
  // Integrated time logic directly into the component
  const [cycleInfo, setCycleInfo] = useState({
    isDaytime: true,
    progress: 0,
    timeUntilChange: "",
  });

  useEffect(() => {
    const calculateCycle = () => {
      const now = new Date();
      const nowMs = now.getTime();

      // Calculate event times for today
      const todaySunrise = new Date(now);
      todaySunrise.setHours(SUNRISE_HOUR, 0, 0, 0);
      const todaySunriseMs = todaySunrise.getTime();

      const todaySunset = new Date(now);
      todaySunset.setHours(SUNSET_HOUR, 0, 0, 0);
      const todaySunsetMs = todaySunset.getTime();

      // Determine current state (day/night)
      const isDay = nowMs >= todaySunriseMs && nowMs < todaySunsetMs;

      // Calculate progress (using hrs for simplicity here, matches previous logic)
      const hrs = now.getHours() + now.getMinutes() / 60;
      let progress: number;
      const dayLength = SUNSET_HOUR - SUNRISE_HOUR;
      const nightLength = 24 - dayLength;
      if (isDay) {
        progress = (hrs - SUNRISE_HOUR) / dayLength;
      } else {
        progress = hrs >= SUNSET_HOUR
          ? (hrs - SUNSET_HOUR) / nightLength
          : (hrs + (24 - SUNSET_HOUR)) / nightLength;
      }
      progress = Math.min(Math.max(progress, 0), 1);

      // --- Revised time until next event calculation ---
      let nextEventMs: number;
      let nextEventName: string;

      if (isDay) {
        // Currently daytime, next event is sunset today
        nextEventMs = todaySunsetMs;
        nextEventName = "el atardecer";
      } else {
        // Currently nighttime
        if (nowMs < todaySunriseMs) {
          // It's before sunrise today (e.g., 2 AM)
          nextEventMs = todaySunriseMs;
          nextEventName = "el amanecer";
        } else {
          // It's after sunset today (e.g., 10 PM)
          // Next event is sunrise tomorrow
          const tomorrowSunrise = new Date(now);
          tomorrowSunrise.setDate(tomorrowSunrise.getDate() + 1);
          tomorrowSunrise.setHours(SUNRISE_HOUR, 0, 0, 0);
          nextEventMs = tomorrowSunrise.getTime();
          nextEventName = "el amanecer";
        }
      }

      // Calculate difference and format string
      const diffMs = nextEventMs - nowMs;

      // Basic safety check for positive difference
      if (diffMs < 0) {
          console.error("Calculated negative time difference, check logic.", { nowMs, nextEventMs });
          // Avoid displaying negative/incorrect time
          setCycleInfo({ isDaytime: isDay, progress, timeUntilChange: "Calculando..." });
          return;
      }

      const diffH = Math.floor(diffMs / 3_600_000);
      const diffM = Math.floor((diffMs % 3_600_000) / 60_000);

      // Safety check for hour calculation (should not exceed ~14/10 hours)
      if (diffH >= 24) {
           console.error(`Calculated hours (${diffH}) exceed 24. Check logic.`, { diffMs, nextEventMs, nowMs });
           // Avoid displaying large incorrect hours
           setCycleInfo({ isDaytime: isDay, progress, timeUntilChange: "Error cálculo" });
           return;
      }
      // --- End of revised calculation ---

      const timeUntil = `${diffH}h ${diffM}m para ${nextEventName}`;

      setCycleInfo({ isDaytime: isDay, progress, timeUntilChange: timeUntil });
    };

    calculateCycle(); // Initial calculation
    const id = setInterval(calculateCycle, 60_000); // Update every minute

    return () => clearInterval(id);
  }, []);

  const { isDaytime, progress, timeUntilChange } = cycleInfo;

  // Refined gradients and styling
  const bgClass = isDaytime
    ? "from-yellow-300 via-orange-300 to-red-300" // Warmer day gradient
    : "from-indigo-700 via-purple-800 to-gray-900"; // Deeper night gradient

  return (
    <div className="w-full max-w-[150px] mx-auto py-2 px-1"> {/* Slightly smaller max-width */} 
      <div className={`relative h-2 rounded-full bg-gradient-to-r ${bgClass}`}> 
        {/* Simplified marker with transition */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-[left] duration-1000 ease-linear`}
          style={{ left: `${progress * 100}%` }}
        >
          {/* Add a colored circle background */}
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center shadow-md ${ // Added shadow for depth
              isDaytime ? 'bg-yellow-400' : 'bg-indigo-500'
            }`}
          >
            <span className="text-[10px] leading-none"> {/* Adjusted icon size further and line-height for better fit */}
              {isDaytime ? "☀️" : "🌕"} {/* Use full moon emoji */}
            </span>
          </div>
        </div>
      </div>
      {/* Standard font, slightly smaller text */}
      <div className="mt-1.5 text-[11px] font-sans text-gray-500 dark:text-gray-400 text-center">
        {timeUntilChange}
      </div>
    </div>
  );
}

// Removed MeridianVisor, SunbeamVisor, and useDayNightCycle hook
