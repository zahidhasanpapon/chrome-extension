import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit3, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Todo, TodoPriority, TODO_PRIORITY } from '@/shared/types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  theme: 'light' | 'dark';
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdate, theme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority);

  const handleSave = () => {
    if (editText.trim() !== todo.text || editPriority !== todo.priority) {
      onUpdate(todo.id, { text: editText.trim(), priority: editPriority });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case TODO_PRIORITY.HIGH:
        return 'border-red-500 bg-red-50';
      case TODO_PRIORITY.MEDIUM:
        return 'border-yellow-500 bg-yellow-50';
      case TODO_PRIORITY.LOW:
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityColorDark = (priority: TodoPriority) => {
    switch (priority) {
      case TODO_PRIORITY.HIGH:
        return 'border-red-500 bg-red-900/20';
      case TODO_PRIORITY.MEDIUM:
        return 'border-yellow-500 bg-yellow-900/20';
      case TODO_PRIORITY.LOW:
        return 'border-green-500 bg-green-900/20';
      default:
        return 'border-gray-600 bg-gray-800';
    }
  };

  const getPriorityIcon = (priority: TodoPriority) => {
    switch (priority) {
      case TODO_PRIORITY.HIGH:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case TODO_PRIORITY.MEDIUM:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case TODO_PRIORITY.LOW:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const priorityClasses = theme === 'dark' ? getPriorityColorDark(todo.priority) : getPriorityColor(todo.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${priorityClasses} ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
      } hover:shadow-md`}
    >
      <div className="flex items-center space-x-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-green-500 border-green-500 text-white'
              : theme === 'dark'
              ? 'border-gray-600 hover:border-green-500'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {todo.completed && <Check className="w-3 h-3" />}
        </button>

        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                className={`w-full px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
              />
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as TodoPriority)}
                className={`px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value={TODO_PRIORITY.LOW}>Low Priority</option>
                <option value={TODO_PRIORITY.MEDIUM}>Medium Priority</option>
                <option value={TODO_PRIORITY.HIGH}>High Priority</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(todo.priority)}
                <span
                  className={`${
                    todo.completed
                      ? 'line-through text-gray-500'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {todo.text}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(todo.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`p-1 rounded hover:bg-gray-200 ${
                      theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(todo.id)}
                    className={`p-1 rounded hover:bg-red-100 ${
                      theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TodoItem;
