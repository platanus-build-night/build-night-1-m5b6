"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Article } from '@/lib/types';

interface MovingWordStyle {
  id: number;
  text: string;
  top: string;
  left: string; // Initial horizontal position (usually off-screen)
  fontSize: string;
  opacity: number;
  animationDuration: string;
  animationDelay: string;
}

interface MovingTitlesBackgroundProps {
  articles: Article[];
  count?: number; // Number of words to display simultaneously
  baseColor?: string; // Base color for text (e.g., 'white', 'black')
}

const MovingTitlesBackground: React.FC<MovingTitlesBackgroundProps> = ({
  articles,
  count = 300, // Default to 30 words
  baseColor = 'white', // Default to white text
}) => {
  const [wordStyles, setWordStyles] = useState<MovingWordStyle[]>([]);

  // Memoize titles to avoid re-extracting on every render
  const titles = useMemo(() => articles.map(a => a.title).filter(Boolean), [articles]);

  useEffect(() => {
    if (titles.length === 0) {
        setWordStyles([]); // Clear if no titles
        return;
    };

    const generateStyles = (): MovingWordStyle[] => {
      const styles: MovingWordStyle[] = [];
      for (let i = 0; i < count; i++) {
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        styles.push({
          id: i,
          text: randomTitle,
          // Random vertical position
          top: `${Math.random() * 100}%`,
          // Start off-screen left (can adjust based on max word length if needed)
          left: `-${Math.random() * 30 + 20}%`, // Start further left randomly
          // Random font size
          fontSize: `${Math.random() * 1.5 + 0.75}rem`, // e.g., 0.75rem to 2.25rem
          // Very low, slightly random opacity
          opacity: Math.random() * 0.06 + 0.04, // e.g., 0.04 to 0.10
          // Random duration for variety
          animationDuration: `${Math.random() * 30 + 20}s`, // e.g., 20s to 50s
          // Random delay to stagger starts
          animationDelay: `${Math.random() * -40}s`, // Negative delay starts animation partway through
        });
      }
      return styles;
    };

    setWordStyles(generateStyles());

    // No need to return cleanup function if we only generate on titles/count change
  }, [titles, count]); // Regenerate if titles or count change

  return (
    <div
      className="absolute inset-0 overflow-hidden z-0 pointer-events-none"
      aria-hidden="true" // Hide from screen readers
    >
      {wordStyles.map((style) => (
        <span
          key={style.id}
          className="moving-word absolute whitespace-nowrap" // Use CSS class for animation
          style={{
            top: style.top,
            left: style.left,
            fontSize: style.fontSize,
            color: baseColor, // Use baseColor prop
            opacity: style.opacity,
            fontFamily: 'serif', // Apply serif font
            animationDuration: style.animationDuration,
            animationDelay: style.animationDelay,
            // Ensure animation properties are set correctly
            animationName: 'moveLeftToRight',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          {style.text}
        </span>
      ))}
    </div>
  );
};

export default MovingTitlesBackground; 