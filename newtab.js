// Todo List New Tab Script

class TodoApp {
  constructor() {
    this.todos = [];
    this.blockedSites = [];
    this.init();
  }

  async init() {
    await this.loadTodos();
    await this.loadBlockedSites();
    this.setupEventListeners();
    this.render();
    this.renderBlockedSites();
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

    // Clear existing items
    todoList.innerHTML = "";

    if (this.todos.length === 0) {
      emptyState.style.display = "block";
      todoList.style.display = "none";
    } else {
      emptyState.style.display = "none";
      todoList.style.display = "block";

      this.todos.forEach((todo) => {
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
