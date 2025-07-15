import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  color: 'green' | 'blue' | 'red' | 'purple' | 'yellow';
  theme?: 'light' | 'dark';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color, 
  theme = 'light' 
}) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    red: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-indigo-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-xl transition-all duration-300 hover:shadow-lg ${
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-white hover:bg-gray-50 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {value}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {subtitle}
          </div>
        </div>
      </div>
      <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {title}
      </h3>
    </motion.div>
  );
};

export default StatsCard;
