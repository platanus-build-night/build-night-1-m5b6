import React from 'react';
import { useArticles } from '../hooks/useArticles';

const Footer: React.FC = () => {
    // Note: useArticles currently doesn't return the count of filtered negative articles.
    // We'll need to update the hook or fetch this data differently later.
    const { articles, loading, error } = useArticles();

    // Placeholder for the count of filtered negative news
    const filteredNegativeCount = articles.filter(article => article.sentiment === 'negative').length;

    const filteredPositiveCount = articles.filter(article => article.sentiment === 'positive' || article.sentiment === 'neutral').length;


    // Don't render anything if loading or error for a cleaner look
    if (loading || error) {
        return null;
    }

    return (
        <footer className="w-full py-4 text-center font-serif text-xs text-black absolute bottom-0 dark:text-gray-400">
            <p>
                <b className="text-red-700 dark:text-red-400">
                    {filteredNegativeCount}
                </b> noticias negativas fueron suprimidas para proteger tu calma.
                &nbsp;
                <b className="text-green-700 dark:text-green-400">
                    {filteredPositiveCount}
                </b> noticias informan.
            </p>
        </footer>
    );
};

export default Footer;
