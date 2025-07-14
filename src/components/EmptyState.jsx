import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
        className="inline-flex p-6 rounded-full bg-gradient-to-r from-focus-100 to-motivate-100 mb-6"
      >
        <Icon className="w-12 h-12 text-focus-600" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 max-w-md mx-auto">
        {description}
      </p>
    </motion.div>
  );
}