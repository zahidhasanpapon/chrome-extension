# Productivity Hub - Chrome Extension

A feature-rich Chrome extension built with **React 18**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** that transforms your new tab page into a comprehensive productivity hub with advanced todo management, smart website blocking, time & weather integration, and powerful tab management capabilities.

## 🚀 Features

### 📝 Todo Management

- **Add & Manage Tasks**: Create, complete, and delete todos with a clean interface
- **Real-time Statistics**: Track total, completed, and pending tasks
- **Persistent Storage**: Your todos are saved automatically and persist across browser sessions
- **Keyboard Shortcuts**: Use Ctrl/Cmd + T to quickly access todos

### 🚫 Website Blocking

- **Block Distracting Sites**: Add websites to your blocked list to stay focused
- **Smart URL Processing**: Automatically cleans URLs (removes www, protocols, paths)
- **Real-time Blocking**: Sites are blocked immediately across all browser tabs
- **Beautiful Block Page**: Instead of errors, see a motivational block page with options
- **Export/Import**: Share your blocked sites list or backup your settings

### 🌤️ Weather & Time Information

- **Real-time Clock**: Current time with seconds and full date display
- **Weather Data**: Current temperature and location-based weather information
- **UV Index**: Safety level indicators (Low, Moderate, High, Very High, Extreme)
- **Automatic Location**: Uses geolocation with graceful fallbacks

### 🕌 Islamic Prayer Times (Namaz)

- **5 Daily Prayers**: Fajr, Dhuhr, Asr, Maghrib, Isha plus Sunrise
- **Current Prayer Highlighting**: Shows which prayer time is active
- **Location-based Calculation**: Uses GPS for accurate prayer times
- **Multiple Calculation Methods**: ISNA, MWL, Karachi, and more

### 📚 Tabby - Bookmark Groups

- **Smart Tab Management**: View and select from all open tabs
- **Bookmark Groups**: Save selected tabs as named groups
- **One-Click Actions**: Save multiple tabs or open entire groups instantly
- **Group Management**: View, open, and delete saved bookmark groups
- **Persistent Storage**: Groups saved locally and persist across sessions
- **Visual Interface**: Clean design with favicons, titles, and metadata

### 🎨 Modern Interface

- **Tabbed Design**: Easy switching between todos and blocked sites
- **Glass-morphism UI**: Modern design with gradient backgrounds and blur effects
- **Responsive Layout**: Works beautifully on all screen sizes
- **Smooth Animations**: Polished interactions with hover effects and transitions

## 📦 Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and ready to use

### Usage

1. Open a new tab to see your Productivity Hub
2. **Add Todos**: Click the "📝 Todos" tab and start adding tasks
3. **Block Websites**: Click the "🚫 Blocked Sites" tab and enter site URLs
4. **Manage Settings**: Use the extension popup from the Chrome toolbar

## 🔧 Technical Details

### Built With

- **React 18** - Modern React with hooks and TypeScript
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework with custom theme
- **shadcn/ui** - High-quality component library
- **Vite** - Fast build tool with Chrome extension plugin
- **Manifest V3** - Latest Chrome extension standard
- **Chrome Storage API** - For persistent data storage
- **Chrome Tabs API** - For real-time website blocking and tab management

### Key Components

- **ProductivityHub** - Main React app with tabbed interface
- **TodoList** - Advanced todo management with sub-tasks
- **TabbyManager** - Browser tab and bookmark management
- **TimeWeatherWidget** - Real-time clock, weather, and prayer times
- **QuickShortcuts** - One-click block/unblock buttons
- **BlockedSitesList** - Smart website blocking with bulk operations
- **Content Script** - TypeScript-based website blocking
- **Background Service Worker** - Modern message handling and storage

## 🎯 How It Works

### Todo System

1. Enter your task in the input field
2. Press Enter or click "Add Task"
3. Mark tasks as complete or delete them
4. View your progress in the statistics panel

### Website Blocking

1. Enter a website URL (e.g., `facebook.com`, `youtube.com`)
2. Click "Block Site" to add it to your blocked list
3. When you visit a blocked site, you'll see a block page instead
4. Use the "🔓 Unblock" button to remove sites from your blocked list

### Weather & Prayer Times

1. Allow location access when prompted (or use default location)
2. Weather information and prayer times load automatically
3. Times update in real-time throughout the day
4. Mock data is shown if APIs are unavailable

### Tabby - Bookmark Groups

1. **Creating Groups**:

   - Click the extension icon to open popup
   - Review current tabs and select desired ones
   - Enter a descriptive group name
   - Click "Save Selected" to create the group

2. **Opening Groups**:

   - Open the extension popup
   - Find your group in the "Saved Groups" section
   - Click "Open" to launch all tabs from the group

3. **Managing Groups**:
   - View all saved groups with metadata
   - Delete groups with confirmation
   - Groups are automatically sorted by creation date

### Export/Import

- **Export**: Download your blocked sites as a JSON file
- **Import**: Upload a JSON file to add multiple blocked sites at once

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + T** - Switch to todos tab
- **Ctrl/Cmd + B** - Switch to blocked sites tab
- **Ctrl/Cmd + S** - Switch to statistics tab
- **Ctrl/Cmd + M** - Switch to Tabby (tab manager) tab
- **Ctrl/Cmd + D** - Toggle dark/light theme
- **Ctrl/Cmd + K** - Focus on search input field
- **ESC** - Clear search/cancel current action
- **Enter** - Add new todo or blocked site

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components (Button, Card, Input, etc.)
│   ├── TodoList.tsx    # Advanced todo management with sub-tasks
│   ├── TabbyManager.tsx # Browser tab and bookmark management
│   ├── TimeWeatherWidget.tsx # Clock, weather, and prayer times
│   ├── QuickShortcuts.tsx # One-click block/unblock buttons
│   ├── BlockedSitesList.tsx # Website blocking with bulk operations
│   └── StatsCards.tsx  # Productivity statistics display
├── newtab/             # New tab page React app
│   ├── index.html      # HTML entry point
│   ├── index.tsx       # React root
│   └── ProductivityHub.tsx # Main app component
├── popup/              # Extension popup React app
│   ├── index.html
│   ├── index.tsx
│   └── PopupApp.tsx
├── options/            # Options page React app
│   ├── index.html
│   ├── index.tsx
│   └── OptionsApp.tsx
├── background/         # Background service worker
│   └── index.ts        # TypeScript background script
├── content/            # Content script for website blocking
│   └── index.ts        # TypeScript content script
├── lib/                # Utility functions
│   └── utils.ts        # Storage management and helpers
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
├── globals.css         # Tailwind CSS with custom styles
└── manifest.json       # Chrome extension manifest
```

### Development Scripts

```bash
# Install dependencies
npm install

# Development server (for testing components)
npm run dev

# Build for production
npm run build

# Watch mode for extension development
npm run build:watch

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Running in Development

1. Install dependencies: `npm install`
2. Build the extension: `npm run build` or `npm run build:watch`
3. Go to `chrome://extensions/`
4. Enable "Developer mode" and click "Load unpacked"
5. Select the `dist` folder
6. Make changes and refresh the extension to test

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Issues & Support

If you encounter any issues or have suggestions for improvements:

1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

## 🔮 Future Features

See [TODO.md](TODO.md) for planned features and improvements.

---

**Made with ❤️ for productivity enthusiasts**
