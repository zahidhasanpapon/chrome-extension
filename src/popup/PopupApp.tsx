import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Target, Settings, Plus } from 'lucide-react';
import { Todo, BlockedSite } from '@/shared/types';
import { StorageManager } from '@/shared/utils';

const PopupApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [todosData, blockedData] = await Promise.all([
          StorageManager.getTodos(),
          StorageManager.getBlockedSites()
        ]);
        
        setTodos(todosData);
        setBlockedSites(blockedData.map(site => ({ url: site, addedAt: Date.now() })));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addQuickTodo = async () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: Date.now(),
        priority: 'medium'
      };
      
      const updatedTodos = [...todos, todo];
      setTodos(updatedTodos);
      await StorageManager.saveTodos(updatedTodos);
      setNewTodo('');
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
  };

  const openNewTab = () => {
    chrome.tabs.create({ url: 'newtab.html' });
  };

  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedToday = todos.filter(todo => 
    todo.completed && 
    todo.completedAt &&
    new Date(todo.completedAt).toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <div className="w-96 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h1 className="text-lg font-semibold">Productivity Hub</h1>
          </div>
          <button
            onClick={openNewTab}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-500">{completedToday.length}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-500">{pendingTodos.length}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-500">{blockedSites.length}</div>
            <div className="text-xs text-gray-500">Blocked</div>
          </div>
        </div>
      </div>

      {/* Quick Add Todo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addQuickTodo()}
            placeholder="Quick add todo..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addQuickTodo}
            disabled={!newTodo.trim()}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Todos */}
      <div className="p-4 max-h-64 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Recent Todos</h3>
        {pendingTodos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending todos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTodos.slice(0, 5).map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 flex items-center justify-center"
                >
                  {todo.completed && <CheckCircle className="w-3 h-3 text-green-500" />}
                </button>
                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.text}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                  todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {todo.priority}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={openNewTab}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Open Full App
        </button>
      </div>
    </div>
  );
};

export default PopupApp;
