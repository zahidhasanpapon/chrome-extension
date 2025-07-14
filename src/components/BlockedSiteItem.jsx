import { motion } from 'framer-motion';
import { Unlock, Globe } from 'lucide-react';

export default function BlockedSiteItem({ site, onUnblock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="blocked-site-item"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="p-2 rounded-full bg-accent-100 text-accent-600">
            <Globe className="w-4 h-4" />
          </div>
          
          <span className="flex-1 text-lg font-mono text-gray-800 bg-white/50 px-3 py-1 rounded-lg">
            {site}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onUnblock(site)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Unlock className="w-4 h-4" />
          <span>Unblock</span>
        </motion.button>
      </div>
    </motion.div>
  );
}