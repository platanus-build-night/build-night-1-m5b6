"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DayNightVisor from "@/components/day-night-visor";
import Footer from "@/components/footer";
import { useArticles } from "@/hooks/useArticles";
import { Topic, Article } from "@/lib/types"; // Import Article type
import { getTopicGradient, topicNames, getTopicIcon } from "@/lib/topic-metadata"; // Use original gradient
// Import specific Heroicons dynamically later or directly if few
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'; // Import pagination icons
import ArticleCard from "@/components/article-card"; // Import the new component
// import MovingTitlesBackground from "@/components/moving-titles-background"; // Import the new component

// Combine icon sets for easier lookup
const allIcons = { ...HeroIconsSolid };

// Constants
const ITEMS_PER_PAGE = 4;

export default function TopicPage() {
    const params = useParams();
    const router = useRouter();
    const { topic: topicParam } = params; // Get topic from URL
    const { positiveArticles, negativeArticles, loading, error } = useArticles(); // Fetch all articles

    const [topicGradient, setTopicGradient] = useState<string>("");
    const [topicDisplayName, setTopicDisplayName] = useState<string>("");
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [TopicIconComponent, setTopicIconComponent] = useState<React.ElementType | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0); // Start at page 0
    const [isReady, setIsReady] = useState(false);
    const [isNavigatingBack, setIsNavigatingBack] = useState(false); // State for back navigation

    // Effect to process data once articles load and topic is known
    useEffect(() => {
        if (loading || !topicParam) return; // Wait for loading and param

        const currentTopic = topicParam as Topic; // Assume param is a valid Topic key

        // Validate if the topic exists in our defined topics
        if (topicNames[currentTopic]) {
            const gradient = getTopicGradient(currentTopic); // Use original gradient
            const displayName = topicNames[currentTopic];
            const iconName = getTopicIcon(currentTopic);

            // Filter articles for the current topic
            const topicArticles = positiveArticles.filter(
                (article) => article.topic === currentTopic
            );

            setTopicGradient(gradient);
            setTopicDisplayName(displayName);
            setFilteredArticles(topicArticles);
            setCurrentPage(0); // Reset to first page when topic changes or articles load

            // Dynamically get the icon component
            const Icon = (allIcons as any)[iconName];
            if (Icon) {
                setTopicIconComponent(() => Icon); // Set the component constructor
            } else {
                console.warn(`Icon "${iconName}" not found.`);
                setTopicIconComponent(null); // Or set a default icon component
            }

        } else {
            // Handle case where topic is invalid (e.g., redirect or show not found)
            console.error(`Invalid topic: ${currentTopic}`);
            // Optionally redirect: router.push('/404');
            setTopicDisplayName("Tema no encontrado");
            setFilteredArticles([]);
            setTopicGradient(getTopicGradient("default" as Topic)); // Use original gradient for default
            setTopicIconComponent(null);
            setCurrentPage(0);
        }
    }, [loading, positiveArticles, topicParam, router]); // Removed router from dependency array if not strictly needed for this effect's logic

    // Effect to control the ready state for animations
    useEffect(() => {
        if (!loading && topicDisplayName) {
            // Use a small timeout if needed to ensure loading screen appears briefly
            // const timer = setTimeout(() => setIsReady(true), 50);
            // return () => clearTimeout(timer);
            setIsReady(true);
        } else {
            setIsReady(false); // Reset if loading starts again or topic changes
        }
    }, [loading, topicDisplayName]);

    // Calculate pagination variables
    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentArticles = filteredArticles.slice(startIndex, endIndex);

    // Pagination handlers
    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    // Pre-calculate loading display name
    const currentTopic = topicParam as Topic;
    const loadingDisplayName = topicNames[currentTopic] || "Cargando...";

    // Back button handler
    const handleBackClick = () => {
        router.prefetch('/'); // Prefetch home route
        setIsNavigatingBack(true); // Trigger back navigation animation
    };

    // Handle Error State First (if an error occurs, we likely don't want to show content)
    if (error) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-red-100 dark:bg-red-900">
                <p className="text-red-600 dark:text-red-300">
                    Error al cargar noticias: {error.message}
                </p>
            </div>
        );
    }

    // Main component render with animated loading overlay
    return (
        <>
            <AnimatePresence>
                {/* Loading Overlay */}
                {!isReady && !isNavigatingBack && ( // Only show if not ready AND not navigating back
                    <motion.div
                        key="loading-screen"
                        className="fixed inset-0 flex flex-col min-h-screen items-center justify-center bg-white z-50"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                        <h1 className="font-serif text-4xl text-black">
                            {loadingDisplayName}
                        </h1>
                    </motion.div>
                )}

                {/* Back Navigation Overlay */}
                {isNavigatingBack && (
                    <motion.div
                        key="back-nav-screen"
                        className="fixed inset-0 flex items-center justify-center bg-white z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }} // Exit may not be visible due to navigation
                        transition={{ duration: 0.3 }}
                        onAnimationComplete={() => {
                            router.push('/'); // Navigate once overlay is visible
                        }}
                    >
                        <h1 className="font-serif text-4xl text-black">houp.cl</h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content container - fades in when ready, fades out when navigating back */}
            <motion.div
                className="flex flex-col min-h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: isReady && !isNavigatingBack ? 1 : 0 }} // Fade in when ready, fade out if navigating back
                transition={{ duration: 0.3 }} // Use same duration for fade in/out
            >
                <motion.main
                    className="flex-grow flex flex-col items-center p-6 pb-16 relative overflow-hidden bg-gray-50 dark:bg-gray-900"
                >
                    {/* Content Container */}
                    <div className="relative z-10 w-full max-w-4xl mx-auto flex-grow flex flex-col">
                        {/* Header Area - Centered Chip */}
                        <div className="flex justify-between items-center ">
                            <button
                                onClick={handleBackClick} // Use the new handler
                                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-full p-2 transition-colors"
                                aria-label="Volver al inicio"
                            >
                                <HeroIconsSolid.ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            {/* Topic Chip */}
                            <div
                                className="inline-flex items-center space-x-3 px-4 py-2 rounded-full text-white shadow-md"
                                style={{ background: topicGradient, backgroundSize: '200% 200%', animation: 'gradientMove 15s ease infinite' }} // Apply gradient here
                            >
                                {TopicIconComponent && <TopicIconComponent className="h-6 w-6 text-white" />} {/* Ensure white icon */}
                                <h1 className="text-xl font-bold font-serif text-white"> {/* Ensure white text */}
                                    {topicDisplayName}
                                </h1>
                            </div>
                            <div className="w-8"> {/* Placeholder for balance */}
                                {/* Potentially add DayNightVisor here if needed */}
                            </div>
                        </div>

                        {/* DayNightVisor - Placed below header, centered maybe? */}
                        <div className="flex justify-center my-4">
                            {/* Consider if DayNightVisor is needed here or handled globally */}
                            {/* <DayNightVisor /> */}
                        </div>

                        {/* Articles Grid now inside a container that doesn't grow */}
                        <div>
                            <div className="grid grid-cols-2 gap-6">
                                {currentArticles.length > 0 ? (
                                    currentArticles.map((article, index) => (
                                        <ArticleCard key={article.id} article={article} index={index} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-black py-10">
                                        <p>No hay noticias para mostrar en este momento.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.main>

                {totalPages > 1 && (
                    <div
                        className="fixed bottom-0 left-0 right-0 flex justify-center items-center space-x-4 p-2 z-20"
                    >
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                            className="p-1 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shadow"
                            style={{ background: topicGradient, backgroundSize: '200% 200%', animation: 'gradientMove 15s ease infinite' }}
                            aria-label="Página anterior"
                        >
                            <ChevronLeftIcon className="h-5 w-5 text-white" />
                        </button>
                        <span className="font-medium text-sm text-black dark:text-white">
                            Página {currentPage + 1} de {totalPages}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="p-1 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shadow"
                            style={{ background: topicGradient, backgroundSize: '200% 200%', animation: 'gradientMove 15s ease infinite' }}
                            aria-label="Página siguiente"
                        >
                            <ChevronRightIcon className="h-5 w-5 text-white" />
                        </button>
                    </div>
                )}
            </motion.div>
        </>
    );
}

// Add keyframes for gradient animation if not defined globally
// Ensure this CSS is available globally or add it here/inline
/*
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
*/ 