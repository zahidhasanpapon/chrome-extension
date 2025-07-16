import React, { useState } from 'react'
import { Plus, Search, Check, Trash2, Clock, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Todo } from '@/types'
import { cn } from '@/lib/utils'

interface TodoListProps {
    todos: Todo[]
    onAddTodo: (text: string) => void
    onToggleTodo: (id: string) => void
    onDeleteTodo: (id: string) => void
    onUpdateTodo: (id: string, updates: Partial<Todo>) => void
    onAddSubTodo: (todoId: string, text: string) => void
    onToggleSubTodo: (todoId: string, subTodoId: string) => void
    onDeleteSubTodo: (todoId: string, subTodoId: string) => void
    searchTerm: string
    onSearchChange: (term: string) => void
}

const TodoList: React.FC<TodoListProps> = ({
    todos,
    onAddTodo,
    onToggleTodo,
    onDeleteTodo,
    onUpdateTodo,
    onAddSubTodo,
    onToggleSubTodo,
    onDeleteSubTodo,
    searchTerm,
    onSearchChange
}) => {
    const [newTodo, setNewTodo] = useState('')
    const [showCompleted, setShowCompleted] = useState(false)
    const [newSubTodo, setNewSubTodo] = useState('')
    const [activeSubTodoInput, setActiveSubTodoInput] = useState<string | null>(null)

    const handleAddTodo = () => {
        if (newTodo.trim()) {
            onAddTodo(newTodo.trim())
            setNewTodo('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTodo()
        }
    }

    const filteredTodos = todos.filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCompleted = showCompleted ? true : !todo.completed
        return matchesSearch && matchesCompleted
    })

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return <AlertCircle className="w-4 h-4 text-red-500" />
            case 'medium':
                return <Clock className="w-4 h-4 text-yellow-500" />
            case 'low':
                return <Check className="w-4 h-4 text-green-500" />
            default:
                return null
        }
    }

    const getPriorityVariant = (priority: string): "high" | "medium" | "low" => {
        return priority as "high" | "medium" | "low"
    }

    return (
        <div className="space-y-6">
            {/* Add Todo Form */}
            <Card className="glass-card border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                        <Plus className="w-5 h-5 mr-2 text-focus-500" />
                        Add New Task
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-3">
                        <Input
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="What needs to be done?"
                            className="flex-1"
                        />
                        <Button
                            onClick={handleAddTodo}
                            disabled={!newTodo.trim()}
                            variant="focus"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Task
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card className="glass-card border-white/20">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search todos..."
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant={showCompleted ? "default" : "outline"}
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            {showCompleted ? 'Hide Completed' : 'Show Completed'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Todos List */}
            <div className="space-y-3">
                {filteredTodos.length === 0 ? (
                    <Card className="glass-card border-white/20">
                        <CardContent className="pt-6">
                            <div className="text-center py-8 text-gray-500">
                                <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">
                                    {searchTerm ? 'No matching todos' : 'No todos yet'}
                                </p>
                                <p className="text-sm">
                                    {searchTerm ? 'Try adjusting your search' : 'Add your first task to get started'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredTodos.map((todo) => (
                        <Card
                            key={todo.id}
                            className={cn(
                                "glass-card border-white/20 transition-all duration-200 hover:shadow-lg",
                                todo.completed && "opacity-60"
                            )}
                        >
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    {/* Main Todo */}
                                    <div className="flex items-center space-x-3">
                                        {/* Expand/Collapse Button for Sub-todos */}
                                        {todo.subTodos && todo.subTodos.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onUpdateTodo(todo.id, { subTodosExpanded: !todo.subTodosExpanded })}
                                                className="w-6 h-6"
                                            >
                                                {todo.subTodosExpanded ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onToggleTodo(todo.id)}
                                            className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                                todo.completed
                                                    ? "bg-motivate-500 border-motivate-500 text-white"
                                                    : "border-gray-300 hover:border-motivate-500"
                                            )}
                                        >
                                            {todo.completed && <Check className="w-3 h-3" />}
                                        </Button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                {todo.priority && getPriorityIcon(todo.priority)}
                                                <span
                                                    className={cn(
                                                        "text-gray-900 font-medium",
                                                        todo.completed && "line-through text-gray-500"
                                                    )}
                                                >
                                                    {todo.text}
                                                </span>
                                                {todo.priority && (
                                                    <Badge variant={getPriorityVariant(todo.priority)} className="text-xs">
                                                        {todo.priority}
                                                    </Badge>
                                                )}
                                                {todo.subTodos && todo.subTodos.length > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {todo.subTodos.filter(st => st.completed).length}/{todo.subTodos.length} subtasks
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Created {new Date(todo.createdAt).toLocaleDateString()}
                                                {todo.completedAt && (
                                                    <span> • Completed {new Date(todo.completedAt).toLocaleDateString()}</span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setActiveSubTodoInput(activeSubTodoInput === todo.id ? null : todo.id)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Sub
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteTodo(todo.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Add Sub-todo Input */}
                                    {activeSubTodoInput === todo.id && (
                                        <div className="ml-12 flex items-center space-x-2">
                                            <Input
                                                value={newSubTodo}
                                                onChange={(e) => setNewSubTodo(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        if (newSubTodo.trim()) {
                                                            onAddSubTodo(todo.id, newSubTodo.trim())
                                                            setNewSubTodo('')
                                                            setActiveSubTodoInput(null)
                                                        }
                                                    } else if (e.key === 'Escape') {
                                                        setActiveSubTodoInput(null)
                                                        setNewSubTodo('')
                                                    }
                                                }}
                                                placeholder="Add sub-task..."
                                                className="flex-1"
                                                autoFocus
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    if (newSubTodo.trim()) {
                                                        onAddSubTodo(todo.id, newSubTodo.trim())
                                                        setNewSubTodo('')
                                                        setActiveSubTodoInput(null)
                                                    }
                                                }}
                                                disabled={!newSubTodo.trim()}
                                            >
                                                Add
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setActiveSubTodoInput(null)
                                                    setNewSubTodo('')
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}

                                    {/* Sub-todos List */}
                                    {todo.subTodos && todo.subTodos.length > 0 && todo.subTodosExpanded && (
                                        <div className="ml-12 space-y-2">
                                            {todo.subTodos.map((subTodo) => (
                                                <div key={subTodo.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onToggleSubTodo(todo.id, subTodo.id)}
                                                        className={cn(
                                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                            subTodo.completed
                                                                ? "bg-motivate-500 border-motivate-500 text-white"
                                                                : "border-gray-300 hover:border-motivate-500"
                                                        )}
                                                    >
                                                        {subTodo.completed && <Check className="w-2 h-2" />}
                                                    </Button>
                                                    <span
                                                        className={cn(
                                                            "flex-1 text-sm",
                                                            subTodo.completed && "line-through text-gray-500"
                                                        )}
                                                    >
                                                        {subTodo.text}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onDeleteSubTodo(todo.id, subTodo.id)}
                                                        className="w-5 h-5 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Stats Summary */}
            {todos.length > 0 && (
                <Card className="glass-card border-white/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-600">
                                    Total: <span className="font-semibold text-gray-900">{todos.length}</span>
                                </span>
                                <span className="text-motivate-600">
                                    Completed: <span className="font-semibold">{todos.filter(t => t.completed).length}</span>
                                </span>
                                <span className="text-focus-600">
                                    Pending: <span className="font-semibold">{todos.filter(t => !t.completed).length}</span>
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="text-right">
                                    <span className="text-gray-600 text-xs">Progress</span>
                                    <div className="font-semibold text-gray-900">
                                        {todos.length > 0
                                            ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100)
                                            : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default TodoList