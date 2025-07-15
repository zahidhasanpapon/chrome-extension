# Productivity Hub - Chrome Extension

A modern Chrome extension that transforms your new tab page into a productivity hub with todo management, website blocking, weather information, prayer times, and powerful bookmark grouping capabilities.

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

- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No external dependencies
- **Chrome Storage API** - For persistent data storage
- **Chrome Tabs API** - For real-time website blocking

### Key Components

- **New Tab Override**: Replaces Chrome's default new tab page
- **Content Script**: Handles website blocking on all pages
- **Service Worker**: Background processing and message handling
- **Popup Interface**: Quick access to extension settings

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
- **Ctrl/Cmd + K** - Focus on todo input field
- **Enter** - Add new todo or blocked site

## 🛠️ Development

### Project Structure

```
chrome-extension/
├── manifest.json          # Extension manifest
├── newtab.html           # New tab page
├── newtab.js             # Main application logic
├── content.js            # Website blocking script
├── background.js         # Service worker
├── popup.html/js         # Extension popup
├── options.html/js       # Options page
├── style.css             # Global styles
└── icons/                # Extension icons
```

### Running in Development

1. Make your changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Open a new tab to test changes

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
