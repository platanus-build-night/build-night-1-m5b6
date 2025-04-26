import React from 'react';
import { sourceIcon } from '@/lib/topic-metadata';
import Image from 'next/image';
import { AuthorSource, Topic } from '@/lib/types';
import { CheckBadgeIcon, GlobeAmericasIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

interface AuthorFilterPillProps {
  allAuthors: string[];
  selectedAuthors: string[];
  onSelectionChange: (newSelection: string[]) => void;
  totalCounts: { [author: string]: number };
  topicCounts: { [author: string]: number };
  currentTopic: Topic | null;
}

const AuthorFilterPill: React.FC<AuthorFilterPillProps> = ({
  allAuthors,
  selectedAuthors,
  onSelectionChange,
  totalCounts,
  topicCounts,
  currentTopic,
}) => {

  const handleToggleAuthor = (author: string) => {
    const currentIndex = selectedAuthors.indexOf(author);
    const newSelected = [...selectedAuthors];

    if (currentIndex === -1) {
      newSelected.push(author);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    // Prevent deselecting the last author if needed (optional)
    // if (newSelected.length === 0) return; 
    onSelectionChange(newSelected);
  };

  // Don't render if no authors
  if (!allAuthors || allAuthors.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 
                 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md 
                 rounded-full shadow-lg p-2 flex flex-col items-center space-y-2"
    >
      {/* Select All Button (Top) */}
      <div className="relative group">
        <button
          onClick={() => onSelectionChange(allAuthors)}
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          aria-label="Seleccionar todas las fuentes"
        // title attribute removed as we have a custom tooltip
        >
          <GlobeAmericasIcon className="w-6 h-6" />
        </button>
        {/* Custom Tooltip */}
        <span
        
        className="absolute top-1/2 right-full -translate-y-1/2 mr-2 

                     whitespace-nowrap rounded bg-gray-900 dark:bg-gray-700 px-2 py-1 text-xs text-white opacity-0 
                     group-hover:opacity-100 transition-opacity duration-200 pointer-events-none scale-95 group-hover:scale-100"
        >
          Seleccionar Todas
        </span>
      </div>

      {/* Author Icons */}
      <div className="flex flex-col items-center space-y-2 my-1"> {/* Added a wrapper for potential scroll later */}
        {allAuthors.map((author) => {
          const isSelected = selectedAuthors.includes(author);
          const { symbol, src } = sourceIcon[author as AuthorSource] || {};
          const count = currentTopic
            ? topicCounts[author] || 0
            : totalCounts[author] || 0;

          // Skip rendering if count is 0 for the current view?
          // if (count === 0) return null; 

          return (
            <button
              key={author}
              onClick={() => handleToggleAuthor(author)}
              className={`relative p-1 rounded-full transition-all duration-200 ease-in-out 
                         hover:scale-110 
                         ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              aria-label={`Filtrar por ${author} (${isSelected ? 'seleccionado' : 'no seleccionado'})`}
              title={`${author} (${count})`}
            >
              {/* Icon/Image */}
              <div className="w-7 h-7 flex items-center justify-center">
                {symbol ? (
                  <span className="text-xl text-gray-700 dark:text-gray-300 w-7 text-center"><i className={`sf-symbol sf-symbol-${symbol}`} /></span>
                ) : (
                  src ? <Image src={src} alt={author} width={28} height={28} className="rounded-full object-contain flex-shrink-0" /> : <div className="w-7 h-7 flex-shrink-0 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                )}
              </div>

              {/* Count Badge - position absolute top-right */}
              {count > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-medium 
                             min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full 
                             ${isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-400 dark:bg-gray-600 text-white'}
                             ring-1 ring-white dark:ring-gray-800/80`} // Ring to separate from background
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Deselect All Button (Bottom) */}
      <div className="relative group">
        <button
          onClick={() => onSelectionChange([])}
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
          aria-label="Deseleccionar todas las fuentes"
        // title attribute removed as we have a custom tooltip
        >
          <NoSymbolIcon className="w-6 h-6" />
        </button>
        {/* Custom Tooltip */}
        <span
          className="absolute top-1/2 right-full -translate-y-1/2 mr-2 
                     whitespace-nowrap rounded bg-gray-900 dark:bg-gray-700 px-2 py-1 text-xs text-white opacity-0 
                     group-hover:opacity-100 transition-opacity duration-200 pointer-events-none scale-95 group-hover:scale-100"
        >
          Deseleccionar Todas
        </span>
      </div>
    </div>
  );
};

export default AuthorFilterPill; 