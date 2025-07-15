// Todo List New Tab Script

class TodoApp {
  constructor() {
    this.todos = [];
    this.blockedSites = [];
    this.searchTerm = "";
    this.init();
  }

  async init() {
    await this.loadTodos();
    await this.loadBlockedSites();
    this.setupEventListeners();
    this.render();
    this.renderBlockedSites();
    
    // Initialize weather and prayer time features
    this.initTimeAndWeather();
    this.startTimeUpdater();
    
    // Initialize Tabby feature
    this.initTabby();
  }

  async loadTodos() {
    try {
      const result = await chrome.storage.local.get(["todos"]);
      this.todos = result.todos || [];
    } catch (error) {
      console.error("Error loading todos:", error);
      this.showNotification("Failed to load todos. Please refresh the page.", "error");
      this.todos = [];
    }
  }

  async loadBlockedSites() {
    try {
      const result = await chrome.storage.local.get(["blockedSites"]);
      this.blockedSites = result.blockedSites || [];
    } catch (error) {
      console.error("Error loading blocked sites:", error);
      this.showNotification("Failed to load blocked sites. Please refresh the page.", "error");
      this.blockedSites = [];
    }
  }

  async saveTodos() {
    try {
      await chrome.storage.local.set({ todos: this.todos });
    } catch (error) {
      console.error("Error saving todos:", error);
      this.showNotification("Failed to save todos", "error");
    }
  }

  async saveBlockedSites() {
    try {
      await chrome.storage.local.set({ blockedSites: this.blockedSites });
      // Notify all tabs about the updated blocked sites
      this.notifyTabsOfBlockedSitesUpdate();
    } catch (error) {
      console.error("Error saving blocked sites:", error);
      this.showNotification("Failed to save blocked sites", "error");
    }
  }

  // Debounced save functions for better performance
  debouncedSaveTodos = this.debounce(() => this.saveTodos(), 500);
  debouncedSaveBlockedSites = this.debounce(() => this.saveBlockedSites(), 500);

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async notifyTabsOfBlockedSitesUpdate() {
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach((tab) => {
        if (tab.url && !tab.url.startsWith("chrome://")) {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "updateBlockedSites",
              blockedSites: this.blockedSites,
            })
            .catch(() => {
              // Ignore errors for tabs that don't have content script
            });
        }
      });
    } catch (error) {
      console.error("Error notifying tabs:", error);
    }
  }

  setupEventListeners() {
    const todoInput = document.getElementById("todoInput");
    const addBtn = document.getElementById("addBtn");
    const todoSearch = document.getElementById("todoSearch");
    const blockedSiteInput = document.getElementById("blockedSiteInput");
    const blockBtn = document.getElementById("blockBtn");
    const exportBtn = document.getElementById("exportBtn");
    const importBtn = document.getElementById("importBtn");

    // Todo event listeners
    addBtn.addEventListener("click", () => this.addTodo());
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTodo();
      }
    });

    todoSearch.addEventListener("input", (e) => {
      this.searchTerm = e.target.value;
      this.render();
    });

    // Blocked sites event listeners
    blockBtn.addEventListener("click", () => this.blockSite());
    blockedSiteInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.blockSite();
      }
    });

    // Export/Import event listeners
    exportBtn.addEventListener("click", () => this.exportBlockedSites());
    importBtn.addEventListener("click", () => this.importBlockedSites());

    // Tab switching event listeners
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabName = e.target.getAttribute("data-tab");
        this.switchTab(tabName);
      });
    });

    // Focus on input when page loads
    todoInput.focus();
  }

  addTodo() {
    const todoInput = document.getElementById("todoInput");
    const text = todoInput.value.trim();

    if (!text) {
      todoInput.focus();
      this.showNotification("Please enter a task description", "error");
      return;
    }

    if (text.length > 200) {
      this.showNotification("Task description is too long (max 200 characters)", "error");
      return;
    }

    // Check for duplicate todos
    if (this.todos.some(todo => todo.text.toLowerCase() === text.toLowerCase())) {
      this.showNotification("This task already exists", "error");
      return;
    }

    const todo = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.todos.unshift(todo); // Add to beginning of array
    todoInput.value = "";
    todoInput.focus();

    this.saveTodos();
    this.render();
    this.showNotification("Task added successfully!", "success");
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date().toISOString() : null;
      this.saveTodos();
      this.render();
      
      const action = todo.completed ? "completed" : "uncompleted";
      this.showNotification(`Task ${action}!`, "success");
    }
  }

  deleteTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    // Show confirmation for non-completed todos
    if (!todo.completed) {
      if (!confirm(`Are you sure you want to delete "${todo.text}"?`)) {
        return;
      }
    }

    this.todos = this.todos.filter((t) => t.id !== id);
    this.saveTodos();
    this.render();
    this.showNotification("Task deleted", "info");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Website blocking methods
  blockSite() {
    const blockedSiteInput = document.getElementById("blockedSiteInput");
    const url = blockedSiteInput.value.trim();

    if (!url) {
      blockedSiteInput.focus();
      this.showNotification("Please enter a website URL", "error");
      return;
    }

    // Clean up URL - remove protocol and www, extract domain
    const cleanUrl = this.cleanUrl(url);

    // Validate URL format
    if (!this.isValidUrl(cleanUrl)) {
      this.showNotification("Please enter a valid website URL (e.g., facebook.com)", "error");
      return;
    }

    // Check for localhost or IP addresses
    if (this.isLocalOrPrivateUrl(cleanUrl)) {
      this.showNotification("Cannot block localhost or private IP addresses", "error");
      return;
    }

    if (this.blockedSites.includes(cleanUrl)) {
      this.showNotification("This site is already blocked!", "error");
      blockedSiteInput.value = "";
      blockedSiteInput.focus();
      return;
    }

    this.blockedSites.push(cleanUrl);
    blockedSiteInput.value = "";
    blockedSiteInput.focus();

    this.saveBlockedSites();
    this.renderBlockedSites();
    this.showNotification(`Successfully blocked ${cleanUrl}`, "success");
  }

  isValidUrl(url) {
    // Basic URL validation - should contain at least one dot and valid characters
    const urlPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return urlPattern.test(url) && url.includes('.');
  }

  isLocalOrPrivateUrl(url) {
    const localPatterns = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./
    ];
    
    return localPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return url.includes(pattern);
      } else {
        return pattern.test(url);
      }
    });
  }

  cleanUrl(url) {
    // Remove protocol (http://, https://)
    url = url.replace(/^https?:\/\//, "");
    // Remove www.
    url = url.replace(/^www\./, "");
    // Remove trailing slash and path
    url = url.split("/")[0];
    // Convert to lowercase
    return url.toLowerCase();
  }

  unblockSite(url) {
    this.blockedSites = this.blockedSites.filter((site) => site !== url);
    this.saveBlockedSites();
    this.renderBlockedSites();
  }

  // Update statistics for blocked sites
  updateBlockedSitesStats() {
    const blockedSitesCount = this.blockedSites.length;
    const statsElement = document.getElementById("blockedSitesStats");
    if (statsElement) {
      statsElement.innerHTML = `
        <div style="text-align: center; margin-top: 20px; color: #666;">
          <strong>${blockedSitesCount}</strong> site${
        blockedSitesCount !== 1 ? "s" : ""
      } blocked
        </div>
      `;
    }
  }

  switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((tab) => tab.classList.remove("active"));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((btn) => btn.classList.remove("active"));

    // Show selected tab content
    const selectedTab = document.getElementById(tabName + "-tab");
    if (selectedTab) {
      selectedTab.classList.add("active");
    }

    // Add active class to clicked button
    const clickedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (clickedButton) {
      clickedButton.classList.add("active");
    }

    // Focus on appropriate input
    if (tabName === "todos") {
      document.getElementById("todoInput").focus();
    } else if (tabName === "blocked") {
      document.getElementById("blockedSiteInput").focus();
    } else if (tabName === "tabby") {
      // Load tabs when Tabby tab is selected
      this.loadCurrentTabs();
      document.getElementById("group-name-input").focus();
    }
  }

  // Export/Import functionality
  exportBlockedSites() {
    try {
      if (this.blockedSites.length === 0) {
        this.showNotification("No blocked sites to export", "error");
        return;
      }

      const exportData = {
        blockedSites: this.blockedSites,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `blocked-sites-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      this.showNotification(`Exported ${this.blockedSites.length} blocked sites`, "success");
    } catch (error) {
      console.error("Export error:", error);
      this.showNotification("Failed to export blocked sites", "error");
    }
  }

  importBlockedSites() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        this.showNotification("File is too large (max 1MB)", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          let importedSites = [];

          // Handle both old format (array) and new format (object)
          if (Array.isArray(data)) {
            importedSites = data;
          } else if (data.blockedSites && Array.isArray(data.blockedSites)) {
            importedSites = data.blockedSites;
          } else {
            this.showNotification("Invalid file format. Expected array of URLs or proper export format.", "error");
            return;
          }

          // Validate imported sites
          const validSites = importedSites.filter(site => {
            if (typeof site !== 'string') return false;
            const cleanedSite = this.cleanUrl(site);
            return this.isValidUrl(cleanedSite) && !this.isLocalOrPrivateUrl(cleanedSite);
          });

          if (validSites.length === 0) {
            this.showNotification("No valid sites found in the imported file", "error");
            return;
          }

          // Merge with existing sites, avoiding duplicates
          const newSites = validSites
            .map(site => this.cleanUrl(site))
            .filter(site => !this.blockedSites.includes(site));

          if (newSites.length === 0) {
            this.showNotification("All sites from the file are already blocked", "info");
            return;
          }

          this.blockedSites = [...this.blockedSites, ...newSites];
          this.saveBlockedSites();
          this.renderBlockedSites();
          
          const skippedCount = validSites.length - newSites.length;
          let message = `Successfully imported ${newSites.length} new blocked sites!`;
          if (skippedCount > 0) {
            message += ` (${skippedCount} duplicates skipped)`;
          }
          this.showNotification(message, "success");

        } catch (error) {
          console.error("Import error:", error);
          this.showNotification("Error reading file. Please make sure it's a valid JSON file.", "error");
        }
      };

      reader.onerror = () => {
        this.showNotification("Error reading file", "error");
      };

      reader.readAsText(file);
    };
    input.click();
  }

  render() {
    const todoList = document.getElementById("todoList");
    const emptyState = document.getElementById("emptyState");
    const searchResults = document.getElementById("searchResults");

    // Clear existing items
    todoList.innerHTML = "";

    const filteredTodos = this.todos.filter((todo) =>
      todo.text.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.searchTerm) {
      searchResults.textContent = `${filteredTodos.length} result(s) found.`;
      searchResults.style.display = "block";
    } else {
      searchResults.style.display = "none";
    }

    if (filteredTodos.length === 0) {
      emptyState.style.display = "block";
      todoList.style.display = "none";
      if (this.todos.length > 0) {
        emptyState.innerHTML = "<p>🤷 No tasks match your search.</p>";
      } else {
        emptyState.innerHTML = "<p>🎉 No tasks yet! Add your first task above.</p>";
      }
    } else {
      emptyState.style.display = "none";
      todoList.style.display = "block";

      filteredTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = `todo-item ${todo.completed ? "completed" : ""}`;
        li.innerHTML = `
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-actions">
                        <button class="complete-btn" data-todo-id="${
                          todo.id
                        }" data-action="toggle">
                            ${todo.completed ? "↩️ Undo" : "✅ Done"}
                        </button>
                        <button class="delete-btn" data-todo-id="${
                          todo.id
                        }" data-action="delete">
                            🗑️ Delete
                        </button>
                    </div>
                `;

        // Add event listeners to the buttons
        const completeBtn = li.querySelector(".complete-btn");
        const deleteBtn = li.querySelector(".delete-btn");

        completeBtn.addEventListener("click", () => this.toggleTodo(todo.id));
        deleteBtn.addEventListener("click", () => this.deleteTodo(todo.id));

        todoList.appendChild(li);
      });
    }

    this.updateStats();
  }

  renderBlockedSites() {
    const blockedSitesList = document.getElementById("blockedSitesList");
    const blockedSitesEmpty = document.getElementById("blockedSitesEmpty");

    // Clear existing items
    blockedSitesList.innerHTML = "";

    if (this.blockedSites.length === 0) {
      blockedSitesEmpty.style.display = "block";
      blockedSitesList.style.display = "none";
    } else {
      blockedSitesEmpty.style.display = "none";
      blockedSitesList.style.display = "block";

      this.blockedSites.forEach((site) => {
        const li = document.createElement("li");
        li.className = "blocked-site-item";
        li.innerHTML = `
          <span class="blocked-site-url">${this.escapeHtml(site)}</span>
          <button class="unblock-btn" data-site="${site}">
            🔓 Unblock
          </button>
        `;

        // Add event listener to the unblock button
        const unblockBtn = li.querySelector(".unblock-btn");
        unblockBtn.addEventListener("click", () => this.unblockSite(site));

        blockedSitesList.appendChild(li);
      });
    }

    this.updateBlockedSitesStats();
  }

  updateStats() {
    const totalTasks = this.todos.length;
    const completedTasks = this.todos.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("pendingTasks").textContent = pendingTasks;
  }

  // Notification system
  showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
      <button class="notification-close" aria-label="Close notification">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "error" ? "#f44336" : type === "success" ? "#4caf50" : "#2196f3"};
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation keyframes if not already added
    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin: 0;
          line-height: 1;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Tabby - Bookmark Groups Functionality
  initTabby() {
    this.currentTabs = [];
    this.selectedTabs = new Set();
    this.bookmarkGroups = [];
    
    this.loadBookmarkGroups();
    this.setupTabbyEventListeners();
  }

  async loadCurrentTabs() {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      this.currentTabs = tabs.filter(tab => 
        !tab.url.startsWith('chrome://') && 
        !tab.url.startsWith('chrome-extension://') &&
        !tab.url.startsWith('moz-extension://')
      );
      this.renderTabs();
    } catch (error) {
      console.error('Error loading tabs:', error);
      this.showTabbyError('Failed to load tabs');
    }
  }

  renderTabs() {
    const tabsGrid = document.getElementById('tabs-grid');
    if (!tabsGrid) return;

    tabsGrid.innerHTML = '';

    if (this.currentTabs.length === 0) {
      tabsGrid.innerHTML = '<div class="empty-tabs">No tabs available</div>';
      return;
    }

    this.currentTabs.forEach(tab => {
      const tabItem = document.createElement('div');
      tabItem.className = 'tab-item';
      if (this.selectedTabs.has(tab.id)) {
        tabItem.classList.add('selected');
      }
      
      tabItem.innerHTML = `
        <input 
          type="checkbox" 
          class="tab-checkbox" 
          data-tab-id="${tab.id}"
          ${this.selectedTabs.has(tab.id) ? 'checked' : ''}
        />
        <img 
          src="${tab.favIconUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDE1TDE2IDlINEwxMCAxNVoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+'}" 
          class="tab-favicon" 
          alt="Tab icon"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDE1TDE2IDlINEwxMCAxNVoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+'"
        />
        <div class="tab-info">
          <div class="tab-title">${this.escapeHtml(tab.title)}</div>
          <div class="tab-url">${this.escapeHtml(new URL(tab.url).hostname)}</div>
        </div>
      `;

      tabItem.addEventListener('click', (e) => {
        if (e.target.type !== 'checkbox') {
          const checkbox = tabItem.querySelector('.tab-checkbox');
          checkbox.checked = !checkbox.checked;
          this.toggleTabSelection(tab.id, checkbox.checked);
        }
      });

      tabsGrid.appendChild(tabItem);
    });

    this.updateSelectedCount();
  }

  toggleTabSelection(tabId, isSelected) {
    if (isSelected) {
      this.selectedTabs.add(tabId);
    } else {
      this.selectedTabs.delete(tabId);
    }
    
    // Update UI
    const tabItem = document.querySelector(`[data-tab-id="${tabId}"]`).closest('.tab-item');
    if (tabItem) {
      if (isSelected) {
        tabItem.classList.add('selected');
      } else {
        tabItem.classList.remove('selected');
      }
    }
    
    this.updateSelectedCount();
    this.updateSelectAllCheckbox();
    this.updateSaveButton();
  }

  updateSelectedCount() {
    const selectedCount = document.getElementById('selected-count');
    if (selectedCount) {
      selectedCount.textContent = `${this.selectedTabs.size} tabs selected`;
    }
  }

  updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
      const totalTabs = this.currentTabs.length;
      const selectedCount = this.selectedTabs.size;
      
      selectAllCheckbox.checked = selectedCount === totalTabs && totalTabs > 0;
      selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalTabs;
    }
  }

  updateSaveButton() {
    const saveBtn = document.getElementById('save-tabs-btn');
    const groupInput = document.getElementById('group-name-input');
    
    if (saveBtn && groupInput) {
      const hasSelection = this.selectedTabs.size > 0;
      const hasName = groupInput.value.trim().length > 0;
      
      saveBtn.disabled = !hasSelection || !hasName;
    }
  }

  async loadBookmarkGroups() {
    try {
      const result = await chrome.storage.local.get(['bookmarkGroups']);
      this.bookmarkGroups = result.bookmarkGroups || [];
      this.renderBookmarkGroups();
    } catch (error) {
      console.error('Error loading bookmark groups:', error);
    }
  }

  renderBookmarkGroups() {
    const groupsList = document.getElementById('bookmark-groups-list');
    if (!groupsList) return;

    groupsList.innerHTML = '';

    if (this.bookmarkGroups.length === 0) {
      groupsList.innerHTML = '<div class="empty-groups">No saved groups yet. Create your first group above!</div>';
      return;
    }

    this.bookmarkGroups.forEach(group => {
      const groupItem = document.createElement('div');
      groupItem.className = 'bookmark-group';
      groupItem.innerHTML = `
        <div class="bookmark-group-info">
          <div class="bookmark-group-name">${this.escapeHtml(group.name)}</div>
          <div class="bookmark-group-count">${group.tabs.length} tabs • ${new Date(group.created).toLocaleDateString()}</div>
        </div>
        <div class="bookmark-group-actions">
          <button class="bookmark-group-btn open" data-group-id="${group.id}">Open All</button>
          <button class="bookmark-group-btn delete" data-group-id="${group.id}">Delete</button>
        </div>
      `;

      groupsList.appendChild(groupItem);
    });
  }

  setupTabbyEventListeners() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        this.currentTabs.forEach(tab => {
          if (isChecked) {
            this.selectedTabs.add(tab.id);
          } else {
            this.selectedTabs.delete(tab.id);
          }
        });
        this.renderTabs();
      });
    }

    // Tab checkboxes
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('tab-checkbox')) {
        const tabId = parseInt(e.target.dataset.tabId);
        this.toggleTabSelection(tabId, e.target.checked);
      }
    });

    // Save tabs button
    const saveTabsBtn = document.getElementById('save-tabs-btn');
    if (saveTabsBtn) {
      saveTabsBtn.addEventListener('click', () => {
        this.saveSelectedTabs();
      });
    }

    // Refresh tabs button
    const refreshTabsBtn = document.getElementById('refresh-tabs-btn');
    if (refreshTabsBtn) {
      refreshTabsBtn.addEventListener('click', () => {
        this.loadCurrentTabs();
      });
    }

    // Group name input
    const groupNameInput = document.getElementById('group-name-input');
    if (groupNameInput) {
      groupNameInput.addEventListener('input', () => {
        this.updateSaveButton();
      });
      
      groupNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.saveSelectedTabs();
        }
      });
    }

    // Bookmark group actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('bookmark-group-btn')) {
        const groupId = e.target.dataset.groupId;
        const action = e.target.classList.contains('open') ? 'open' : 'delete';
        
        if (action === 'open') {
          this.openBookmarkGroup(groupId);
        } else {
          this.deleteBookmarkGroup(groupId);
        }
      }
    });
  }

  async saveSelectedTabs() {
    const groupNameInput = document.getElementById('group-name-input');
    if (!groupNameInput) return;

    const groupName = groupNameInput.value.trim();
    if (!groupName) {
      this.showNotification('Please enter a group name', 'error');
      return;
    }

    if (this.selectedTabs.size === 0) {
      this.showNotification('Please select at least one tab', 'error');
      return;
    }

    try {
      const selectedTabsData = this.currentTabs.filter(tab => this.selectedTabs.has(tab.id));
      
      const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        created: new Date().toISOString(),
        tabs: selectedTabsData.map(tab => ({
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl
        }))
      };

      this.bookmarkGroups.unshift(newGroup);
      
      await chrome.storage.local.set({ bookmarkGroups: this.bookmarkGroups });
      
      // Clear selections and input
      this.selectedTabs.clear();
      groupNameInput.value = '';
      
      this.renderTabs();
      this.renderBookmarkGroups();
      
      this.showNotification(`Group "${groupName}" saved with ${selectedTabsData.length} tabs`, 'success');
    } catch (error) {
      console.error('Error saving bookmark group:', error);
      this.showNotification('Failed to save bookmark group', 'error');
    }
  }

  async openBookmarkGroup(groupId) {
    try {
      const group = this.bookmarkGroups.find(g => g.id === groupId);
      if (!group) return;

      // Open all tabs in the group
      for (const tab of group.tabs) {
        await chrome.tabs.create({
          url: tab.url,
          active: false
        });
      }

      this.showNotification(`Opened ${group.tabs.length} tabs from "${group.name}"`, 'success');
      
      // Refresh the tabs list to show new tabs
      setTimeout(() => {
        this.loadCurrentTabs();
      }, 1000);
    } catch (error) {
      console.error('Error opening bookmark group:', error);
      this.showNotification('Failed to open bookmark group', 'error');
    }
  }

  async deleteBookmarkGroup(groupId) {
    try {
      const group = this.bookmarkGroups.find(g => g.id === groupId);
      if (!group) return;

      if (confirm(`Delete group "${group.name}"? This action cannot be undone.`)) {
        this.bookmarkGroups = this.bookmarkGroups.filter(g => g.id !== groupId);
        await chrome.storage.local.set({ bookmarkGroups: this.bookmarkGroups });
        this.renderBookmarkGroups();
        this.showNotification(`Group "${group.name}" deleted`, 'success');
      }
    } catch (error) {
      console.error('Error deleting bookmark group:', error);
      this.showNotification('Failed to delete bookmark group', 'error');
    }
  }

  showTabbyError(message) {
    const tabsGrid = document.getElementById('tabs-grid');
    if (tabsGrid) {
      tabsGrid.innerHTML = `<div class="empty-tabs" style="color: #ef4444;">${message}</div>`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Weather and Prayer Time Methods
  async initTimeAndWeather() {
    try {
      // Get user's location
      const location = await this.getCurrentLocation();
      
      // Load weather data
      await this.loadWeatherData(location);
      
      // Load prayer times
      await this.loadPrayerTimes(location);
    } catch (error) {
      console.error("Error initializing time and weather:", error);
      this.showWeatherError();
    }
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          // Fallback to IP-based location or default location
          console.warn("Geolocation error:", error);
          resolve({
            latitude: 23.8103, // Default to Dhaka, Bangladesh
            longitude: 90.4125
          });
        }
      );
    });
  }

  async loadWeatherData(location) {
    try {
      // Using OpenWeatherMap API (you'll need to get a free API key)
      const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual API key
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}&units=metric`;
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}`;
      
      // For demo purposes, we'll use mock data if no API key is provided
      if (API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        this.displayMockWeatherData();
        return;
      }
      
      const [weatherResponse, uvResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(uvUrl)
      ]);
      
      if (!weatherResponse.ok || !uvResponse.ok) {
        throw new Error('Weather API request failed');
      }
      
      const weatherData = await weatherResponse.json();
      const uvData = await uvResponse.json();
      
      this.displayWeatherData(weatherData, uvData);
    } catch (error) {
      console.error("Error loading weather data:", error);
      this.displayMockWeatherData();
    }
  }

  displayMockWeatherData() {
    // Mock weather data for demonstration
    document.getElementById('temperature').textContent = '28°C';
    document.getElementById('weatherLocation').textContent = 'Dhaka, Bangladesh';
    document.getElementById('uvIndex').textContent = '7';
    document.getElementById('uvLevel').textContent = 'High';
  }

  displayWeatherData(weatherData, uvData) {
    const temperature = Math.round(weatherData.main.temp);
    const location = `${weatherData.name}, ${weatherData.sys.country}`;
    const uvIndex = Math.round(uvData.value);
    
    document.getElementById('temperature').textContent = `${temperature}°C`;
    document.getElementById('weatherLocation').textContent = location;
    document.getElementById('uvIndex').textContent = uvIndex;
    document.getElementById('uvLevel').textContent = this.getUVLevel(uvIndex);
  }

  getUVLevel(uvIndex) {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  }

  async loadPrayerTimes(location) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      // Using Islamic prayer times API
      const prayerUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${location.latitude}&longitude=${location.longitude}&method=2`;
      
      const response = await fetch(prayerUrl);
      if (!response.ok) {
        throw new Error('Prayer times API request failed');
      }
      
      const data = await response.json();
      this.displayPrayerTimes(data.data.timings);
    } catch (error) {
      console.error("Error loading prayer times:", error);
      this.displayMockPrayerTimes();
    }
  }

  displayMockPrayerTimes() {
    // Mock prayer times for demonstration
    const mockTimes = {
      Fajr: '05:15',
      Sunrise: '06:35',
      Dhuhr: '12:15',
      Asr: '15:45',
      Maghrib: '18:05',
      Isha: '19:25'
    };
    
    this.displayPrayerTimes(mockTimes);
  }

  displayPrayerTimes(timings) {
    const prayerTimes = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const currentTime = new Date();
    
    prayerTimes.forEach(prayer => {
      const prayerElement = document.getElementById(`${prayer.toLowerCase()}-time`);
      if (prayerElement) {
        const timeValue = prayerElement.querySelector('.prayer-time-value');
        if (timeValue) {
          const time24 = timings[prayer];
          const time12 = this.convertTo12Hour(time24);
          timeValue.textContent = time12;
          timeValue.classList.remove('loading');
          
          // Highlight current prayer time
          if (this.isCurrentPrayerTime(time24, currentTime)) {
            prayerElement.classList.add('current');
          }
        }
      }
    });
  }

  convertTo12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  isCurrentPrayerTime(prayerTime, currentTime) {
    const [hours, minutes] = prayerTime.split(':');
    const prayerDate = new Date();
    prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Check if current time is within 30 minutes of prayer time
    const timeDiff = Math.abs(currentTime - prayerDate);
    return timeDiff <= 30 * 60 * 1000; // 30 minutes in milliseconds
  }

  startTimeUpdater() {
    this.updateCurrentTime();
    // Update time every second
    setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
  }

  updateCurrentTime() {
    const now = new Date();
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    
    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
      timeElement.classList.remove('loading');
    }
    
    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }
  }

  showWeatherError() {
    document.getElementById('temperature').textContent = 'Error';
    document.getElementById('temperature').classList.add('error');
    document.getElementById('weatherLocation').textContent = 'Unable to load weather';
    document.getElementById('uvIndex').textContent = 'N/A';
    document.getElementById('uvLevel').textContent = 'Error';
    
    // Show error for prayer times too
    const prayerTimes = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    prayerTimes.forEach(prayer => {
      const element = document.getElementById(`${prayer}-time`);
      if (element) {
        const timeValue = element.querySelector('.prayer-time-value');
        if (timeValue) {
          timeValue.textContent = 'Error';
          timeValue.classList.add('error');
        }
      }
    });
  }
}

// Initialize the todo app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.todoApp = new TodoApp();
});

// Add some keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K to focus on input
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    document.getElementById("todoInput").focus();
  }

  // Ctrl/Cmd + B to switch to blocked sites tab
  if ((e.ctrlKey || e.metaKey) && e.key === "b") {
    e.preventDefault();
    if (window.todoApp) {
      window.todoApp.switchTab("blocked");
    }
  }

  // Ctrl/Cmd + T to switch to todos tab
  if ((e.ctrlKey || e.metaKey) && e.key === "t") {
    e.preventDefault();
    if (window.todoApp) {
      window.todoApp.switchTab("todos");
    }
  }
});
