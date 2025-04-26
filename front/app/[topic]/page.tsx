"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DayNightVisor from "@/components/day-night-visor";
import Footer from "@/components/footer";
import { useArticlesContext } from "@/context/ArticlesContext"; // Import context hook
import { Topic, Article } from "@/lib/types"; // Import Article type
import { getTopicGradient, topicNames, getTopicIcon } from "@/lib/topic-metadata"; // Use original gradient
// Import specific Heroicons dynamically later or directly if few
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'; // Import pagination icons and search icon
import ArticleCard from "@/components/article-card"; // Import the new component
import ExpandedArticleView from "@/components/expanded-article-view"; // Import new component
import AuthorFilterPill from "@/components/author-filter-sidebar"; // Corrected import path
// import MovingTitlesBackground from "@/components/moving-titles-background"; // Import the new component

// Combine icon sets for easier lookup
const allIcons = { ...HeroIconsSolid };

// Constants
const ITEMS_PER_PAGE = 4;

const ORBIT_ROTATION_DURATION = 225; // Assuming this might be used elsewhere, keeping it

// Define animation variants for page content entry
const pageContainerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      // Stagger the children animations
      staggerChildren: 0.1 // Adjust stagger delay as needed
    }
  },
};

const contentEntryVariant = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

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
        width: "24rem", // Specific inactive width (adjust as needed)
        transition: { duration: 0.3, ease: "easeInOut" }
    },
    active: {
        width: "100%", // Expand to full width of parent
        transition: { duration: 0.3, ease: "easeInOut" }
    }
};

export default function TopicPage() {
    const params = useParams();
    const router = useRouter();
    const { topic: topicParam } = params; // Get topic from URL
    const {
        articles, // This list is now author-filtered by the context
        allAuthors,
        selectedAuthors,
        updateSelectedAuthors,
        totalCountsPerAuthor, // Get total counts
        topicCountsPerAuthor, // Get all topic counts
        loading,
        error
    } = useArticlesContext(); // Use context hook

    const [topicGradient, setTopicGradient] = useState<string>("");
    const [topicDisplayName, setTopicDisplayName] = useState<string>("");
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]); // Topic-filtered subset of hook's articles
    const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]); // Search-filtered subset of topic-filtered
    const [TopicIconComponent, setTopicIconComponent] = useState<React.ElementType | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [isReady, setIsReady] = useState(false);
    const [isNavigatingBack, setIsNavigatingBack] = useState(false);
    const [slideDirection, setSlideDirection] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeSearchQuery, setActiveSearchQuery] = useState<string>(""); // State for the active search filter
    const searchInputRef = useRef<HTMLInputElement>(null); // Ref for search input
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false); // State for search focus
    const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null); // State for expanded card

    // Effect 1: Filter by topic (based on author-filtered articles from hook)
    useEffect(() => {
        if (loading || !topicParam) return;
        const currentTopic = topicParam as Topic;
        const baseArticles = articles; // Use author-filtered articles from hook

        if (topicNames[currentTopic]) {
            const gradient = getTopicGradient(currentTopic); // Use original gradient
            const displayName = topicNames[currentTopic];
            const iconName = getTopicIcon(currentTopic);

            // Filter the author-filtered list by topic
            let topicFiltered = baseArticles.filter(
                (article) => article.topic === currentTopic
            );

            // Sort
            topicFiltered.sort((a, b) => {
                const dateA = new Date(a.publishedDate).getTime();
                const dateB = new Date(b.publishedDate).getTime();
                return dateB - dateA; // Sort newest first
            });

            setTopicGradient(gradient);
            setTopicDisplayName(displayName);
            setFilteredArticles(topicFiltered); // Set Topic & Author filtered list

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
    }, [loading, articles, topicParam, router]);

    // Effect 2: Search Filter (based on topic & author filtered list)
    useEffect(() => {
        const lowerCaseQuery = activeSearchQuery.toLowerCase();
        if (!lowerCaseQuery) {
            setDisplayedArticles(filteredArticles); // Use topic/author filtered list
        } else {
            const searched = filteredArticles.filter(article =>
                article.title.toLowerCase().includes(lowerCaseQuery) ||
                article.digest.toLowerCase().includes(lowerCaseQuery) ||
                (article.content && article.content.toLowerCase().includes(lowerCaseQuery))
            );
            setDisplayedArticles(searched);
        }
        setCurrentPage(0);
    }, [activeSearchQuery, filteredArticles]);

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

    // Effect 4: Keyboard shortcut listener (Cmd+K, Escape, Option+Symbol)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            console.log("Key pressed:", event.key, "Alt key:", event.altKey); // Log key press

            // Cmd+K or Ctrl+K to focus search
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
                return; // Don't process other shortcuts if this matches
            }

            // Escape key to blur search or close modal
            if (event.key === 'Escape') {
                if (document.activeElement === searchInputRef.current) {
                    searchInputRef.current?.blur();
                } else if (expandedArticleId) { // Close expanded view if open
                    setExpandedArticleId(null);
                }
                return; // Don't process other shortcuts
            }

            // Option + Symbol mapped to 1/2/3/4
            const keyMappings: { [key: string]: number } = {
                '¡': 1, // Option+1 typically
                '“': 2, // Option+2 typically
                '£': 3, // Option+3 typically
                '¢': 4, // Option+4 typically
                // Add other potential mappings if needed for different layouts/OS
            };

            if (event.altKey && keyMappings[event.key]) {
                console.log(`Option + Symbol (${event.key}) detected`);

                if (document.activeElement === searchInputRef.current) {
                    console.log("Search input focused, ignoring card shortcut.");
                    return;
                }

                event.preventDefault();
                const keyNumber = keyMappings[event.key];
                const targetIndex = keyNumber - 1; // Convert 1-4 to index 0-3
                console.log("Target index:", targetIndex);

                const currentStartIndex = currentPage * ITEMS_PER_PAGE;
                const currentEndIndex = currentStartIndex + ITEMS_PER_PAGE;
                const articlesOnPage = displayedArticles.slice(currentStartIndex, currentEndIndex);
                console.log("Articles on page count:", articlesOnPage.length);

                if (targetIndex >= 0 && targetIndex < articlesOnPage.length) {
                    const articleToOpen = articlesOnPage[targetIndex];
                    if (articleToOpen) {
                        console.log("Opening article:", articleToOpen.id);
                        setExpandedArticleId(articleToOpen.id);
                    } else {
                        console.log("Article at index not found?");
                    }
                } else {
                    console.log("Target index out of bounds.");
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
        // Dependencies: Include everything needed to calculate articlesOnPage and check state
    }, [displayedArticles, currentPage, expandedArticleId]);

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

    // --- Find the currently expanded article ---
    const expandedArticle = displayedArticles.find(
        (article) => article.id === expandedArticleId
    );

    // --- Get current topic and counts for sidebar --- 
    const currentTopicCounts = currentTopic && topicCountsPerAuthor[currentTopic]
        ? topicCountsPerAuthor[currentTopic]
        : {};

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

    // Main component render when data is loaded
    return (
        <>
            <AnimatePresence>
                {/* Loading Overlay */}
                {!isReady && !isNavigatingBack && (
                    <motion.div
                        key="loading-screen"
                        className="fixed inset-0 flex flex-col min-h-screen items-center justify-center bg-white z-30"
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
                        className="fixed inset-0 flex items-center justify-center bg-white z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onAnimationComplete={() => {
                            router.push('/');
                        }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-5xl font-bold font-serif mb-1 pointer-events-auto">houp.cl</h1>
                            <small className="text-sm font-normal mb-4 pointer-events-auto">/həʊp/</small>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content container - apply pageContainerVariants */} 
            <motion.div
                className="flex flex-col min-h-screen"
                variants={pageContainerVariants} // Apply container variants
                initial="initial" // Start faded out
                animate={isReady && !isNavigatingBack ? "animate" : "initial"} // Animate in when ready
                // Remove direct opacity animation, handled by variants now
                // initial={{ opacity: 0 }}
                // animate={{ opacity: isReady && !isNavigatingBack && !expandedArticleId ? 1 : 0.5 }}
                // transition={{ duration: 0.3 }}
            >
                <motion.main 
                    // Inherit variants from parent is fine, or apply specific ones if needed later
                    className="flex-grow flex flex-col items-center p-6 pb-16 relative overflow-visible bg-gray-50 dark:bg-gray-900"
                >
                    {/* Content Container */} 
                    <div className="relative z-10 w-full max-w-4xl mx-auto flex-grow flex flex-col">
                        {/* Wrap Header/Search section */} 
                        <motion.div variants={contentEntryVariant}> 
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
                            <div className=" flex justify-center items-center gap-2 mb-4"> {/* Added bottom margin */} 
                                {/* Animated container for input/icon/hint */}
                                <motion.div
                                    className="relative max-w-lg" // Use max-w-lg or max-w-md as the constraint
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
                                        className="w-full rounded-full border-none bg-gray-100 dark:bg-gray-700 pl-10 pr-12 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300" // Removed transition-all, rely on motion
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
                        </motion.div> {/* End Header/Search Wrapper */} 

                        {/* DayNightVisor - Placed below header, centered maybe? */} 
                        <div className="flex justify-center my-4">
                            {/* Consider if DayNightVisor is needed here or handled globally */}
                            {/* <DayNightVisor /> */}
                        </div>

                        {/* Wrap Articles Container */} 
                        <motion.div 
                            variants={contentEntryVariant} 
                            className="relative flex flex-grow items-center justify-center" // Added class here
                        >
                            {/* AnimatePresence for sliding grid */} 
                            <AnimatePresence initial={false} custom={slideDirection}>
                                {/* Grid container - animations here are for pagination */} 
                                <motion.div
                                    key={currentPage + activeSearchQuery} 
                                    className={`absolute flex flex-wrap justify-center gap-6 ${expandedArticleId ? 'pointer-events-none' : ''}`} 
                                    custom={slideDirection}
                                    variants={slideVariants} // Keep pagination variants
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {currentArticles.length > 0 ? (
                                        currentArticles.map((article, pageIndex) => (
                                            <ArticleCard
                                                key={article.id}
                                                article={article}
                                                index={pageIndex} // Keep original index for potential stagger
                                                pageIndex={pageIndex} // Pass index within the page (0-3)
                                                searchQuery={activeSearchQuery}
                                                layoutId={article.id}
                                                onClick={() => setExpandedArticleId(article.id)}
                                                isExpanded={expandedArticleId === article.id}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10 w-full">
                                            <p>No se encontraron noticias {activeSearchQuery ? 'para "' + activeSearchQuery + '"' : ''}.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div> {/* End Articles Container Wrapper */} 
                    </div>
                </motion.main>

                {totalPages > 1 && !expandedArticleId && (
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

            {/* Expanded Article View - Rendered outside main container */}
            <AnimatePresence>
                {expandedArticle && (
                    <ExpandedArticleView
                        key="expanded-article" // Consistent key for AnimatePresence
                        article={expandedArticle}
                        layoutId={expandedArticle.id} // Pass same layoutId
                        onClose={() => setExpandedArticleId(null)} // Pass close handler
                        searchQuery={activeSearchQuery} // Pass the active search query
                    />
                )}
            </AnimatePresence>

            {/* Author Filter Sidebar - Render outside main content flow */}
            {!loading && allAuthors.length > 0 && (
                <AuthorFilterPill
                    allAuthors={allAuthors}
                    selectedAuthors={selectedAuthors}
                    onSelectionChange={updateSelectedAuthors}
                    totalCounts={totalCountsPerAuthor} // Pass total counts
                    topicCounts={currentTopicCounts} // Pass counts for current topic
                    currentTopic={currentTopic} // Pass current topic
                />
            )}
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