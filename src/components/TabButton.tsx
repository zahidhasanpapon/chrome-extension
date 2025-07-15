import React from 'react';
import { motion } from 'framer-motion';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  count?: number;
  theme?: 'light' | 'dark';
}

const TabButton: React.FC<TabButtonProps> = ({ 
  active, 
  onClick, 
  icon, 
  text, 
  count, 
  theme = 'light' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
        active
          ? 'bg-blue-500 text-white shadow-lg'
          : theme === 'dark'
          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-blue-500 rounded-lg"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
      <div className="relative flex items-center space-x-2">
        {icon}
        <span className="font-medium">{text}</span>
        {count !== undefined && count > 0 && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            active
              ? 'bg-white text-blue-500'
              : theme === 'dark'
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {count}
          </span>
        )}
      </div>
    </button>
  );
};

export default TabButton;
