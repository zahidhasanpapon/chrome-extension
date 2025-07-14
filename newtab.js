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
      this.todos = [];
    }
  }

  async loadBlockedSites() {
    try {
      const result = await chrome.storage.local.get(["blockedSites"]);
      this.blockedSites = result.blockedSites || [];
    } catch (error) {
      console.error("Error loading blocked sites:", error);
      this.blockedSites = [];
    }
  }

  async saveTodos() {
    try {
      await chrome.storage.local.set({ todos: this.todos });
    } catch (error) {
      console.error("Error saving todos:", error);
    }
  }

  async saveBlockedSites() {
    try {
      await chrome.storage.local.set({ blockedSites: this.blockedSites });
      // Notify all tabs about the updated blocked sites
      this.notifyTabsOfBlockedSitesUpdate();
    } catch (error) {
      console.error("Error saving blocked sites:", error);
    }
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
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
    this.saveTodos();
    this.render();
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
      return;
    }

    // Clean up URL - remove protocol and www, extract domain
    const cleanUrl = this.cleanUrl(url);

    if (this.blockedSites.includes(cleanUrl)) {
      alert("This site is already blocked!");
      blockedSiteInput.value = "";
      blockedSiteInput.focus();
      return;
    }

    this.blockedSites.push(cleanUrl);
    blockedSiteInput.value = "";
    blockedSiteInput.focus();

    this.saveBlockedSites();
    this.renderBlockedSites();
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
    const dataStr = JSON.stringify(this.blockedSites, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "blocked-sites.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }

  importBlockedSites() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSites = JSON.parse(e.target.result);
            if (Array.isArray(importedSites)) {
              // Merge with existing sites, avoiding duplicates
              const newSites = importedSites.filter(
                (site) => !this.blockedSites.includes(site)
              );
              this.blockedSites = [...this.blockedSites, ...newSites];
              this.saveBlockedSites();
              this.renderBlockedSites();
              alert(
                `Successfully imported ${newSites.length} new blocked sites!`
              );
            } else {
              alert("Invalid file format. Please select a valid JSON file.");
            }
          } catch (error) {
            alert(
              "Error reading file. Please make sure it's a valid JSON file."
            );
          }
        };
        reader.readAsText(file);
      }
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
