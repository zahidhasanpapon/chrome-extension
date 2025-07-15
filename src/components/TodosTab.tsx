import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, CheckCircle, Star } from 'lucide-react';
import { Todo, TodoPriority, TODO_PRIORITY } from '@/shared/types';
import { StorageManager } from '@/shared/utils';
import TodoItem from './TodoItem';
import EmptyState from './EmptyState';

interface TodosTabProps {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  theme: 'light' | 'dark';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  onStatsUpdate: (todos: Todo[]) => void;
}

const TodosTab: React.FC<TodosTabProps> = ({
  todos,
  setTodos,
  theme,
  searchTerm,
  setSearchTerm,
  filterPriority,
  setFilterPriority,
  onStatsUpdate
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>(TODO_PRIORITY.MEDIUM);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const addTodo = async () => {
    if (newTodo.trim()) {
      setIsAdding(true);
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: Date.now(),
        priority: newTodoPriority
      };
      
      const updatedTodos = [...todos, todo];
      setTodos(updatedTodos);
      await StorageManager.saveTodos(updatedTodos);
      onStatsUpdate(updatedTodos);
      
      setNewTodo('');
      setNewTodoPriority(TODO_PRIORITY.MEDIUM);
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? Date.now() : undefined
          }
        : todo
    );
    setTodos(updatedTodos);
    await StorageManager.saveTodos(updatedTodos);
    onStatsUpdate(updatedTodos);
  };

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await StorageManager.saveTodos(updatedTodos);
    onStatsUpdate(updatedTodos);
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    );
    setTodos(updatedTodos);
    await StorageManager.saveTodos(updatedTodos);
    onStatsUpdate(updatedTodos);
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    const matchesCompleted = showCompleted ? true : !todo.completed;
    return matchesSearch && matchesPriority && matchesCompleted;
  });

  return (
    <div className="space-y-6">
      {/* Add Todo Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
        }`}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            />
            <select
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value as TodoPriority)}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              <option value={TODO_PRIORITY.LOW}>Low Priority</option>
              <option value={TODO_PRIORITY.MEDIUM}>Medium Priority</option>
              <option value={TODO_PRIORITY.HIGH}>High Priority</option>
            </select>
            <button
              onClick={addTodo}
              disabled={!newTodo.trim() || isAdding}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                !newTodo.trim() || isAdding
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>{isAdding ? 'Adding...' : 'Add'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search todos..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            <option value="all">All Priorities</option>
            <option value={TODO_PRIORITY.HIGH}>High Priority</option>
            <option value={TODO_PRIORITY.MEDIUM}>Medium Priority</option>
            <option value={TODO_PRIORITY.LOW}>Low Priority</option>
          </select>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              showCompleted
                ? 'bg-green-500 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>
      </motion.div>

      {/* Todos List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredTodos.length === 0 ? (
            <EmptyState
              title={searchTerm ? 'No matching todos' : 'No todos yet'}
              description={searchTerm ? 'Try adjusting your search or filters' : 'Add your first todo to get started'}
              icon={searchTerm ? <Search className="w-12 h-12" /> : <CheckCircle className="w-12 h-12" />}
              theme={theme}
            />
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
                theme={theme}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Summary */}
      {todos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Total: {todos.length}
              </span>
              <span className="text-green-500">
                Completed: {todos.filter(t => t.completed).length}
              </span>
              <span className="text-blue-500">
                Pending: {todos.filter(t => !t.completed).length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {todos.filter(t => t.completed).length > 0 
                  ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100)
                  : 0}% Complete
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TodosTab;
