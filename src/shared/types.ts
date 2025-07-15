// Chrome extension types
export const STORAGE_KEYS = {
    TODOS: 'todos',
    BLOCKED_SITES: 'blockedSites',
    SETTINGS: 'settings',
    PROFILES: 'profiles',
    ACTIVE_PROFILE: 'activeProfile'
} as const;

export const MESSAGE_TYPES = {
    UPDATE_BLOCKED_SITES: 'UPDATE_BLOCKED_SITES',
    OPEN_NEW_TAB: 'OPEN_NEW_TAB',
    GET_TODOS: 'GET_TODOS',
    UPDATE_TODOS: 'UPDATE_TODOS',
    GET_ACTIVE_PROFILE: 'GET_ACTIVE_PROFILE',
    GET_BLOCKED_SITES: 'getBlockedSites'
} as const;

export const TODO_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
} as const;

export type TodoPriority = typeof TODO_PRIORITY[keyof typeof TODO_PRIORITY];

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
    completedAt?: number;
    priority: TodoPriority;
    category?: string;
    dueDate?: number;
}

export interface BlockedSite {
    url: string;
    addedAt: number;
}

export interface AppState {
    todos: Todo[];
    blockedSites: BlockedSite[];
    settings: {
        theme: 'light' | 'dark';
        notifications: boolean;
        autoBackup: boolean;
    };
    profiles?: {
        [profileName: string]: {
            blockedSites: string[];
            dailyLimitMinutes: number;
            slackNotification?: boolean;
            motivationalQuotes?: boolean;
        };
    };
    activeProfile?: string;
}

export interface ChromeMessage {
    action: string;
    data?: any;
    blockedSites?: string[];
}
