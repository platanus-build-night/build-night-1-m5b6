"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DayNightVisor from "@/components/day-night-visor";
import Footer from "@/components/footer";
import { useArticles } from "@/hooks/useArticles";
import { Topic, Article } from "@/lib/types"; // Import Article type
import { getTopicGradient, topicNames, getTopicIcon } from "@/lib/topic-metadata"; // Use original gradient
// Import specific Heroicons dynamically later or directly if few
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'; // Import pagination icons and search icon
import ArticleCard from "@/components/article-card"; // Import the new component
// import MovingTitlesBackground from "@/components/moving-titles-background"; // Import the new component

// Combine icon sets for easier lookup
const allIcons = { ...HeroIconsSolid };

// Constants
const ITEMS_PER_PAGE = 4;

// Define slide variants
const slideVariants = {
    initial: (direction: number) => ({
        x: direction > 0 ? '30%' : '-30%',
        opacity: 0,
        scale: 0.85,
    }),
    animate: {
        x: '0%',
        scale: 1,
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '30%' : '-30%',
        scale: 0.85,
        opacity: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
    }),
};

// Search bar animation variants
const searchBarVariants = {
    inactive: {
        width: "30em", // Expand to full width of parent container (max-w-md)
        maxWidth: "100%", // max-w-md = 28rem

    },
    active: {

        width: "100%", // Expand to full width of parent container (max-w-md)
        maxWidth: "100%", // max-w-md = 28rem
        transition: { duration: 0.3, ease: "easeInOut" }
    }
};

export default function TopicPage() {
    const params = useParams();
    const router = useRouter();
    const { topic: topicParam } = params; // Get topic from URL
    const { positiveArticles, negativeArticles, loading, error } = useArticles(); // Fetch all articles

    const [topicGradient, setTopicGradient] = useState<string>("");
    const [topicDisplayName, setTopicDisplayName] = useState<string>("");
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]); // Topic-filtered (and sorted)
    const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]); // Search-filtered subset
    const [TopicIconComponent, setTopicIconComponent] = useState<React.ElementType | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [isReady, setIsReady] = useState(false);
    const [isNavigatingBack, setIsNavigatingBack] = useState(false);
    const [slideDirection, setSlideDirection] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeSearchQuery, setActiveSearchQuery] = useState<string>(""); // State for the active search filter
    const searchInputRef = useRef<HTMLInputElement>(null); // Ref for search input
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false); // State for search focus

    // Effect 1: Filter by topic and sort (runs on initial load, topic change)
    useEffect(() => {
        if (loading || !topicParam) return;
        const currentTopic = topicParam as Topic;

        if (topicNames[currentTopic]) {
            const gradient = getTopicGradient(currentTopic); // Use original gradient
            const displayName = topicNames[currentTopic];
            const iconName = getTopicIcon(currentTopic);

            let topicArticles = positiveArticles.filter(
                (article) => article.topic === currentTopic
            );

            // Keep sorting by newest for now
            topicArticles.sort((a, b) => {
                const dateA = new Date(a.publishedDate).getTime();
                const dateB = new Date(b.publishedDate).getTime();
                return dateB - dateA; // Sort newest first
            });

            setTopicGradient(gradient);
            setTopicDisplayName(displayName);
            setFilteredArticles(topicArticles); // Set the base filtered/sorted list
            // Don't reset current page here, let the search effect handle it

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
            setFilteredArticles([]); // Clear articles if topic is invalid
            setTopicGradient(getTopicGradient("default" as Topic)); // Use original gradient for default
            setTopicIconComponent(null);
            setCurrentPage(0);
        }
    }, [loading, positiveArticles, topicParam, router]);

    // Effect 2: Filter displayed articles based on ACTIVE search query
    useEffect(() => {
        const lowerCaseQuery = activeSearchQuery.toLowerCase(); // Use active query
        if (!lowerCaseQuery) {
            setDisplayedArticles(filteredArticles); // No active query, show all topic-filtered
        } else {
            const searched = filteredArticles.filter(article =>
                article.title.toLowerCase().includes(lowerCaseQuery) ||
                article.digest.toLowerCase().includes(lowerCaseQuery)
            );
            setDisplayedArticles(searched);
        }
        setCurrentPage(0); // Reset page whenever active query or base list changes

    }, [activeSearchQuery, filteredArticles]); // Depend on activeSearchQuery

    // Effect 3: Control ready state (no change needed)
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

    // Effect 4: Keyboard shortcut listener (Cmd+K and Escape)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to focus
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
            }

            // Escape key to blur if focused
            if (event.key === 'Escape') {
                if (document.activeElement === searchInputRef.current) {
                    searchInputRef.current?.blur();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // Empty dependency array ensures this runs only once

    // Calculate pagination based on DISPLAYED articles
    const totalPages = Math.ceil(displayedArticles.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    // Slice DISPLAYED articles for the current page
    const currentArticles = displayedArticles.slice(startIndex, endIndex);

    // Pagination handlers
    const goToNextPage = () => {
        setSlideDirection(1); // Set direction before page change
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const goToPreviousPage = () => {
        setSlideDirection(-1); // Set direction before page change
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    // Pre-calculate loading display name
    const currentTopic = topicParam as Topic;
    const loadingDisplayName = topicNames[currentTopic] || "Cargando...";

    // Search Handlers
    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setActiveSearchQuery(searchTerm);
            searchInputRef.current?.blur(); // Optionally blur on enter
        }
    };
    const handleSearchSubmit = () => {
        setActiveSearchQuery(searchTerm);
        searchInputRef.current?.blur(); // Optionally blur on submit
    };

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
                    className="flex-grow flex flex-col items-center p-6 pb-16 relative overflow-visible bg-gray-50 dark:bg-gray-900"
                >
                    {/* Content Container */}
                    <div className="relative z-10 w-full max-w-4xl mx-auto flex-grow flex flex-col">
                        {/* Header Area - Centered Chip */}
                        <div className="flex justify-between items-center mb-4">
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

                        {/* Search Bar - Centered, Animated, Apple-like */}
                        <div className="mb-8 flex justify-center items-center gap-2"> {/* Added gap */}
                            {/* Animated container for input/icon/hint */}
                            <motion.div
                                className="relative" // Keep relative for positioning inside
                                variants={searchBarVariants}
                                animate={isSearchFocused ? "active" : "inactive"}
                            >
                                <input
                                    ref={searchInputRef} // Assign ref
                                    type="text"
                                    placeholder={isSearchFocused ? "Buscar..." : "Buscar..."} // Change placeholder based on focus
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="w-full rounded-full border-none bg-gray-100 dark:bg-gray-700 pl-10 pr-12 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300" // Added pr-12 for hint/button space
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                {/* Cmd+K Hint - Show when inactive and empty */}
                                {!isSearchFocused && !searchTerm && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-xs font-sans text-gray-400 dark:text-gray-500">
                                            ⌘K
                                        </kbd>
                                    </div>
                                )}
                            </motion.div>
                            {/* Submit Button */}
                            <button
                                onClick={handleSearchSubmit}
                                style={{ background: topicGradient }} // Use topic gradient
                                className="p-2 rounded-full text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                disabled={!searchTerm} // Disable if input is empty
                                aria-label="Buscar"
                            >
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* DayNightVisor - Placed below header, centered maybe? */}
                        <div className="flex justify-center my-4">
                            {/* Consider if DayNightVisor is needed here or handled globally */}
                            {/* <DayNightVisor /> */}
                        </div>

                        {/* Articles Container Wrapper - Removed overflow-hidden */}
                        <div className="relative flex flex-grow items-center justify-center"> {/* Removed overflow-hidden */}
                            {/* AnimatePresence for sliding grid */}
                            <AnimatePresence initial={false} custom={slideDirection}>
                                {/* Grid container */}
                                <motion.div
                                    key={currentPage + activeSearchQuery} // Use activeSearchQuery in key
                                    className="absolute flex flex-wrap justify-center gap-6" // Added absolute
                                    custom={slideDirection}
                                    variants={slideVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {currentArticles.length > 0 ? (
                                        currentArticles.map((article, index) => (
                                            <ArticleCard 
                                                key={article.id} 
                                                article={article} 
                                                index={index} 
                                                searchQuery={activeSearchQuery} // Pass active query
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10 w-full">
                                            <p>No se encontraron noticias {activeSearchQuery ? 'para "' + activeSearchQuery + '"' : ''}.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
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
                            Página {currentPage + 1} de {Math.ceil(displayedArticles.length / ITEMS_PER_PAGE)}
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