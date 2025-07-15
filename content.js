// Content Script for Website Blocking
// Checks if the current site is blocked and shows a block page

class WebsiteBlocker {
  constructor() {
    this.isBlocked = false;
    this.blockedSites = [];
    this.init();
  }

  async init() {
    try {
      // Skip if already processed or if this is an extension page
      if (window.location.protocol === 'chrome-extension:' || 
          window.location.protocol === 'chrome:' ||
          document.getElementById('website-blocker-overlay')) {
        return;
      }

      await this.loadBlockedSites();
      this.checkCurrentSite();
      this.setupMessageListener();
    } catch (error) {
      console.error("Error initializing website blocker:", error);
    }
  }

  async loadBlockedSites() {
    try {
      const { blockedSites } = await chrome.storage.local.get(["blockedSites"]);
      this.blockedSites = blockedSites || [];
    } catch (error) {
      console.error("Error loading blocked sites:", error);
      this.blockedSites = [];
    }
  }

  checkCurrentSite() {
    if (this.blockedSites.length === 0) {
      return; // No blocked sites, exit
    }

    // Get current hostname and clean it up
    const hostname = this.cleanHostname(window.location.hostname);

    // Check if current site is blocked
    const isBlocked = this.blockedSites.some((site) => {
      return this.isHostnameBlocked(hostname, site);
    });

    if (isBlocked && !this.isBlocked) {
      this.blockCurrentSite(hostname);
    }
  }

  cleanHostname(hostname) {
    return hostname.replace(/^www\./, "").toLowerCase();
  }

  isHostnameBlocked(hostname, blockedSite) {
    // Exact match
    if (hostname === blockedSite) return true;
    
    // Subdomain match (e.g., m.facebook.com matches facebook.com)
    if (hostname.endsWith('.' + blockedSite)) return true;
    
    // Parent domain match (e.g., facebook.com matches m.facebook.com)
    if (blockedSite.endsWith('.' + hostname)) return true;
    
    return false;
  }

  blockCurrentSite(hostname) {
    this.isBlocked = true;
    this.showBlockPage(hostname);
    this.preventNavigation();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "updateBlockedSites") {
        this.handleBlockedSitesUpdate(message.blockedSites || []);
      }
    });
  }

  handleBlockedSitesUpdate(newBlockedSites) {
    this.blockedSites = newBlockedSites;
    const hostname = this.cleanHostname(window.location.hostname);

    // Check if current site is now blocked
    const shouldBeBlocked = this.blockedSites.some((site) => {
      return this.isHostnameBlocked(hostname, site);
    });

    if (shouldBeBlocked && !this.isBlocked) {
      // Site is now blocked, show block page
      this.blockCurrentSite(hostname);
    } else if (!shouldBeBlocked && this.isBlocked) {
      // Site is no longer blocked, remove block page if it exists
      this.unblockCurrentSite();
    }
  }

  unblockCurrentSite() {
    const blockPage = document.getElementById("website-blocker-overlay");
    if (blockPage) {
      blockPage.remove();
      document.documentElement.style.overflow = "";
      this.isBlocked = false;
      // Reload the page to restore original content
      window.location.reload();
    }
  }

  preventNavigation() {
    if (window.history && window.history.pushState) {
      window.history.pushState(null, null, window.location.href);
      
      const preventBack = () => {
        window.history.pushState(null, null, window.location.href);
      };
      
      window.addEventListener("popstate", preventBack);
      
      // Store reference to remove listener if needed
      this.preventBackListener = preventBack;
    }
  }

  showBlockPage(hostname) {
    // Prevent multiple block pages
    if (document.getElementById("website-blocker-overlay")) {
      return;
    }

    // Create a full-screen blocking overlay
    const blockPage = document.createElement("div");
    blockPage.id = "website-blocker-overlay";
    blockPage.innerHTML = this.getBlockPageHTML(hostname);

    // Remove existing content and add block page
    document.documentElement.innerHTML = "";
    document.documentElement.appendChild(blockPage);

    // Setup event listeners
    this.setupBlockPageEvents(blockPage);

    // Prevent scrolling
    document.documentElement.style.overflow = "hidden";
  }

  getBlockPageHTML(hostname) {
    return `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: white;
        text-align: center;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 500px;
          margin: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        ">
          <div style="font-size: 4em; margin-bottom: 20px; animation: pulse 2s infinite;">🚫</div>
          <h1 style="font-size: 2.5em; margin-bottom: 20px; font-weight: 300;">Site Blocked</h1>
          <p style="font-size: 1.2em; margin-bottom: 10px; opacity: 0.9;">
            <strong style="color: #ffeb3b;">${this.escapeHtml(hostname)}</strong> is blocked to help you stay focused.
          </p>
          <p style="font-size: 1em; opacity: 0.8; margin-bottom: 30px; line-height: 1.5;">
            Remove this site from your blocked list in the Productivity Hub to access it again.
          </p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button id="goBackBtn" style="
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: 2px solid white;
              padding: 15px 30px;
              border-radius: 10px;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.3s;
              font-weight: 500;
            ">
              ← Go Back
            </button>
            <button id="openNewTabBtn" style="
              background: white;
              color: #667eea;
              border: none;
              padding: 15px 30px;
              border-radius: 10px;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.3s;
              font-weight: bold;
              box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            ">
              🎯 Open Productivity Hub
            </button>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="font-size: 0.9em; opacity: 0.7; font-style: italic;">
              "The successful warrior is the average person with laser-like focus." - Bruce Lee
            </p>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      </div>
    `;
  }

  setupBlockPageEvents(blockPage) {
    const goBackBtn = blockPage.querySelector("#goBackBtn");
    const openNewTabBtn = blockPage.querySelector("#openNewTabBtn");

    if (goBackBtn) {
      goBackBtn.addEventListener("click", () => {
        window.history.back();
      });

      goBackBtn.addEventListener("mouseover", () => {
        goBackBtn.style.background = "rgba(255, 255, 255, 0.3)";
        goBackBtn.style.transform = "translateY(-2px)";
      });

      goBackBtn.addEventListener("mouseout", () => {
        goBackBtn.style.background = "rgba(255, 255, 255, 0.2)";
        goBackBtn.style.transform = "translateY(0)";
      });
    }

    if (openNewTabBtn) {
      openNewTabBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "openNewTab" });
      });

      openNewTabBtn.addEventListener("mouseover", () => {
        openNewTabBtn.style.transform = "translateY(-2px)";
        openNewTabBtn.style.boxShadow = "0 8px 25px rgba(0,0,0,0.3)";
      });

      openNewTabBtn.addEventListener("mouseout", () => {
        openNewTabBtn.style.transform = "translateY(0)";
        openNewTabBtn.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the website blocker
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WebsiteBlocker();
  });
} else {
  new WebsiteBlocker();
}

// Legacy code removed - now handled by WebsiteBlocker class
