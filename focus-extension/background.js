// FocusGuard Background Script
// Handles profile loading and blocking logic

const DEFAULT_PROFILES = {
  Work: {
    blockedSites: ["youtube.com", "reddit.com"],
    dailyLimitMinutes: 30,
    slackNotification: true
  },
  Study: {
    blockedSites: ["facebook.com", "netflix.com"],
    dailyLimitMinutes: 45,
    motivationalQuotes: true
  },
  Entertainment: {
    blockedSites: [],
    dailyLimitMinutes: 999
  }
};

// Initialize storage with default profiles if not present
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["profiles"], (result) => {
    if (!result.profiles) {
      chrome.storage.local.set({
        profiles: DEFAULT_PROFILES,
        activeProfile: null
      });
    }
  });
});

// On startup, check for activeProfile
chrome.runtime.onStartup.addListener(() => {
  ensureActiveProfile();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_ACTIVE_PROFILE") {
    chrome.storage.local.get(["activeProfile", "profiles"], (data) => {
      sendResponse({
        activeProfile: data.activeProfile,
        profileData: data.profiles ? data.profiles[data.activeProfile] : null
      });
    });
    return true; // async
  }
  // Add more message handlers as needed
});

function ensureActiveProfile() {
  chrome.storage.local.get(["activeProfile", "profiles"], (data) => {
    if (!data.activeProfile) {
      // No active profile, prompt user via popup
      chrome.action.openPopup();
    } else {
      // Load blocking rules for the active profile
      // (Handled in content/background logic)
    }
  });
}

// Utility: Promisified chrome.storage.local.get
function getFromStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

// Utility: Promisified chrome.storage.local.set
function setToStorage(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, resolve);
  });
}

// TODO: Add analytics and Slack/Discord integration for rule breaking