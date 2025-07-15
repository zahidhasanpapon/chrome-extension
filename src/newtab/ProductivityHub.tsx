import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Target, Globe, Sun, Moon, BarChart3, Star, Activity, Zap } from 'lucide-react';
import { type Todo, type BlockedSite } from '@/shared/types';
import { StorageManager } from '@/shared/utils';
import useLocalStorage from '@/hooks/useLocalStorage';
import TodosTab from '@/components/TodosTab';
import BlockedSitesTab from '@/components/BlockedSitesTab';
import StatsCard from '@/components/StatsCard';
import TabButton from '@/components/TabButton';

const ProductivityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'todos' | 'blocked' | 'stats'>('todos');
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [blockedSites, setBlockedSites] = useLocalStorage<BlockedSite[]>('blockedSites', []);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTodos: 0,
    completedTodos: 0,
    pendingTodos: 0,
    blockedSitesCount: 0,
    completionRate: 0,
    streakDays: 0,
    todayCompleted: 0,
    productivity: 0
  });

  // Load data from Chrome storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [todosData, blockedData] = await Promise.all([
          StorageManager.getTodos(),
          StorageManager.getBlockedSites()
        ]);
        
        setTodos(todosData);
        setBlockedSites(blockedData.map(site => ({ url: site, addedAt: Date.now() })));
        setIsLoading(false);
        
        // Calculate stats
        calculateStats(todosData, blockedData);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const calculateStats = (todosData: Todo[], blockedData: string[]) => {
    const completedTodos = todosData.filter(todo => todo.completed).length;
    const todayCompleted = todosData.filter(todo => 
      todo.completed && 
      todo.completedAt &&
      new Date(todo.completedAt).toDateString() === new Date().toDateString()
    ).length;
    
    const completionRate = todosData.length > 0 ? (completedTodos / todosData.length) * 100 : 0;
    const productivity = Math.round((completionRate + (blockedData.length * 5)) / 2);
    
    setStats({
      totalTodos: todosData.length,
      completedTodos,
      pendingTodos: todosData.length - completedTodos,
      blockedSitesCount: blockedData.length,
      completionRate: Math.round(completionRate),
      streakDays: 3, // Mock data - could be calculated from completion history
      todayCompleted,
      productivity: Math.min(productivity, 100)
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} flex items-center justify-center`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'
    }`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.header 
          variants={itemVariants}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Productivity Hub
                </h1>
                <p className="text-sm opacity-70">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-100 shadow-sm'
                }`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            title="Completed Today"
            value={stats.todayCompleted}
            subtitle="tasks"
            color="green"
          />
          <StatsCard
            icon={<Clock className="w-6 h-6 text-blue-500" />}
            title="Pending"
            value={stats.pendingTodos}
            subtitle="tasks"
            color="blue"
          />
          <StatsCard
            icon={<Globe className="w-6 h-6 text-red-500" />}
            title="Blocked Sites"
            value={stats.blockedSitesCount}
            subtitle="sites"
            color="red"
          />
          <StatsCard
            icon={<Activity className="w-6 h-6 text-purple-500" />}
            title="Productivity"
            value={stats.productivity}
            subtitle="%"
            color="purple"
          />
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <div className={`flex space-x-1 p-1 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
          }`}>
            <TabButton
              active={activeTab === 'todos'}
              onClick={() => setActiveTab('todos')}
              icon={<CheckCircle className="w-4 h-4" />}
              text="Todos"
              count={stats.pendingTodos}
            />
            <TabButton
              active={activeTab === 'blocked'}
              onClick={() => setActiveTab('blocked')}
              icon={<Globe className="w-4 h-4" />}
              text="Blocked Sites"
              count={stats.blockedSitesCount}
            />
            <TabButton
              active={activeTab === 'stats'}
              onClick={() => setActiveTab('stats')}
              icon={<BarChart3 className="w-4 h-4" />}
              text="Statistics"
            />
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          variants={itemVariants}
          className="max-w-4xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'todos' && (
              <motion.div
                key="todos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TodosTab 
                  todos={todos}
                  setTodos={setTodos}
                  theme={theme}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterPriority={filterPriority}
                  setFilterPriority={setFilterPriority}
                  onStatsUpdate={(newTodos: Todo[]) => calculateStats(newTodos, blockedSites.map((s: BlockedSite) => s.url))}
                />
              </motion.div>
            )}

            {activeTab === 'blocked' && (
              <motion.div
                key="blocked"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BlockedSitesTab 
                  blockedSites={blockedSites}
                  setBlockedSites={setBlockedSites}
                  theme={theme}
                  onStatsUpdate={(newSites: BlockedSite[]) => calculateStats(todos, newSites.map((s: BlockedSite) => s.url))}
                />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                      Overview
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Total Tasks</span>
                        <span className="font-bold">{stats.totalTodos}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Completion Rate</span>
                        <span className="font-bold text-green-500">{stats.completionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Blocked Sites</span>
                        <span className="font-bold text-red-500">{stats.blockedSitesCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Productivity Score</span>
                        <span className="font-bold text-purple-500">{stats.productivity}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      Achievements
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Streak: {stats.streakDays} days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Today's Goal: {stats.todayCompleted}/5</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Weekly Progress: 78%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProductivityHub;
