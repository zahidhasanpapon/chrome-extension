import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Sparkles } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import TodosTab from './components/TodosTab';
import BlockedSitesTab from './components/BlockedSitesTab';
import TabButton from './components/TabButton';

function App() {
  const [activeTab, setActiveTab] = useState('todos');
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [blockedSites, setBlockedSites] = useLocalStorage('blockedSites', []);

  // Todo functions
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Blocked sites functions
  const cleanUrl = (url) => {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase();
  };

  const blockSite = (url) => {
    const cleanedUrl = cleanUrl(url);
    if (!blockedSites.includes(cleanedUrl)) {
      setBlockedSites(prev => [...prev, cleanedUrl]);
    }
  };

  const unblockSite = (url) => {
    setBlockedSites(prev => prev.filter(site => site !== url));
  };

  const exportBlockedSites = () => {
    const dataStr = JSON.stringify(blockedSites, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'blocked-sites.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importBlockedSites = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSites = JSON.parse(e.target.result);
        if (Array.isArray(importedSites)) {
          const newSites = importedSites.filter(site => !blockedSites.includes(site));
          setBlockedSites(prev => [...prev, ...newSites]);
        }
      } catch (error) {
        console.error('Error importing file:', error);
      }
    };
    reader.readAsText(file);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setActiveTab('todos');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setActiveTab('blocked');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="inline-flex p-4 rounded-full bg-gradient-to-r from-focus-500 to-motivate-500 mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-focus-600 via-motivate-600 to-accent-600 bg-clip-text text-transparent mb-4">
            Productivity Hub
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay productive and organized with your daily tasks and focus management
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-2 mb-8"
        >
          <div className="flex space-x-2 relative">
            <TabButton
              active={activeTab === 'todos'}
              onClick={() => setActiveTab('todos')}
              icon={CheckCircle}
            >
              Todos
            </TabButton>
            <TabButton
              active={activeTab === 'blocked'}
              onClick={() => setActiveTab('blocked')}
              icon={Shield}
            >
              Blocked Sites
            </TabButton>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'todos' && (
            <TodosTab
              todos={todos}
              onAddTodo={addTodo}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
            />
          )}
          
          {activeTab === 'blocked' && (
            <BlockedSitesTab
              blockedSites={blockedSites}
              onBlockSite={blockSite}
              onUnblockSite={unblockSite}
              onExport={exportBlockedSites}
              onImport={importBlockedSites}
            />
          )}
        </motion.div>

        {/* Keyboard Shortcuts Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>
            Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl/Cmd + T</kbd> for Todos, 
            <kbd className="px-2 py-1 bg-gray-200 rounded ml-1">Ctrl/Cmd + B</kbd> for Blocked Sites
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default App;