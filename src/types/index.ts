export interface SubTodo {
    id: string
    text: string
    completed: boolean
    createdAt: string
    completedAt?: string
}

export interface Todo {
    id: string
    text: string
    completed: boolean
    createdAt: string
    completedAt?: string
    priority?: 'low' | 'medium' | 'high'
    category?: string
    dueDate?: string
    recurring?: 'none' | 'daily' | 'weekly' | 'monthly'
    tags?: string[]
    subTodos?: SubTodo[]
    subTodosExpanded?: boolean
}

export interface BlockedSite {
    url: string
    addedAt: string
}

export interface Profile {
    name: string
    blockedSites: string[]
    dailyLimitMinutes: number
    slackNotification?: boolean
    motivationalQuotes?: boolean
}

export interface AppSettings {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    autoBackup: boolean
    version: string
}

export interface ProductivityStats {
    totalTodos: number
    completedTodos: number
    pendingTodos: number
    todayCompleted: number
    blockedSitesCount: number
    completionRate: number
    streakDays: number
    productivity: number
}

// Tabby - Tab Management Types
export interface ChromeTab {
    id: number
    title: string
    url: string
    favIconUrl?: string
    windowId: number
    active: boolean
    pinned: boolean
    selected?: boolean
}

export interface TabGroup {
    id: string
    name: string
    tabs: ChromeTab[]
    createdAt: string
    color?: string
    description?: string
}

export interface BookmarkGroup {
    id: string
    name: string
    bookmarks: BookmarkItem[]
    createdAt: string
    color?: string
}

export interface BookmarkItem {
    id: string
    title: string
    url: string
    favIconUrl?: string
}