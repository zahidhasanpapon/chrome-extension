import { MESSAGE_TYPES } from '@/shared/types';
import { StorageManager } from '@/shared/utils';

// Default profiles for initial setup
const DEFAULT_PROFILES = {
    Work: {
        blockedSites: ['youtube.com', 'reddit.com'],
        dailyLimitMinutes: 30,
        slackNotification: true,
    },
    Study: {
        blockedSites: ['facebook.com', 'netflix.com'],
        dailyLimitMinutes: 45,
        motivationalQuotes: true,
    },
    Entertainment: {
        blockedSites: [],
        dailyLimitMinutes: 999,
    },
};

// Initialize storage with default profiles if not present
chrome.runtime.onInstalled.addListener(async () => {
    try {
        const profiles = await StorageManager.get('profiles');
        if (!profiles) {
            await StorageManager.set('profiles', DEFAULT_PROFILES);
            await StorageManager.set('activeProfile', null);
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
});

// Message handler
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    switch (message.type || message.action) {
        case MESSAGE_TYPES.GET_ACTIVE_PROFILE:
            handleGetActiveProfile(sendResponse);
            return true; // Keep message channel open for async response

        case MESSAGE_TYPES.OPEN_NEW_TAB:
            handleOpenNewTab();
            break;

        case MESSAGE_TYPES.GET_BLOCKED_SITES:
            handleGetBlockedSites(sendResponse);
            return true; // Keep message channel open for async response

        default:
            console.warn('Unknown message type:', message);
    }
});

async function handleGetActiveProfile(sendResponse: (response: any) => void) {
    try {
        const [activeProfile, profiles] = await Promise.all([
            StorageManager.get('activeProfile'),
            StorageManager.get('profiles'),
        ]);

        sendResponse({
            activeProfile,
            profileData: profiles && activeProfile && typeof profiles === 'object' && typeof activeProfile === 'string' ? (profiles as Record<string, any>)[activeProfile] : null,
        });
    } catch (error) {
        console.error('Error getting active profile:', error);
        sendResponse({ error: 'Failed to get active profile' });
    }
}

async function handleOpenNewTab() {
    try {
        await chrome.tabs.create({ url: 'chrome://newtab/' });
    } catch (error) {
        console.error('Error opening new tab:', error);
    }
}

async function handleGetBlockedSites(sendResponse: (response: any) => void) {
    try {
        const blockedSites = await StorageManager.getBlockedSites();
        sendResponse({ blockedSites });
    } catch (error) {
        console.error('Error getting blocked sites:', error);
        sendResponse({ error: 'Failed to get blocked sites' });
    }
}

// Utility functions
async function ensureActiveProfile() {
    try {
        const activeProfile = await StorageManager.get('activeProfile');

        if (!activeProfile) {
            // No active profile, could open popup or handle differently
            console.log('No active profile set');
        }
    } catch (error) {
        console.error('Error ensuring active profile:', error);
    }
}

// On startup, check for activeProfile
chrome.runtime.onStartup.addListener(() => {
    ensureActiveProfile();
});

console.log('Background script loaded');
