"use client";

import React from 'react';
import AuthorFilterPill from './author-filter-sidebar';
import { useArticlesContext } from '@/context/ArticlesContext';
import { useParams } from 'next/navigation'; // To get current topic
import { Topic } from '@/lib/types';

export default function GlobalUI() {
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

  // Only render sidebar if not loading and authors exist
  if (loading || allAuthors.length === 0) {
    return null;
  }

  return (
    <AuthorFilterPill
      allAuthors={allAuthors}
      selectedAuthors={selectedAuthors}
      onSelectionChange={updateSelectedAuthors}
      totalCounts={totalCountsPerAuthor}
      topicCounts={currentTopicCounts}
      currentTopic={currentTopic}
    />
  );
} 