import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, Target, Globe, Sun, Moon, BarChart3, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StorageManager } from '@/lib/utils'
import { Todo, BlockedSite, ProductivityStats } from '@/types'
import TodoList from '@/components/TodoList'
import BlockedSitesList from '@/components/BlockedSitesList'
import StatsCards from '@/components/StatsCards'
import TimeWeatherWidget from '@/components/TimeWeatherWidget'
import QuickShortcuts from '@/components/QuickShortcuts'
import TabbyManager from '@/components/TabbyManager'

const ProductivityHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'todos' | 'blocked' | 'stats' | 'tabby'>('todos')
    const [todos, setTodos] = useState<Todo[]>([])
    const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([])
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<ProductivityStats>({
        totalTodos: 0,
        completedTodos: 0,
        pendingTodos: 0,
        todayCompleted: 0,
        blockedSitesCount: 0,
        completionRate: 0,
        streakDays: 0,
        productivity: 0
    })

    // Load data from Chrome storage
    useEffect(() => {
        const loadData = async () => {
            try {
                const [todosData, blockedData] = await Promise.all([
                    StorageManager.getTodos(),
                    StorageManager.getBlockedSites()
                ])

                setTodos(todosData)
                setBlockedSites(blockedData.map(url => ({ url, addedAt: new Date().toISOString() })))
                calculateStats(todosData, blockedData)
                setIsLoading(false)
            } catch (error) {
                console.error('Error loading data:', error)
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle shortcuts when not typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return
            }

            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 't':
                        e.preventDefault()
                        setActiveTab('todos')
                        break
                    case 'b':
                        e.preventDefault()
                        setActiveTab('blocked')
                        break
                    case 's':
                        e.preventDefault()
                        setActiveTab('stats')
                        break
                    case 'm':
                        e.preventDefault()
                        setActiveTab('tabby')
                        break
                    case 'd':
                        e.preventDefault()
                        toggleTheme()
                        break
                    case 'k':
                        e.preventDefault()
                        // Focus on search input if available
                        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
                        if (searchInput) {
                            searchInput.focus()
                        }
                        break
                }
            }

            // ESC key to clear search
            if (e.key === 'Escape') {
                setSearchTerm('')
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const calculateStats = (todosData: Todo[], blockedData: string[]) => {
        const completedTodos = todosData.filter(todo => todo.completed).length
        const todayCompleted = todosData.filter(todo =>
            todo.completed &&
            todo.completedAt &&
            new Date(todo.completedAt).toDateString() === new Date().toDateString()
        ).length

        const completionRate = todosData.length > 0 ? (completedTodos / todosData.length) * 100 : 0
        const productivity = Math.round((completionRate + (blockedData.length * 5)) / 2)

        setStats({
            totalTodos: todosData.length,
            completedTodos,
            pendingTodos: todosData.length - completedTodos,
            blockedSitesCount: blockedData.length,
            completionRate: Math.round(completionRate),
            streakDays: 3, // Mock data - could be calculated from completion history
            todayCompleted,
            productivity: Math.min(productivity, 100)
        })
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.classList.toggle('dark')
    }

    const addTodo = async (text: string) => {
        const newTodo: Todo = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'medium',
            subTodos: [],
            subTodosExpanded: false
        }

        const updatedTodos = [newTodo, ...todos]
        setTodos(updatedTodos)
        await StorageManager.saveTodos(updatedTodos)
        calculateStats(updatedTodos, blockedSites.map(s => s.url))
    }

    const updateTodo = async (id: string, updates: Partial<Todo>) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, ...updates } : todo
        )
        setTodos(updatedTodos)
        await StorageManager.saveTodos(updatedTodos)
        calculateStats(updatedTodos, blockedSites.map(s => s.url))
    }

    const addSubTodo = async (todoId: string, text: string) => {
        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId) {
                const newSubTodo = {
                    id: Date.now().toString(),
                    text,
                    completed: false,
                    createdAt: new Date().toISOString()
                }
                return {
                    ...todo,
                    subTodos: [...(todo.subTodos || []), newSubTodo],
                    subTodosExpanded: true
                }
            }
            return todo
        })
        setTodos(updatedTodos)
        await StorageManager.saveTodos(updatedTodos)
        calculateStats(updatedTodos, blockedSites.map(s => s.url))
    }

    const toggleSubTodo = async (todoId: string, subTodoId: string) => {
        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId && todo.subTodos) {
                const updatedSubTodos = todo.subTodos.map(subTodo =>
                    subTodo.id === subTodoId
                        ? {
                            ...subTodo,
                            completed: !subTodo.completed,
                            completedAt: !subTodo.completed ? new Date().toISOString() : undefined
                        }
                        : subTodo
                )
                return { ...todo, subTodos: updatedSubTodos }
            }
            return todo
        })
        setTodos(updatedTodos)
        await StorageManager.saveTodos(updatedTodos)
        calculateStats(updatedTodos, blockedSites.map(s => s.url))
    }

    const deleteSubTodo = async (todoId: string, subTodoId: string) => {
        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId && todo.subTodos) {
                const updatedSubTodos = todo.subTodos.filter(subTodo => subTodo.id !== subTodoId)
                return { ...todo, subTodos: updatedSubTodos }
            }
            return todo
        })
        setTodos(updatedTodos)
        await StorageManager.saveTodos(updatedTodos)
        calculateStats(updatedTodos, blockedSites.map(s => s.url))
    }

    const toggleTodo = async (id: string) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id
                ? {
                    ...todo,
                    completed: !todo.completed,
                    completedAt: !todo.completed ? new Date().toISOString() : undefined
                }
                : todo
        )
        setTodos(updatedTodos)
        await StorageManager.saveTodos(updatedTodos)
        calculateStats(updatedTodos, blockedSites.map(s => s.url))
    }

    const deleteTodo = async (id: string) => {
        const updatedTodos = todos.filter(todo => todo.id !== id)
        setTodos(updatedTodos)
        await StorageManager.saveTodos(updatedTodos)
        calculateStats(updatedTodos, blockedSites.map(s => s.url))
    }

    const addBlockedSite = async (url: string) => {
        const newSite: BlockedSite = {
            url,
            addedAt: new Date().toISOString()
        }

        const updatedSites = [...blockedSites, newSite]
        setBlockedSites(updatedSites)
        await StorageManager.saveBlockedSites(updatedSites.map(s => s.url))
        calculateStats(todos, updatedSites.map(s => s.url))
    }

    const removeBlockedSite = async (url: string) => {
        const updatedSites = blockedSites.filter(site => site.url !== url)
        setBlockedSites(updatedSites)
        await StorageManager.saveBlockedSites(updatedSites.map(s => s.url))
        calculateStats(todos, updatedSites.map(s => s.url))
    }

    if (isLoading) {
        return (
            <div className="min-h-screen productivity-gradient flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
            ? 'dark bg-gray-900 text-white'
            : 'productivity-gradient text-gray-900'
            }`}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="mb-8 text-center">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    Productivity Hub
                                </h1>
                                <p className="text-white/80 text-lg">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-white hover:bg-white/20"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </header>

                {/* Time & Weather Widget */}
                <TimeWeatherWidget theme={theme} />

                {/* Stats Cards */}
                <StatsCards stats={stats} />

                {/* Quick Shortcuts */}
                <QuickShortcuts
                    blockedSites={blockedSites}
                    onBlockSite={addBlockedSite}
                    onUnblockSite={removeBlockedSite}
                    theme={theme}
                />

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <Card className="p-1 bg-white/10 backdrop-blur-sm border-white/20">
                        <div className="flex space-x-1">
                            <Button
                                variant={activeTab === 'todos' ? 'default' : 'ghost'}
                                onClick={() => setActiveTab('todos')}
                                className={`${activeTab === 'todos' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Todos
                                {stats.pendingTodos > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {stats.pendingTodos}
                                    </Badge>
                                )}
                            </Button>
                            <Button
                                variant={activeTab === 'blocked' ? 'default' : 'ghost'}
                                onClick={() => setActiveTab('blocked')}
                                className={`${activeTab === 'blocked' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                Blocked Sites
                                {stats.blockedSitesCount > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        {stats.blockedSitesCount}
                                    </Badge>
                                )}
                            </Button>
                            <Button
                                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                                onClick={() => setActiveTab('stats')}
                                className={`${activeTab === 'stats' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Statistics
                            </Button>
                            <Button
                                variant={activeTab === 'tabby' ? 'default' : 'ghost'}
                                onClick={() => setActiveTab('tabby')}
                                className={`${activeTab === 'tabby' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
                            >
                                <Target className="w-4 h-4 mr-2" />
                                Tabby
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'todos' && (
                        <TodoList
                            todos={todos}
                            onAddTodo={addTodo}
                            onToggleTodo={toggleTodo}
                            onDeleteTodo={deleteTodo}
                            onUpdateTodo={updateTodo}
                            onAddSubTodo={addSubTodo}
                            onToggleSubTodo={toggleSubTodo}
                            onDeleteSubTodo={deleteSubTodo}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                        />
                    )}

                    {activeTab === 'blocked' && (
                        <BlockedSitesList
                            blockedSites={blockedSites}
                            onAddSite={addBlockedSite}
                            onRemoveSite={removeBlockedSite}
                            theme={theme}
                        />
                    )}

                    {activeTab === 'tabby' && (
                        <TabbyManager theme={theme} />
                    )}

                    {activeTab === 'stats' && (
                        <Card className="glass-card border-white/20">
                            <CardHeader>
                                <CardTitle className="flex items-center text-gray-900">
                                    <BarChart3 className="w-6 h-6 mr-2 text-focus-500" />
                                    Productivity Statistics
                                </CardTitle>
                                <CardDescription>
                                    Track your progress and stay motivated
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total Tasks</span>
                                                <span className="font-bold text-gray-900">{stats.totalTodos}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Completion Rate</span>
                                                <Badge variant="motivate">{stats.completionRate}%</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Blocked Sites</span>
                                                <Badge variant="destructive">{stats.blockedSitesCount}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Productivity Score</span>
                                                <Badge variant="focus">{stats.productivity}%</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Target className="w-4 h-4 text-focus-500" />
                                                <span className="text-sm text-gray-600">Streak: {stats.streakDays} days</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-4 h-4 text-motivate-500" />
                                                <span className="text-sm text-gray-600">Today: {stats.todayCompleted} completed</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm text-gray-600">Weekly Progress: 78%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductivityHub