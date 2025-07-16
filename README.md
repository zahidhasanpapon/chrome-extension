# Productivity Hub Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue.svg)](https://chrome.google.com/webstore)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

A modern Chrome extension that transforms your new tab page into a comprehensive productivity hub. Built with React 18, TypeScript, Tailwind CSS, and shadcn/ui components.

## ✨ Features

### 📝 Todo Management
- Create, complete, and delete tasks with sub-todo support
- Real-time progress tracking and statistics
- Persistent storage across browser sessions
- Clean, intuitive interface

### 🚫 Website Blocking
- Block distracting websites instantly
- Smart URL processing and validation
- Beautiful custom block pages with motivational content
- Bulk operations and import/export functionality
- Real-time blocking across all browser tabs

### 📚 Tab Management (Tabby)
- Save groups of tabs as bookmarks
- One-click restoration of tab groups
- Visual tab management with favicons
- Expandable groups with individual tab controls
- Delete individual tabs or entire groups

### 🌤️ Time & Weather Widget
- Real-time clock with date display
- Location-based weather information
- Islamic prayer times (Namaz) with current prayer highlighting
- UV index and safety recommendations

### 🎨 Modern Interface
- Glass-morphism design with gradient backgrounds
- Fully responsive layout
- Smooth animations and transitions
- Dark/light theme support
- Keyboard shortcuts for power users

## 🚀 Quick Start

### Installation

1. **Download the Extension**
   ```bash
   git clone https://github.com/yourusername/productivity-hub-extension.git
   cd productivity-hub-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `dist` folder
   - The extension is now installed and ready to use

### Usage

1. **Open a new tab** to see your Productivity Hub
2. **Add todos** in the Todos section
3. **Block websites** by adding URLs to the Blocked Sites section
4. **Manage tabs** using the Tabby feature
5. **View time and weather** in the widget

## 🛠️ Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Chrome browser

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/productivity-hub-extension.git
cd productivity-hub-extension

# Install dependencies
npm install

# Start development with watch mode
npm run build:watch

# In another terminal, start the dev server (optional, for component testing)
npm run dev
```

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── TodoList.tsx    # Todo management
│   ├── TabbyManager.tsx # Tab management
│   ├── BlockedSitesList.tsx # Website blocking
│   └── TimeWeatherWidget.tsx # Clock & weather
├── newtab/             # New tab page
├── popup/              # Extension popup
├── options/            # Options page
├── background/         # Background service worker
├── content/            # Content script
├── lib/                # Utilities
├── types/              # TypeScript definitions
└── globals.css         # Tailwind styles
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:watch` | Build with watch mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Build Tool**: Vite with Chrome extension plugin
- **Extension**: Manifest V3, Chrome APIs
- **Storage**: Chrome Storage API
- **Icons**: Lucide React

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + T` | Switch to Todos |
| `Ctrl/Cmd + B` | Switch to Blocked Sites |
| `Ctrl/Cmd + M` | Switch to Tabby |
| `Ctrl/Cmd + D` | Toggle theme |
| `Enter` | Add new todo/blocked site |
| `Escape` | Cancel current action |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📋 Roadmap

See our [Roadmap](TODO.md) for planned features and improvements.

### Upcoming Features
- Analytics dashboard
- Cloud synchronization
- Advanced theming
- Mobile companion app

## 🐛 Issues & Support

- **Bug Reports**: [Create an issue](https://github.com/yourusername/productivity-hub-extension/issues)
- **Feature Requests**: [Start a discussion](https://github.com/yourusername/productivity-hub-extension/discussions)
- **Documentation**: See our [Installation Guide](INSTALLATION_GUIDE.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Lucide](https://lucide.dev/) for the icon library
- [Vite](https://vitejs.dev/) for the build tool

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/productivity-hub-extension?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/productivity-hub-extension?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/productivity-hub-extension)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/productivity-hub-extension)

---

**Made with ❤️ for productivity enthusiasts**
