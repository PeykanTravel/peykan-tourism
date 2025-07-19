import React from 'react';
import { cn } from '@/lib/utils';
import { FaChevronDown } from 'react-icons/fa';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpen,
  className
}) => {
  const [activeItem, setActiveItem] = React.useState<string>(defaultOpen || '');

  const toggleItem = (id: string) => {
    setActiveItem(activeItem === id ? '' : id);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
          >
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.title}
            </span>
            <div className="flex-shrink-0 mr-4">
              <FaChevronDown
                className={cn(
                  'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300',
                  activeItem === item.id && 'rotate-180'
                )}
              />
            </div>
          </button>
          
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              activeItem === item.id 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0'
            )}
          >
            <div className="px-6 pb-4">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion; 