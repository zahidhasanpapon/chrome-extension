// Productivity Hub Popup Script

class PopupManager {
  constructor() {
    this.profiles = {};
    this.activeProfile = null;
    this.stats = {};
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupUI();
      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing popup:", error);
      this.showError("Failed to load extension data");
    }
  }

  async loadData() {
    try {
      // Load all necessary data
      const [profileData, statsResponse] = await Promise.all([
        chrome.storage.local.get(["profiles", "activeProfile"]),
        chrome.runtime.sendMessage({ action: "getStats" }),
      ]);

      this.profiles = profileData.profiles || {};
      this.activeProfile = profileData.activeProfile;
      this.stats = statsResponse.stats || {};
    } catch (error) {
      console.error("Error loading data:", error);
      throw error;
    }
  }

  setupUI() {
    this.renderProfiles();
    this.renderStats();
    this.renderQuickActions();
  }

  renderProfiles() {
    const profileSelect = document.getElementById("profile-select");
    const profileInfo = document.getElementById("profile-info");

    if (!profileSelect || !profileInfo) return;

    // Clear and populate profile select
    profileSelect.innerHTML = "";

    if (Object.keys(this.profiles).length === 0) {
      profileSelect.innerHTML =
        '<option value="">No profiles available</option>';
      profileInfo.innerHTML =
        '<p style="color: #666;">No profiles configured</p>';
      return;
    }

    Object.keys(this.profiles).forEach((profileName) => {
      const option = document.createElement("option");
      option.value = profileName;
      option.textContent = profileName;
      if (profileName === this.activeProfile) {
        option.selected = true;
      }
      profileSelect.appendChild(option);
    });

    // Show info for selected profile
    this.showProfileInfo(profileSelect.value);
  }

  renderStats() {
    const container = document.getElementById("profile-info");
    if (!container) return;

    const statsHTML = `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">📊 Today's Progress</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div style="text-align: center; padding: 8px; background: #f0f9ff; border-radius: 6px;">
            <div style="font-weight: bold; color: #0369a1; font-size: 16px;">${
              this.stats.todayCompleted || 0
            }</div>
            <div style="color: #666;">Completed</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #fef3c7; border-radius: 6px;">
            <div style="font-weight: bold; color: #d97706; font-size: 16px;">${
              this.stats.blockedSitesCount || 0
            }</div>
            <div style="color: #666;">Blocked Sites</div>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", statsHTML);
  }

  renderQuickActions() {
    const container = document.getElementById("profile-info");
    if (!container) return;

    const actionsHTML = `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
        <button id="open-hub-btn" style="
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          🎯 Open Productivity Hub
        </button>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", actionsHTML);
  }

  setupEventListeners() {
    const profileSelect = document.getElementById("profile-select");
    const activateBtn = document.getElementById("activate-btn");

    if (profileSelect) {
      profileSelect.addEventListener("change", (e) => {
        this.showProfileInfo(e.target.value);
      });
    }

    if (activateBtn) {
      activateBtn.addEventListener("click", () => {
        this.activateProfile();
      });
    }

    // Quick actions
    document.addEventListener("click", (e) => {
      if (e.target.id === "open-hub-btn") {
        this.openProductivityHub();
      }
    });

    // Hover effects
    document.addEventListener("mouseover", (e) => {
      if (e.target.id === "open-hub-btn") {
        e.target.style.transform = "translateY(-1px)";
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.id === "open-hub-btn") {
        e.target.style.transform = "translateY(0)";
      }
    });
  }

  showProfileInfo(profileName) {
    const profileInfo = document.getElementById("profile-info");
    if (!profileInfo || !profileName || !this.profiles[profileName]) {
      if (profileInfo) profileInfo.innerHTML = "";
      return;
    }

    const profile = this.profiles[profileName];
    const isActive = profileName === this.activeProfile;

    const statusBadge = isActive
      ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">ACTIVE</span>'
      : '<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">INACTIVE</span>';

    profileInfo.innerHTML = `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <strong style="color: #333;">${profileName}</strong>
          ${statusBadge}
        </div>
        <div style="font-size: 12px; color: #666; line-height: 1.4;">
          <div style="margin-bottom: 4px;">
            <strong>🚫 Blocked Sites:</strong> ${
              profile.blockedSites.length > 0
                ? profile.blockedSites.slice(0, 3).join(", ") +
                  (profile.blockedSites.length > 3 ? "..." : "")
                : "None"
            }
          </div>
          <div style="margin-bottom: 4px;">
            <strong>⏱️ Daily Limit:</strong> ${
              profile.dailyLimitMinutes
            } minutes
          </div>
          ${
            profile.slackNotification
              ? '<div style="color: #10b981;">✓ Slack notifications enabled</div>'
              : ""
          }
          ${
            profile.motivationalQuotes
              ? '<div style="color: #10b981;">✓ Motivational quotes enabled</div>'
              : ""
          }
        </div>
      </div>
    `;
  }

  async activateProfile() {
    const profileSelect = document.getElementById("profile-select");
    const activateBtn = document.getElementById("activate-btn");

    if (!profileSelect || !activateBtn) return;

    const selectedProfile = profileSelect.value;
    if (!selectedProfile) {
      this.showError("Please select a profile");
      return;
    }

    if (selectedProfile === this.activeProfile) {
      this.showSuccess("Profile is already active");
      return;
    }

    try {
      // Show loading state
      activateBtn.textContent = "Activating...";
      activateBtn.disabled = true;

      // Activate profile
      await chrome.storage.local.set({ activeProfile: selectedProfile });
      this.activeProfile = selectedProfile;

      // Update UI
      this.showProfileInfo(selectedProfile);
      this.showSuccess(`Activated ${selectedProfile} profile`);

      // Close popup after short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error("Error activating profile:", error);
      this.showError("Failed to activate profile");
    } finally {
      activateBtn.textContent = "Activate";
      activateBtn.disabled = false;
    }
  }

  async openProductivityHub() {
    try {
      await chrome.tabs.create({ url: "chrome://newtab/" });
      window.close();
    } catch (error) {
      console.error("Error opening productivity hub:", error);
      this.showError("Failed to open productivity hub");
    }
  }

  showError(message) {
    this.showNotification(message, "error");
  }

  showSuccess(message) {
    this.showNotification(message, "success");
  }

  showNotification(message, type = "info") {
    // Remove existing notifications
    const existing = document.querySelector(".popup-notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = "popup-notification";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      z-index: 1000;
      animation: slideDown 0.3s ease-out;
      background: ${
        type === "error"
          ? "#fee2e2"
          : type === "success"
          ? "#d1fae5"
          : "#dbeafe"
      };
      color: ${
        type === "error"
          ? "#dc2626"
          : type === "success"
          ? "#059669"
          : "#2563eb"
      };
      border: 1px solid ${
        type === "error"
          ? "#fecaca"
          : type === "success"
          ? "#a7f3d0"
          : "#93c5fd"
      };
    `;

    // Add animation keyframes
    if (!document.querySelector("#popup-notification-styles")) {
      const style = document.createElement("style");
      style.id = "popup-notification-styles";
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
