"use client";

import React from 'react';
import { Topic } from "@/lib/types";
import styles from './fullscreen-transition.module.css';
import { motion } from 'framer-motion';

interface FullscreenTransitionProps {
  topicData: {
    topic: Topic;
    gradient: string;
    name: string;
  } | null;
  onFadeInComplete?: () => void;
}

const FullscreenTransition: React.FC<FullscreenTransitionProps> = ({ topicData, onFadeInComplete }) => {
  if (!topicData) {
    return null;
  }

  return (
    <motion.div
      className={`${styles['transition-overlay']} bg-white`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      onAnimationComplete={onFadeInComplete}
    >
      <h1 className="font-serif text-4xl">
        {topicData.name}
      </h1>
    </motion.div>
  );
};

export default FullscreenTransition; 