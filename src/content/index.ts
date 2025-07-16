// Content Script for Website Blocking
// Checks if the current site is blocked and shows a block page

class WebsiteBlocker {
    private isBlocked = false
    private blockedSites: string[] = []
    private preventBackListener?: () => void

    constructor() {
        this.init()
    }

    private async init() {
        try {
            // Skip if already processed or if this is an extension page
            if (window.location.protocol === 'chrome-extension:' ||
                window.location.protocol === 'chrome:' ||
                document.getElementById('website-blocker-overlay')) {
                return
            }

            await this.loadBlockedSites()
            this.checkCurrentSite()
            this.setupMessageListener()
        } catch (error) {
            console.error("Error initializing website blocker:", error)
        }
    }

    private async loadBlockedSites() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getBlockedSites' })
            this.blockedSites = response.blockedSites || []
        } catch (error) {
            console.error("Error loading blocked sites:", error)
            this.blockedSites = []
        }
    }

    private checkCurrentSite() {
        if (this.blockedSites.length === 0) {
            return // No blocked sites, exit
        }

        // Get current hostname and clean it up
        const hostname = this.cleanHostname(window.location.hostname)

        // Check if current site is blocked
        const isBlocked = this.blockedSites.some((site) => {
            return this.isHostnameBlocked(hostname, site)
        })

        if (isBlocked && !this.isBlocked) {
            this.blockCurrentSite(hostname)
        }
    }

    private cleanHostname(hostname: string): string {
        return hostname.replace(/^www\./, "").toLowerCase()
    }

    private isHostnameBlocked(hostname: string, blockedSite: string): boolean {
        // Exact match
        if (hostname === blockedSite) return true

        // Subdomain match (e.g., m.facebook.com matches facebook.com)
        if (hostname.endsWith('.' + blockedSite)) return true

        // Parent domain match (e.g., facebook.com matches m.facebook.com)
        if (blockedSite.endsWith('.' + hostname)) return true

        return false
    }

    private blockCurrentSite(hostname: string) {
        this.isBlocked = true
        this.showBlockPage(hostname)
        this.preventNavigation()
    }

    private setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "updateBlockedSites") {
                this.handleBlockedSitesUpdate(message.blockedSites || [])
            }
        })
    }

    private handleBlockedSitesUpdate(newBlockedSites: string[]) {
        this.blockedSites = newBlockedSites
        const hostname = this.cleanHostname(window.location.hostname)

        // Check if current site is now blocked
        const shouldBeBlocked = this.blockedSites.some((site) => {
            return this.isHostnameBlocked(hostname, site)
        })

        if (shouldBeBlocked && !this.isBlocked) {
            // Site is now blocked, show block page
            this.blockCurrentSite(hostname)
        } else if (!shouldBeBlocked && this.isBlocked) {
            // Site is no longer blocked, remove block page if it exists
            this.unblockCurrentSite()
        }
    }

    private unblockCurrentSite() {
        const blockPage = document.getElementById("website-blocker-overlay")
        if (blockPage) {
            blockPage.remove()
            document.documentElement.style.overflow = ""
            this.isBlocked = false
            // Reload the page to restore original content
            window.location.reload()
        }
    }

    private preventNavigation() {
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, window.location.href)

            const preventBack = () => {
                window.history.pushState(null, null, window.location.href)
            }

            window.addEventListener("popstate", preventBack)

            // Store reference to remove listener if needed
            this.preventBackListener = preventBack
        }
    }

    private showBlockPage(hostname: string) {
        // Prevent multiple block pages
        if (document.getElementById("website-blocker-overlay")) {
            return
        }

        // Create a full-screen blocking overlay
        const blockPage = document.createElement("div")
        blockPage.id = "website-blocker-overlay"
        blockPage.innerHTML = this.getBlockPageHTML(hostname)

        // Remove existing content and add block page
        document.documentElement.innerHTML = ""
        document.documentElement.appendChild(blockPage)

        // Setup event listeners
        this.setupBlockPageEvents(blockPage)

        // Prevent scrolling
        document.documentElement.style.overflow = "hidden"
    }

    private getBlockPageHTML(hostname: string): string {
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
        font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        color: white;
        text-align: center;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          padding: 48px;
          border-radius: 24px;
          backdrop-filter: blur(20px);
          max-width: 600px;
          margin: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.2);
        ">
          <div style="font-size: 5em; margin-bottom: 24px; animation: pulse 2s infinite;">🚫</div>
          <h1 style="font-size: 3em; margin-bottom: 24px; font-weight: 300; letter-spacing: -0.02em;">Site Blocked</h1>
          <p style="font-size: 1.3em; margin-bottom: 16px; opacity: 0.95; line-height: 1.5;">
            <strong style="color: #fbbf24; font-weight: 600;">${this.escapeHtml(hostname)}</strong> is blocked to help you stay focused.
          </p>
          <p style="font-size: 1.1em; opacity: 0.8; margin-bottom: 40px; line-height: 1.6;">
            Remove this site from your blocked list in the Productivity Hub to access it again.
          </p>
          <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px;">
            <button id="goBackBtn" style="
              background: rgba(255, 255, 255, 0.15);
              color: white;
              border: 2px solid rgba(255, 255, 255, 0.3);
              padding: 16px 32px;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
              backdrop-filter: blur(10px);
            ">
              ← Go Back
            </button>
            <button id="openNewTabBtn" style="
              background: white;
              color: #667eea;
              border: none;
              padding: 16px 32px;
              border-radius: 12px;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.3s ease;
              font-weight: 600;
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            ">
              🎯 Open Productivity Hub
            </button>
          </div>
          <div style="padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="font-size: 1em; opacity: 0.7; font-style: italic; line-height: 1.5;">
              "The successful warrior is the average person with laser-like focus."<br>
              <span style="opacity: 0.6; font-size: 0.9em;">— Bruce Lee</span>
            </p>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        </style>
      </div>
    `
    }

    private setupBlockPageEvents(blockPage: HTMLElement) {
        const goBackBtn = blockPage.querySelector("#goBackBtn") as HTMLButtonElement
        const openNewTabBtn = blockPage.querySelector("#openNewTabBtn") as HTMLButtonElement

        if (goBackBtn) {
            goBackBtn.addEventListener("click", () => {
                window.history.back()
            })

            goBackBtn.addEventListener("mouseover", () => {
                goBackBtn.style.background = "rgba(255, 255, 255, 0.25)"
                goBackBtn.style.transform = "translateY(-2px)"
                goBackBtn.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)"
            })

            goBackBtn.addEventListener("mouseout", () => {
                goBackBtn.style.background = "rgba(255, 255, 255, 0.15)"
                goBackBtn.style.transform = "translateY(0)"
                goBackBtn.style.boxShadow = "none"
            })
        }

        if (openNewTabBtn) {
            openNewTabBtn.addEventListener("click", () => {
                chrome.runtime.sendMessage({ action: "openNewTab" })
            })

            openNewTabBtn.addEventListener("mouseover", () => {
                openNewTabBtn.style.transform = "translateY(-2px)"
                openNewTabBtn.style.boxShadow = "0 12px 35px rgba(0,0,0,0.2)"
            })

            openNewTabBtn.addEventListener("mouseout", () => {
                openNewTabBtn.style.transform = "translateY(0)"
                openNewTabBtn.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)"
            })
        }
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }
}

// Initialize the website blocker
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WebsiteBlocker()
    })
} else {
    new WebsiteBlocker()
}