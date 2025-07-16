// Productivity Hub Background Script
// Handles messaging, storage management, and extension lifecycle

class BackgroundManager {
    constructor() {
        this.init()
    }

    private init() {
        this.setupEventListeners()
        this.initializeStorage()
    }

    private setupEventListeners() {
        // Extension installation/update
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details)
        })

        // Extension startup
        chrome.runtime.onStartup.addListener(() => {
            this.handleStartup()
        })

        // Message handling
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse)
            return true // Keep message channel open for async responses
        })

        // Storage changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            this.handleStorageChange(changes, namespace)
        })
    }

    private async handleInstallation(details: chrome.runtime.InstalledDetails) {
        try {
            console.log('Extension installed/updated:', details.reason)

            if (details.reason === 'install') {
                await this.initializeStorage()
                // Show welcome notification
                this.showNotification('Welcome to Productivity Hub!', 'Your new tab page is now ready to help you stay focused.')
            } else if (details.reason === 'update') {
                await this.migrateData(details.previousVersion)
            }
        } catch (error) {
            console.error('Error handling installation:', error)
        }
    }

    private async handleStartup() {
        try {
            console.log('Extension started')
            await this.cleanupOldData()
        } catch (error) {
            console.error('Error handling startup:', error)
        }
    }

    private async handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
        try {
            switch (message.action) {
                case "openNewTab":
                    await this.handleOpenNewTab()
                    sendResponse({ success: true })
                    break

                case "getBlockedSites":
                    await this.handleGetBlockedSites(sendResponse)
                    break

                case "updateBlockedSites":
                    await this.handleUpdateBlockedSites(message.blockedSites)
                    sendResponse({ success: true })
                    break

                case "getStats":
                    await this.handleGetStats(sendResponse)
                    break

                default:
                    console.warn('Unknown message action:', message.action)
                    sendResponse({ error: 'Unknown message action' })
            }
        } catch (error) {
            console.error('Error handling message:', error)
            sendResponse({ error: error.message })
        }
    }

    private async handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) {
        if (namespace === 'local') {
            // Handle specific storage changes
            if (changes.blockedSites) {
                await this.notifyContentScripts('updateBlockedSites', {
                    blockedSites: changes.blockedSites.newValue || []
                })
            }
        }
    }

    private async initializeStorage() {
        try {
            const result = await this.getFromStorage(['todos', 'blockedSites', 'settings'])

            // Initialize data structures
            if (!result.todos) {
                await this.setToStorage({ todos: [] })
            }

            if (!result.blockedSites) {
                await this.setToStorage({ blockedSites: [] })
            }

            if (!result.settings) {
                await this.setToStorage({
                    settings: {
                        theme: 'light',
                        notifications: true,
                        autoBackup: false,
                        version: chrome.runtime.getManifest().version
                    }
                })
            }

            console.log('Storage initialized successfully')
        } catch (error) {
            console.error('Error initializing storage:', error)
        }
    }

    private async migrateData(previousVersion?: string) {
        try {
            console.log(`Migrating data from version ${previousVersion}`)

            const currentVersion = chrome.runtime.getManifest().version

            // Update settings with new version
            const settings = await this.getFromStorage(['settings'])
            await this.setToStorage({
                settings: {
                    ...settings.settings,
                    version: currentVersion,
                    lastUpdated: new Date().toISOString()
                }
            })

            console.log(`Migration completed to version ${currentVersion}`)
        } catch (error) {
            console.error('Error migrating data:', error)
        }
    }

    private async handleOpenNewTab() {
        try {
            await chrome.tabs.create({ url: 'chrome://newtab/' })
        } catch (error) {
            console.error('Error opening new tab:', error)
        }
    }

    private async handleGetBlockedSites(sendResponse: (response: any) => void) {
        try {
            const data = await this.getFromStorage(['blockedSites'])
            sendResponse({ blockedSites: data.blockedSites || [] })
        } catch (error) {
            console.error('Error getting blocked sites:', error)
            sendResponse({ error: 'Failed to get blocked sites' })
        }
    }

    private async handleUpdateBlockedSites(blockedSites: string[]) {
        try {
            await this.setToStorage({ blockedSites: blockedSites || [] })
            await this.notifyContentScripts('updateBlockedSites', { blockedSites })
        } catch (error) {
            console.error('Error updating blocked sites:', error)
        }
    }

    private async handleGetStats(sendResponse: (response: any) => void) {
        try {
            const data = await this.getFromStorage(['todos', 'blockedSites'])
            const todos = data.todos || []
            const blockedSites = data.blockedSites || []

            const stats = {
                totalTodos: todos.length,
                completedTodos: todos.filter((t: any) => t.completed).length,
                blockedSitesCount: blockedSites.length,
                todayCompleted: todos.filter((t: any) =>
                    t.completed &&
                    t.completedAt &&
                    new Date(t.completedAt).toDateString() === new Date().toDateString()
                ).length
            }

            sendResponse({ stats })
        } catch (error) {
            console.error('Error getting stats:', error)
            sendResponse({ error: 'Failed to get stats' })
        }
    }

    private async notifyContentScripts(action: string, data: any) {
        try {
            const tabs = await chrome.tabs.query({})
            const promises = tabs.map(async (tab) => {
                if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                    try {
                        await chrome.tabs.sendMessage(tab.id!, { action, ...data })
                    } catch (error) {
                        // Ignore errors for tabs without content scripts
                    }
                }
            })

            await Promise.allSettled(promises)
        } catch (error) {
            console.error('Error notifying content scripts:', error)
        }
    }

    private async cleanupOldData() {
        try {
            // Clean up old completed todos (older than 30 days)
            const data = await this.getFromStorage(['todos'])
            if (data.todos) {
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
                const cleanedTodos = data.todos.filter((todo: any) => {
                    if (todo.completed && todo.completedAt) {
                        return new Date(todo.completedAt).getTime() > thirtyDaysAgo
                    }
                    return true // Keep non-completed todos
                })

                if (cleanedTodos.length !== data.todos.length) {
                    await this.setToStorage({ todos: cleanedTodos })
                    console.log(`Cleaned up ${data.todos.length - cleanedTodos.length} old completed todos`)
                }
            }
        } catch (error) {
            console.error('Error cleaning up old data:', error)
        }
    }

    private showNotification(title: string, message: string) {
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: title,
                message: message
            })
        } catch (error) {
            console.error('Error showing notification:', error)
        }
    }

    // Utility functions
    private async getFromStorage(keys: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message))
                } else {
                    resolve(result)
                }
            })
        })
    }

    private async setToStorage(items: any): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(items, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message))
                } else {
                    resolve()
                }
            })
        })
    }
}

// Initialize the background manager
new BackgroundManager()

console.log('Productivity Hub background script loaded')