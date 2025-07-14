import { motion } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';

export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`todo-item ${todo.completed ? 'todo-item-completed' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(todo.id)}
            className={`p-2 rounded-full transition-all duration-200 ${
              todo.completed
                ? 'bg-motivate-100 text-motivate-600 hover:bg-motivate-200'
                : 'bg-focus-100 text-focus-600 hover:bg-focus-200'
            }`}
          >
            {todo.completed ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </motion.button>
          
          <span
            className={`flex-1 text-lg ${
              todo.completed
                ? 'line-through text-gray-500'
                : 'text-gray-800'
            }`}
          >
            {todo.text}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(todo.id)}
          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        {new Date(todo.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </motion.div>
  );
}