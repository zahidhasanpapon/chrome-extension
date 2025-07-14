import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, color = 'focus' }) {
  const colorClasses = {
    focus: 'from-focus-500 to-focus-600 text-focus-600',
    motivate: 'from-motivate-500 to-motivate-600 text-motivate-600',
    accent: 'from-accent-500 to-accent-600 text-accent-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass-card rounded-xl p-6 text-center"
    >
      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${colorClasses[color]} bg-opacity-10 mb-4`}>
        <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[2]}`} />
      </div>
      
      <motion.div
        key={value}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-3xl font-bold text-gray-800 mb-2"
      >
        {value}
      </motion.div>
      
      <div className="text-gray-600 font-medium">
        {title}
      </div>
    </motion.div>
  );
}