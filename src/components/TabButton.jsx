import { motion } from 'framer-motion';

export default function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`tab-button ${active ? 'tab-button-active' : 'text-gray-600 hover:text-focus-600'}`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5" />
        <span>{children}</span>
      </div>
      
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
        />
      )}
    </motion.button>
  );
}