"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useArticlesContext } from '@/context/ArticlesContext';
import { HomeIcon } from '@heroicons/react/20/solid';
import { sourceIcon } from '@/lib/topic-metadata';
import Image from 'next/image';
import { AuthorSource, Article } from '@/lib/types';
import { motion } from 'framer-motion';

interface AuthorStats {
    author: string;
    total: number;
    negative: number;
    negativityRate: number; // 0-100
    averageScore?: number; // 0-100, optional if no scored articles
}

// Helper function for Negativity Style
const getNegativityStyle = (rate: number): { barColor: string; textColorClass: string } => {
    if (rate < 20) return { barColor: 'hsl(0, 40%, 75%)', textColorClass: 'text-red-400 dark:text-red-500/80' }; // Lighter, less saturated red
    if (rate < 60) return { barColor: 'hsl(0, 60%, 60%)', textColorClass: 'text-red-500 dark:text-red-400' }; // Medium red
    return { barColor: 'hsl(0, 75%, 45%)', textColorClass: 'text-red-600 dark:text-red-300' }; // Darker, more saturated red
};

// Helper function for Positivity (Average Score) Style
const getPositivityStyle = (score: number | undefined): { barColor: string; textColorClass: string } => {
    if (score === undefined) return { barColor: 'hsl(210, 10%, 70%)', textColorClass: 'text-gray-500 dark:text-gray-400' }; // Neutral Gray
    const hue = score * 1.2; // 0-100 maps to 0-120 (Red to Green)
    if (score < 40) return { barColor: `hsl(${hue}, 55%, 60%)`, textColorClass: 'text-orange-500 dark:text-orange-400' }; // Reds/Oranges
    if (score < 70) return { barColor: `hsl(${hue}, 50%, 50%)`, textColorClass: 'text-yellow-500 dark:text-yellow-400' }; // Yellows/Lime
    return { barColor: `hsl(${hue}, 60%, 40%)`, textColorClass: 'text-green-600 dark:text-green-400' }; // Greens
};

const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function StatsPage() {
    const router = useRouter();
    const { allFetchedArticles, allAuthors, loading, error } = useArticlesContext();
    const [stats, setStats] = useState<AuthorStats[]>([]);

    useEffect(() => {
        if (!loading && allFetchedArticles.length > 0 && allAuthors.length > 0) {
            const calculatedStats: AuthorStats[] = allAuthors.map(author => {
                const authorArticles = allFetchedArticles.filter(a => a.author === author);
                const total = authorArticles.length;
                const negative = authorArticles.filter(a => a.sentiment === 'negative').length;
                const negativityRate = total > 0 ? Math.round((negative / total) * 100) : 0;
                
                // Average Score calculation
                const scoredArticles = authorArticles.filter(a => typeof a.score === 'number');
                const scoreSum = scoredArticles.reduce((sum, a) => sum + a.score!, 0);
                const averageScore = scoredArticles.length > 0 ? Math.round(scoreSum / scoredArticles.length) : undefined;

                return { author, total, negative, negativityRate, averageScore };
            });

            // Sort by negativity rate, descending
            calculatedStats.sort((a, b) => b.negativityRate - a.negativityRate);

            setStats(calculatedStats);
        }
    }, [loading, allFetchedArticles, allAuthors]);

    const handleHomeClick = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-red-100 dark:bg-red-900">
                <p className="text-red-600 dark:text-red-300">Error al cargar datos: {error.message}</p>
            </div>
        );
    }

    return (
        <motion.div
            className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <header className="sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={handleHomeClick}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Ir al inicio"
                        title="Ir al inicio"
                    >
                        <HomeIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-semibold font-serif">Estadísticas</h1>
                </div>
            </header>

            <main className="flex-grow p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Manifesto Section */}


                    {/* Stats Section */}
                    <section>
                        <h2 className="text-xl font-semibold font-serif mb-4">Estadísticas por Fuente</h2>
                        {stats.length > 0 ? (
                            <div className="space-y-3">
                                {stats.map(({ author, total, negative, negativityRate, averageScore }) => {
                                    const { symbol, src } = sourceIcon[author as AuthorSource] || {};
                                    // Get styles using helper functions
                                    const negativityStyle = getNegativityStyle(negativityRate);
                                    const positivityStyle = getPositivityStyle(averageScore);

                                    return (
                                        <div key={author} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                                            {/* Author Icon */}
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                                {symbol ? (
                                                    <span className="text-2xl text-gray-600 dark:text-gray-400 w-8 text-center"><i className={`sf-symbol sf-symbol-${symbol}`} /></span>
                                                ) : (
                                                    src ? <Image src={src} alt={author} width={32} height={32} className="rounded-sm object-contain" /> : <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                                                )}
                                            </div>
                                            {/* Author Name & Stats Text */} 
                                            <div className="flex-grow">
                                                <span className="font-medium text-gray-800 dark:text-gray-200 block mb-0.5">{author}</span>
                                                {/* Negativity Text - Use new text color class */}
                                                <div className={`text-xs ${negativityStyle.textColorClass}`}>
                                                   {negativityRate}% negatividad
                                                </div>
                                                {/* Positivity Score Text - Use new text color class */} 
                                                <div className={`text-xs mt-0.5 ${positivityStyle.textColorClass}`}>
                                                   {averageScore !== undefined ? `${averageScore} puntaje promedio` : '-- puntaje promedio'}
                                                </div>
                                            </div>
                                            
                                            {/* Stat Bars Container */} 
                                            <div className="flex flex-col gap-1.5 w-32 flex-shrink-0">
                                                {/* Negativity Bar & Percentage */} 
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className="h-1.5 rounded-full" 
                                                            style={{ width: `${negativityRate}%`, backgroundColor: negativityStyle.barColor }}
                                                        ></div>
                                                    </div>
                                                    {/* Use new text color class */}
                                                    <span className={`text-xs font-mono w-8 text-right ${negativityStyle.textColorClass}`}>{negativityRate}%</span>
                                                </div>
                                                {/* Average Score Bar & Percentage */} 
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className="h-1.5 rounded-full" 
                                                            style={{ width: `${averageScore ?? 0}%`, backgroundColor: positivityStyle.barColor }}
                                                        ></div>
                                                    </div>
                                                     {/* Use new text color class */}
                                                     <span className={`text-xs font-mono w-8 text-right ${positivityStyle.textColorClass}`}>
                                                       {averageScore !== undefined ? `${averageScore}%` : '--%'}
                                                     </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* "Coming Soon" Placeholder Card */} 
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center gap-4 opacity-60">
                                    {/* Gray Square */} 
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                                    {/* Text */} 
                                    <div className="flex-grow">
                                        <span className="font-medium text-gray-600 dark:text-gray-400 italic text-sm">Próximamente más fuentes...</span>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay datos de artículos para calcular estadísticas.</p>
                        )}
                    </section>
                </div>
            </main>

        </motion.div>
    );
} 