import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  theme: 'light' | 'dark';
  action?: {
    text: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, theme, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-12 rounded-xl text-center ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
      }`}
    >
      <div className={`flex justify-center mb-4 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
      }`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={`text-sm mb-6 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          {action.text}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
