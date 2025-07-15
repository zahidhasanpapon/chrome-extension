// Productivity Hub Background Script
// Handles messaging, storage management, and extension lifecycle

class BackgroundManager {
  constructor() {
    this.DEFAULT_PROFILES = {
      Work: {
        blockedSites: ["youtube.com", "reddit.com", "twitter.com"],
        dailyLimitMinutes: 30,
        slackNotification: true,
      },
      Study: {
        blockedSites: ["facebook.com", "netflix.com", "instagram.com"],
        dailyLimitMinutes: 45,
        motivationalQuotes: true,
      },
      Entertainment: {
        blockedSites: [],
        dailyLimitMinutes: 999,
      },
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeStorage();
  }

  setupEventListeners() {
    // Extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Extension startup
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Message handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });
  }

  async handleInstallation(details) {
    try {
      console.log('Extension installed/updated:', details.reason);
      
      if (details.reason === 'install') {
        await this.initializeStorage();
        // Show welcome notification
        this.showNotification('Welcome to Productivity Hub!', 'Your new tab page is now ready to help you stay focused.');
      } else if (details.reason === 'update') {
        await this.migrateData(details.previousVersion);
      }
    } catch (error) {
      console.error('Error handling installation:', error);
    }
  }

  async handleStartup() {
    try {
      console.log('Extension started');
      await this.ensureActiveProfile();
      await this.cleanupOldData();
    } catch (error) {
      console.error('Error handling startup:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type || message.action) {
        case "GET_ACTIVE_PROFILE":
          await this.handleGetActiveProfile(sendResponse);
          break;

        case "openNewTab":
          await this.handleOpenNewTab();
          sendResponse({ success: true });
          break;

        case "getBlockedSites":
          await this.handleGetBlockedSites(sendResponse);
          break;

        case "updateBlockedSites":
          await this.handleUpdateBlockedSites(message.blockedSites);
          sendResponse({ success: true });
          break;

        case "getStats":
          await this.handleGetStats(sendResponse);
          break;

        default:
          console.warn('Unknown message type:', message);
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleStorageChange(changes, namespace) {
    if (namespace === 'local') {
      // Log storage changes for debugging
      console.log('Storage changed:', Object.keys(changes));
      
      // Handle specific storage changes
      if (changes.blockedSites) {
        await this.notifyContentScripts('updateBlockedSites', {
          blockedSites: changes.blockedSites.newValue || []
        });
      }
    }
  }

  async initializeStorage() {
    try {
      const result = await this.getFromStorage(['profiles', 'todos', 'blockedSites', 'settings']);
      
      // Initialize profiles if not present
      if (!result.profiles) {
        await this.setToStorage({
          profiles: this.DEFAULT_PROFILES,
          activeProfile: null,
        });
      }

      // Initialize other data structures
      if (!result.todos) {
        await this.setToStorage({ todos: [] });
      }

      if (!result.blockedSites) {
        await this.setToStorage({ blockedSites: [] });
      }

      if (!result.settings) {
        await this.setToStorage({
          settings: {
            theme: 'light',
            notifications: true,
            autoBackup: false,
            version: chrome.runtime.getManifest().version
          }
        });
      }

      console.log('Storage initialized successfully');
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async migrateData(previousVersion) {
    try {
      console.log(`Migrating data from version ${previousVersion}`);
      
      // Add migration logic here for future versions
      const currentVersion = chrome.runtime.getManifest().version;
      
      // Update settings with new version
      const settings = await this.getFromStorage(['settings']);
      await this.setToStorage({
        settings: {
          ...settings.settings,
          version: currentVersion,
          lastUpdated: new Date().toISOString()
        }
      });

      console.log(`Migration completed to version ${currentVersion}`);
    } catch (error) {
      console.error('Error migrating data:', error);
    }
  }

  async handleGetActiveProfile(sendResponse) {
    try {
      const data = await this.getFromStorage(['activeProfile', 'profiles']);
      sendResponse({
        activeProfile: data.activeProfile,
        profileData: data.profiles && data.activeProfile ? data.profiles[data.activeProfile] : null,
      });
    } catch (error) {
      console.error('Error getting active profile:', error);
      sendResponse({ error: 'Failed to get active profile' });
    }
  }

  async handleOpenNewTab() {
    try {
      await chrome.tabs.create({ url: 'chrome://newtab/' });
    } catch (error) {
      console.error('Error opening new tab:', error);
    }
  }

  async handleGetBlockedSites(sendResponse) {
    try {
      const data = await this.getFromStorage(['blockedSites']);
      sendResponse({ blockedSites: data.blockedSites || [] });
    } catch (error) {
      console.error('Error getting blocked sites:', error);
      sendResponse({ error: 'Failed to get blocked sites' });
    }
  }

  async handleUpdateBlockedSites(blockedSites) {
    try {
      await this.setToStorage({ blockedSites: blockedSites || [] });
      await this.notifyContentScripts('updateBlockedSites', { blockedSites });
    } catch (error) {
      console.error('Error updating blocked sites:', error);
    }
  }

  async handleGetStats(sendResponse) {
    try {
      const data = await this.getFromStorage(['todos', 'blockedSites']);
      const todos = data.todos || [];
      const blockedSites = data.blockedSites || [];
      
      const stats = {
        totalTodos: todos.length,
        completedTodos: todos.filter(t => t.completed).length,
        blockedSitesCount: blockedSites.length,
        todayCompleted: todos.filter(t => 
          t.completed && 
          t.completedAt && 
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        ).length
      };

      sendResponse({ stats });
    } catch (error) {
      console.error('Error getting stats:', error);
      sendResponse({ error: 'Failed to get stats' });
    }
  }

  async notifyContentScripts(action, data) {
    try {
      const tabs = await chrome.tabs.query({});
      const promises = tabs.map(async (tab) => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          try {
            await chrome.tabs.sendMessage(tab.id, { action, ...data });
          } catch (error) {
            // Ignore errors for tabs without content scripts
          }
        }
      });
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error notifying content scripts:', error);
    }
  }

  async ensureActiveProfile() {
    try {
      const data = await this.getFromStorage(['activeProfile', 'profiles']);
      if (!data.activeProfile && data.profiles) {
        // Set first profile as active if none is set
        const profileNames = Object.keys(data.profiles);
        if (profileNames.length > 0) {
          await this.setToStorage({ activeProfile: profileNames[0] });
          console.log(`Set default active profile: ${profileNames[0]}`);
        }
      }
    } catch (error) {
      console.error('Error ensuring active profile:', error);
    }
  }

  async cleanupOldData() {
    try {
      // Clean up old completed todos (older than 30 days)
      const data = await this.getFromStorage(['todos']);
      if (data.todos) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const cleanedTodos = data.todos.filter(todo => {
          if (todo.completed && todo.completedAt) {
            return new Date(todo.completedAt).getTime() > thirtyDaysAgo;
          }
          return true; // Keep non-completed todos
        });

        if (cleanedTodos.length !== data.todos.length) {
          await this.setToStorage({ todos: cleanedTodos });
          console.log(`Cleaned up ${data.todos.length - cleanedTodos.length} old completed todos`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  showNotification(title, message) {
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon.png',
        title: title,
        message: message
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Utility functions
  async getFromStorage(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  async setToStorage(items) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
}

// Initialize the background manager
const backgroundManager = new BackgroundManager();

console.log('Productivity Hub background script loaded');
