# Chrome Extension Project - Technical Documentation for LLMs

## Project Overview

This is a Chrome Extension (Manifest V3) that provides a productivity-focused new tab page with todo management and website blocking capabilities. The extension is designed to help users stay focused and organized by managing their tasks and blocking distracting websites.

## Core Architecture

### Extension Structure

```
chrome-extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── newtab.html            # New tab page HTML
├── newtab.js              # New tab page JavaScript
├── content.js             # Content script for website blocking
├── background.js          # Service worker for background tasks
├── popup.html             # Extension popup HTML
├── popup.js               # Extension popup JavaScript
├── options.html           # Options page HTML
├── options.js             # Options page JavaScript
├── style.css              # Global styles
├── icons/                 # Extension icons
│   └── icon.png
└── assets/                # Assets directory
    └── quotes.json        # Motivational quotes (if used)
```

### Key Components

#### 1. New Tab Override (`newtab.html` + `newtab.js`)

- **Purpose**: Replaces Chrome's default new tab page with a productivity hub
- **Features**:
  - Tabbed interface with two main sections:
    - 📝 Todos: Task management system
    - 🚫 Blocked Sites: Website blocking management
  - Real-time data persistence using Chrome Storage API
  - Export/import functionality for blocked sites
  - Statistics display for both todos and blocked sites

#### 2. Content Script (`content.js`)

- **Purpose**: Injected into all websites to implement blocking functionality
- **Functionality**:
  - Checks if current website is in blocked sites list
  - Displays full-screen block page for blocked sites
  - Listens for real-time updates to blocked sites list
  - Prevents navigation away from block page
  - Provides "Go Back" and "Open Productivity Hub" options

#### 3. Service Worker (`background.js`)

- **Purpose**: Handles background tasks and inter-component communication
- **Responsibilities**:
  - Message passing between components
  - Tab management for opening new tabs
  - Storage management coordination
  - Profile management (legacy from original FocusGuard functionality)

#### 4. Popup (`popup.html` + `popup.js`)

- **Purpose**: Extension popup accessible from Chrome toolbar
- **Features**:
  - Profile management system
  - Quick access to extension settings
  - Profile activation/deactivation

## Data Models

### Todo Object Structure

```javascript
{
  id: string,          // Unique identifier (timestamp)
  text: string,        // Todo text content
  completed: boolean,  // Completion status
  createdAt: string   // ISO timestamp of creation
}
```

### Storage Schema

```javascript
{
  todos: Todo[],              // Array of todo objects
  blockedSites: string[],     // Array of blocked domain names
  profiles: {                 // Legacy profile system
    [profileName]: {
      blockedSites: string[],
      dailyLimitMinutes: number,
      slackNotification: boolean,
      motivationalQuotes: boolean
    }
  },
  activeProfile: string       // Currently active profile name
}
```

## Technical Implementation Details

### 1. TodoApp Class (newtab.js)

Main application class that handles:

- Data loading/saving from Chrome Storage
- UI rendering and event handling
- Tab switching between todos and blocked sites
- CRUD operations for todos and blocked sites
- Export/import functionality

Key Methods:

- `init()`: Initializes app, loads data, sets up event listeners
- `loadTodos()`, `loadBlockedSites()`: Load data from storage
- `saveTodos()`, `saveBlockedSites()`: Save data to storage
- `render()`, `renderBlockedSites()`: Update UI with current data
- `addTodo()`, `toggleTodo()`, `deleteTodo()`: Todo management
- `blockSite()`, `unblockSite()`: Website blocking management
- `switchTab()`: Handle tab switching in UI
- `notifyTabsOfBlockedSitesUpdate()`: Real-time updates to all tabs

### 2. Website Blocking System

The blocking system works through:

1. **URL Normalization**: Clean URLs by removing protocols, www, paths
2. **Real-time Checking**: Content script checks current site against blocked list
3. **Block Page Display**: Full-screen overlay prevents access to blocked sites
4. **Dynamic Updates**: Changes to blocked sites list propagate to all open tabs immediately

### 3. Content Security Policy Compliance

All inline event handlers have been removed and replaced with proper event listeners to comply with Chrome Extension CSP requirements.

## Message Passing Architecture

### Background Script Messages

- `GET_ACTIVE_PROFILE`: Retrieve current active profile
- `openNewTab`: Open new tab from blocked page
- `getBlockedSites`: Get current blocked sites list

### Content Script Messages

- `updateBlockedSites`: Update blocked sites list in real-time

## Chrome APIs Used

### Storage API

- `chrome.storage.local.get()`: Retrieve data
- `chrome.storage.local.set()`: Store data

### Tabs API

- `chrome.tabs.query()`: Get all open tabs
- `chrome.tabs.sendMessage()`: Send messages to content scripts
- `chrome.tabs.create()`: Create new tabs

### Runtime API

- `chrome.runtime.onMessage`: Message listener
- `chrome.runtime.sendMessage()`: Send messages

## UI/UX Design

### Visual Design

- Modern gradient background with glass-morphism effects
- Responsive design that works on various screen sizes
- Smooth animations and hover effects
- Color scheme: Blue gradient (#667eea to #764ba2)

### User Experience

- Tabbed interface for easy navigation
- Keyboard shortcuts (Ctrl/Cmd + T for todos, Ctrl/Cmd + B for blocked sites)
- Auto-focus on input fields
- Real-time updates without page refresh
- Clear visual feedback for actions

## Error Handling

- Try-catch blocks around all async operations
- Graceful fallbacks for missing data
- Silent error handling for cross-origin tab messaging
- User-friendly error messages for import/export operations

## Security Considerations

- Content Security Policy compliant
- No inline JavaScript execution
- Proper event listener binding
- Input sanitization with HTML escaping
- Secure storage using Chrome's built-in storage API

## Performance Considerations

- Efficient DOM manipulation
- Event delegation where appropriate
- Minimal storage reads/writes
- Debounced updates to prevent excessive operations

## Development Notes

- Uses ES6+ features (classes, async/await, arrow functions)
- Follows modern JavaScript best practices
- Modular code organization
- Comprehensive error handling
- Clean separation of concerns

## Future Extension Points

- Analytics integration
- Slack/Discord notifications
- Time tracking features
- Productivity insights
- Customizable themes
- Backup/sync functionality
- Mobile companion app integration

This documentation provides a comprehensive understanding of the codebase for LLMs to effectively work with and extend the project.
