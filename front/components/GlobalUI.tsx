"use client";

import React from 'react';
import AuthorFilterPill from './author-filter-sidebar';
import { useArticlesContext } from '@/context/ArticlesContext';
import { useParams, useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { Topic } from '@/lib/types';
import { ChartBarIcon } from '@heroicons/react/24/outline'; // Import stats icon

export default function GlobalUI() {
  const router = useRouter(); // Initialize router
  const pathname = usePathname(); // Get current path
  const {
    allAuthors,
    selectedAuthors,
    updateSelectedAuthors,
    totalCountsPerAuthor,
    topicCountsPerAuthor,
    loading
  } = useArticlesContext();

  const params = useParams();
  const currentTopic = params.topic as Topic || null; // Get topic from URL, null if home

  // Get the counts for the current topic, or an empty object if no topic is selected
  const currentTopicCounts = currentTopic && topicCountsPerAuthor[currentTopic]
    ? topicCountsPerAuthor[currentTopic]
    : {};

  const goToStats = () => {
    router.push('/stats');
  };

  // Determine if the sidebar should be rendered
  const shouldRenderSidebar = !loading && allAuthors.length > 0 && pathname !== '/stats';
  // Determine if the stats button should be rendered
  const shouldRenderStatsButton = pathname !== '/stats';

  return (
    <>
      {/* Stats Button - Top Left (Conditional) */}
      {shouldRenderStatsButton && (
        <button
          onClick={goToStats}
          className="fixed top-4 left-4 z-20 p-2 rounded-lg bg-gray-200/70 dark:bg-gray-700/70 backdrop-blur-sm shadow hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors"
          aria-label="Ver estadísticas"
          title="Estadísticas"
        >
          <ChartBarIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Author Filter Pill (Conditional) */}
      {shouldRenderSidebar && (
        <AuthorFilterPill
          allAuthors={allAuthors}
          selectedAuthors={selectedAuthors}
          onSelectionChange={updateSelectedAuthors}
          totalCounts={totalCountsPerAuthor}
          topicCounts={currentTopicCounts}
          currentTopic={currentTopic}
        />
      )}
    </>
  );
} 