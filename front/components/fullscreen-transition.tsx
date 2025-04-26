"use client";

import React from 'react';
import { Topic } from "@/lib/types";
import { getTopicPhonetic } from "@/lib/topic-metadata";
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

    const transitionDuration = 1;

    return (
        <motion.div
            className={`${styles['transition-overlay']} relative bg-white flex flex-col items-center justify-center overflow-hidden`}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: transitionDuration, ease: "easeInOut" }}
            exit={{ opacity: 0, transition: { duration: transitionDuration / 2, ease: "easeInOut" } }}
            onAnimationComplete={onFadeInComplete}
        >
            <motion.div
                className="absolute top-0 left-0 w-full h-1"
                style={{ background: topicData.gradient, transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: transitionDuration, ease: "linear" }}
            />

            <h1 className="text-5xl font-bold font-serif text-black mb-1">
                {topicData.name}
            </h1>
            <small className="text-sm font-normal text-gray-600 mb-4">
                /{getTopicPhonetic(topicData.topic)}/
            </small>
        </motion.div>
    );
};

export default FullscreenTransition; 