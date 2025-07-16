import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Chrome extension utilities
export class StorageManager {
    static async get<T>(key: string): Promise<T | null> {
        try {
            const result = await chrome.storage.local.get([key])
            return result[key] || null
        } catch (error) {
            console.error(`Error getting ${key} from storage:`, error)
            return null
        }
    }

    static async set<T>(key: string, value: T): Promise<void> {
        try {
            await chrome.storage.local.set({ [key]: value })
        } catch (error) {
            console.error(`Error setting ${key} in storage:`, error)
        }
    }

    static async getTodos(): Promise<Todo[]> {
        const todos = await this.get<Todo[]>('todos')
        return todos || []
    }

    static async saveTodos(todos: Todo[]): Promise<void> {
        await this.set('todos', todos)
    }

    static async getBlockedSites(): Promise<string[]> {
        const blockedSites = await this.get<string[]>('blockedSites')
        return blockedSites || []
    }

    static async saveBlockedSites(blockedSites: string[]): Promise<void> {
        await this.set('blockedSites', blockedSites)
    }
}

// URL utilities
export const cleanUrl = (url: string): string => {
    return url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .toLowerCase()
}

export const isValidUrl = (url: string): boolean => {
    const urlPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
    return urlPattern.test(cleanUrl(url)) && url.includes('.')
}

// Date utilities
export const formatDate = (date: Date | string): string => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export const isToday = (date: Date | string): boolean => {
    const d = new Date(date)
    const today = new Date()
    return d.toDateString() === today.toDateString()
}