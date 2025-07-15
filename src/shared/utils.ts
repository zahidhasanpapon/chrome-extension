import { STORAGE_KEYS, Todo, AppState } from './types';

export class StorageManager {
    static async get<T>(key: string): Promise<T | null> {
        try {
            const result = await chrome.storage.local.get([key]);
            return result[key] || null;
        } catch (error) {
            console.error(`Error getting ${key} from storage:`, error);
            return null;
        }
    }

    static async set<T>(key: string, value: T): Promise<void> {
        try {
            await chrome.storage.local.set({ [key]: value });
        } catch (error) {
            console.error(`Error setting ${key} in storage:`, error);
        }
    }

    static async getTodos(): Promise<Todo[]> {
        const todos = await this.get<Todo[]>(STORAGE_KEYS.TODOS);
        return todos || [];
    }

    static async saveTodos(todos: Todo[]): Promise<void> {
        await this.set(STORAGE_KEYS.TODOS, todos);
    }

    static async getBlockedSites(): Promise<string[]> {
        const blockedSites = await this.get<string[]>(STORAGE_KEYS.BLOCKED_SITES);
        return blockedSites || [];
    }

    static async saveBlockedSites(blockedSites: string[]): Promise<void> {
        await this.set(STORAGE_KEYS.BLOCKED_SITES, blockedSites);
    }

    static async getAppState(): Promise<AppState> {
        const [todos, blockedSites, profiles, activeProfile] = await Promise.all([
            this.getTodos(),
            this.getBlockedSites(),
            this.get(STORAGE_KEYS.PROFILES),
            this.get(STORAGE_KEYS.ACTIVE_PROFILE),
        ]);

        return {
            todos,
            blockedSites: blockedSites.map(url => ({ url, addedAt: Date.now() })),
            profiles: profiles as any || undefined,
            activeProfile: typeof activeProfile === 'string' ? activeProfile : undefined,
            settings: {
                theme: 'light',
                notifications: true,
                autoBackup: false
            }
        };
    }
}

export const cleanUrl = (url: string): string => {
    // Remove protocol (http://, https://)
    url = url.replace(/^https?:\/\//, '');
    // Remove www.
    url = url.replace(/^www\./, '');
    // Remove trailing slash and path
    url = url.split('/')[0];
    // Convert to lowercase
    return url.toLowerCase();
};

export const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

export const isValidUrl = (url: string): boolean => {
    const urlPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return urlPattern.test(cleanUrl(url));
};
