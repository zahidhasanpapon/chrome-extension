import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Clock, Target } from 'lucide-react';
import TodoItem from './TodoItem';
import StatsCard from './StatsCard';
import EmptyState from './EmptyState';

export default function TodosTab({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTodo(inputValue.trim());
      setInputValue('');
    }
  };

  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Add Todo Form */}
      <motion.form
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task... (e.g., Review project proposal)"
            className="input-field flex-1"
            maxLength={200}
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </motion.button>
        </div>
      </motion.form>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          icon={Target}
          color="focus"
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle}
          color="motivate"
        />
        <StatsCard
          title="Pending"
          value={pendingTasks}
          icon={Clock}
          color="accent"
        />
      </div>

      {/* Todo List */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-focus-600" />
          Your Tasks
        </h3>
        
        <AnimatePresence mode="popLayout">
          {todos.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No tasks yet!"
              description="Add your first task above to get started on your productivity journey."
            />
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}