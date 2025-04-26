import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { sourceIcon } from '@/lib/topic-metadata'; // Use shared helper
import Image from 'next/image';
import { AuthorSource } from '@/lib/types';
interface AuthorFilterSidebarProps {
  allAuthors: string[];
  selectedAuthors: string[];
  onSelectionChange: (newSelection: string[]) => void;
}

const sidebarVariants = {
  closed: { x: '85%', opacity: 0.7 },
  open: { x: 0, opacity: 1 },
};

const AuthorFilterSidebar: React.FC<AuthorFilterSidebarProps> = ({
  allAuthors,
  selectedAuthors,
  onSelectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleAuthor = (author: string) => {
    const currentIndex = selectedAuthors.indexOf(author);
    const newSelected = [...selectedAuthors];

    if (currentIndex === -1) {
      newSelected.push(author);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    onSelectionChange(newSelected);
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-64 bg-gray-100 dark:bg-gray-800 shadow-lg z-40 flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-l-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
        aria-label={isOpen ? 'Cerrar filtros' : 'Abrir filtros'}
      >
        {isOpen
           ? <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
           : <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        }
      </button>

      {/* Header */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-600">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Filtrar por Fuente</h3>
      </div>

      {/* Author List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {allAuthors.map((author) => {
          const isSelected =  selectedAuthors.includes(author);
          const { symbol, src } = sourceIcon[author as AuthorSource] || {}; // Use helper
          return (
            <button
              key={author}
              onClick={() => handleToggleAuthor(author)}
              className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${ 
                isSelected
                  ? 'bg-indigo-100 dark:bg-indigo-900/50'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {symbol ? (
                 <span className="text-lg text-gray-600 dark:text-gray-400 w-6 text-center"><i className={`sf-symbol sf-symbol-${symbol}`} /></span>
              ) : (
                 src ? <Image src={src} alt={author} width={24} height={24} className="rounded-sm object-contain flex-shrink-0" /> : <div className="w-6 h-6 flex-shrink-0 bg-gray-300 dark:bg-gray-600 rounded-sm"></div> // Placeholder div
              )}
              <span className={`flex-grow text-sm truncate ${isSelected ? 'font-medium text-indigo-800 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                {author}
              </span>
            </button>
          );
        })}
      </div>

       {/* Clear Filter Button */}
       {selectedAuthors.length > 0 && (
         <div className="p-4 border-t border-gray-300 dark:border-gray-600">
           <button
             onClick={() => onSelectionChange([])}
             className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
           >
             Limpiar filtros
           </button>
         </div>
       )}
    </motion.div>
  );
};

export default AuthorFilterSidebar; 