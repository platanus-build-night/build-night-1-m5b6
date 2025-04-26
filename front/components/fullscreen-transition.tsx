"use client";

import React from 'react';
import { Topic, topicPhonetics } from "@/lib/types";
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
            className={`${styles['transition-overlay']} bg-white flex flex-col items-center justify-center`}
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
            <h1 className="text-6xl font-bold font-serif text-black mb-1">
                {topicData.name}
            </h1>
            <small className="text-lg font-normal text-gray-600 mb-4">
                {getTopicPhonetic(topicData.topic)}
            </small>
        </motion.div>
    );
};

export default FullscreenTransition; 