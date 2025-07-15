// Productivity Hub Options Script

class OptionsManager {
  constructor() {
    this.profiles = {};
    this.activeProfile = null;
    this.editingProfile = null;
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupUI();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing options:', error);
      this.showNotification('Failed to load options', 'error');
    }
  }

  async loadData() {
    const data = await chrome.storage.local.get(['profiles', 'activeProfile']);
    this.profiles = data.profiles || {};
    this.activeProfile = data.activeProfile;
  }

  setupUI() {
    this.renderProfiles();
    this.setupProfileEditor();
  }

  renderProfiles() {
    const profilesList = document.getElementById('profiles-list');
    if (!profilesList) return;

    profilesList.innerHTML = '';

    if (Object.keys(this.profiles).length === 0) {
      profilesList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No profiles configured</p>';
      return;
    }

    Object.entries(this.profiles).forEach(([name, profile]) => {
      const profileCard = document.createElement('div');
      profileCard.className = 'profile-card';
      profileCard.style.cssText = `
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s;
      `;

      const isActive = name === this.activeProfile;
      const statusBadge = isActive 
        ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; margin-left: 8px;">ACTIVE</span>'
        : '';

      profileCard.innerHTML = `
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #333; display: flex; align-items: center;">
            ${this.escapeHtml(name)}${statusBadge}
          </h3>
          <div style="margin-left: auto;">
            <button class="edit-btn" data-edit="${name}" style="
              background: #3b82f6; color: white; border: none; padding: 6px 12px; 
              border-radius: 4px; font-size: 12px; cursor: pointer; margin-right: 6px;
            ">Edit</button>
            <button class="delete-btn" data-delete="${name}" style="
              background: #ef4444; color: white; border: none; padding: 6px 12px; 
              border-radius: 4px; font-size: 12px; cursor: pointer;
            " ${isActive ? 'disabled title="Cannot delete active profile"' : ''}>Delete</button>
          </div>
        </div>
        <div style="font-size: 14px; color: #666; line-height: 1.4;">
          <div style="margin-bottom: 6px;">
            <strong>🚫 Blocked Sites (${profile.blockedSites.length}):</strong> 
            ${profile.blockedSites.length > 0 ? profile.blockedSites.slice(0, 5).join(', ') + (profile.blockedSites.length > 5 ? '...' : '') : 'None'}
          </div>
          <div style="margin-bottom: 6px;">
            <strong>⏱️ Daily Limit:</strong> ${profile.dailyLimitMinutes} minutes
          </div>
          <div style="display: flex; gap: 16px; font-size: 12px;">
            ${profile.slackNotification ? '<span style="color: #10b981;">✓ Slack notifications</span>' : '<span style="color: #6b7280;">✗ Slack notifications</span>'}
            ${profile.motivationalQuotes ? '<span style="color: #10b981;">✓ Motivational quotes</span>' : '<span style="color: #6b7280;">✗ Motivational quotes</span>'}
          </div>
        </div>
      `;

      profilesList.appendChild(profileCard);
    });
  }

  setupProfileEditor() {
    const profileEditor = document.getElementById('profile-editor');
    if (!profileEditor) return;

    profileEditor.innerHTML = `
      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-top: 20px;">
        <h3 id="editor-title" style="margin: 0 0 16px 0; color: #333;">Create New Profile</h3>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #333;">Profile Name:</label>
          <input type="text" id="profile-name" placeholder="Enter profile name" style="
            width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; 
            font-size: 14px; box-sizing: border-box;
          ">
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #333;">Blocked Sites:</label>
          <textarea id="blocked-sites" placeholder="Enter sites separated by commas (e.g., facebook.com, youtube.com)" style="
            width: 100%; height: 80px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; 
            font-size: 14px; resize: vertical; box-sizing: border-box; font-family: monospace;
          "></textarea>
          <small style="color: #6b7280; font-size: 12px;">One site per line or separated by commas</small>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #333;">Daily Limit (minutes):</label>
          <input type="number" id="daily-limit" min="1" max="1440" value="60" style="
            width: 100px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;
          ">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
            <input type="checkbox" id="slack-notification" style="margin-right: 8px;">
            <span style="font-weight: 500; color: #333;">Enable Slack notifications</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="motivational-quotes" style="margin-right: 8px;">
            <span style="font-weight: 500; color: #333;">Enable motivational quotes</span>
          </label>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="save-profile-btn" style="
            background: #10b981; color: white; border: none; padding: 10px 20px; 
            border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;
          ">Save Profile</button>
          <button id="cancel-edit-btn" style="
            background: #6b7280; color: white; border: none; padding: 10px 20px; 
            border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;
          ">Cancel</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Profile list actions
    document.addEventListener('click', (e) => {
      if (e.target.dataset.edit) {
        this.editProfile(e.target.dataset.edit);
      } else if (e.target.dataset.delete) {
        this.deleteProfile(e.target.dataset.delete);
      } else if (e.target.id === 'add-profile-btn') {
        this.showProfileEditor();
      } else if (e.target.id === 'save-profile-btn') {
        this.saveProfile();
      } else if (e.target.id === 'cancel-edit-btn') {
        this.hideProfileEditor();
      }
    });

    // Hover effects
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('.profile-card')) {
        e.target.closest('.profile-card').style.transform = 'translateY(-2px)';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('.profile-card')) {
        e.target.closest('.profile-card').style.transform = 'translateY(0)';
      }
    });
  }

  showProfileEditor(profileName = null) {
    const profileEditor = document.getElementById('profile-editor');
    const editorTitle = document.getElementById('editor-title');
    
    if (!profileEditor || !editorTitle) return;

    this.editingProfile = profileName;
    profileEditor.style.display = 'block';

    if (profileName) {
      // Edit mode
      editorTitle.textContent = `Edit Profile: ${profileName}`;
      this.populateEditor(this.profiles[profileName]);
    } else {
      // Create mode
      editorTitle.textContent = 'Create New Profile';
      this.clearEditor();
    }

    // Scroll to editor
    profileEditor.scrollIntoView({ behavior: 'smooth' });
  }

  hideProfileEditor() {
    const profileEditor = document.getElementById('profile-editor');
    if (profileEditor) {
      profileEditor.style.display = 'none';
    }
    this.editingProfile = null;
  }

  populateEditor(profile) {
    document.getElementById('profile-name').value = this.editingProfile || '';
    document.getElementById('blocked-sites').value = profile.blockedSites.join('\n');
    document.getElementById('daily-limit').value = profile.dailyLimitMinutes;
    document.getElementById('slack-notification').checked = profile.slackNotification || false;
    document.getElementById('motivational-quotes').checked = profile.motivationalQuotes || false;

    // Disable name editing for existing profiles
    document.getElementById('profile-name').disabled = !!this.editingProfile;
  }

  clearEditor() {
    document.getElementById('profile-name').value = '';
    document.getElementById('profile-name').disabled = false;
    document.getElementById('blocked-sites').value = '';
    document.getElementById('daily-limit').value = 60;
    document.getElementById('slack-notification').checked = false;
    document.getElementById('motivational-quotes').checked = false;
  }

  editProfile(profileName) {
    this.showProfileEditor(profileName);
  }

  async deleteProfile(profileName) {
    if (profileName === this.activeProfile) {
      this.showNotification('Cannot delete the active profile', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${profileName}" profile?`)) {
      return;
    }

    try {
      delete this.profiles[profileName];
      await chrome.storage.local.set({ profiles: this.profiles });
      this.renderProfiles();
      this.showNotification(`Profile "${profileName}" deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting profile:', error);
      this.showNotification('Failed to delete profile', 'error');
    }
  }

  async saveProfile() {
    const profileName = document.getElementById('profile-name').value.trim();
    const blockedSitesText = document.getElementById('blocked-sites').value.trim();
    const dailyLimit = parseInt(document.getElementById('daily-limit').value);
    const slackNotification = document.getElementById('slack-notification').checked;
    const motivationalQuotes = document.getElementById('motivational-quotes').checked;

    // Validation
    if (!profileName) {
      this.showNotification('Please enter a profile name', 'error');
      return;
    }

    if (!this.editingProfile && this.profiles[profileName]) {
      this.showNotification('A profile with this name already exists', 'error');
      return;
    }

    if (dailyLimit < 1 || dailyLimit > 1440) {
      this.showNotification('Daily limit must be between 1 and 1440 minutes', 'error');
      return;
    }

    // Parse blocked sites
    const blockedSites = blockedSitesText
      .split(/[,\n]/)
      .map(site => site.trim())
      .filter(site => site.length > 0)
      .map(site => this.cleanUrl(site))
      .filter(site => this.isValidUrl(site));

    try {
      const finalProfileName = this.editingProfile || profileName;
      
      this.profiles[finalProfileName] = {
        blockedSites,
        dailyLimitMinutes: dailyLimit,
        slackNotification,
        motivationalQuotes
      };

      await chrome.storage.local.set({ profiles: this.profiles });
      
      this.hideProfileEditor();
      this.renderProfiles();
      
      const action = this.editingProfile ? 'updated' : 'created';
      this.showNotification(`Profile "${finalProfileName}" ${action} successfully`, 'success');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showNotification('Failed to save profile', 'error');
    }
  }

  cleanUrl(url) {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }

  isValidUrl(url) {
    const urlPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return urlPattern.test(url) && url.includes('.');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.options-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'options-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      background: ${type === 'error' ? '#fee2e2' : type === 'success' ? '#d1fae5' : '#dbeafe'};
      color: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#2563eb'};
      border: 1px solid ${type === 'error' ? '#fecaca' : type === 'success' ? '#a7f3d0' : '#93c5fd'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    // Add animation keyframes
    if (!document.querySelector('#options-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'options-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);
  }
}

// Initialize options manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});