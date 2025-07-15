# 🚀 Productivity Hub Chrome Extension

A modern Chrome extension that transforms your new tab into a productivity hub with todo management and website blocking capabilities. Built with React 19, TypeScript 5.7, and Tailwind CSS 4.

## ✨ Features

### 🎯 Core Functionality
- **New Tab Productivity Hub**: Replace boring new tabs with a feature-rich productivity dashboard
- **Todo Management**: Create, edit, complete, and organize todos with priority levels
- **Website Blocking**: Block distracting websites to maintain focus
- **Chrome Storage Sync**: Data syncs across all your Chrome devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing

### 🛠️ Technical Features
- **Modern Tech Stack**: React 19, TypeScript 5.7, Vite 7, Tailwind CSS 4
- **Chrome Extension API**: Full Manifest V3 compliance
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Framer Motion for delightful interactions
- **Data Export/Import**: Backup and restore your productivity data
- **Type Safety**: Full TypeScript coverage for robust development

### 🎨 User Interface
- **Clean Design**: Modern, minimalist interface with Tailwind CSS
- **Intuitive Navigation**: Tab-based interface for easy access
- **Real-time Stats**: Track completion rates and productivity metrics
- **Quick Actions**: Popup interface for rapid todo management
- **Customizable**: Theme settings and preferences in options page

## 🏗️ Project Structure

```
src/
├── background/          # Service worker for Chrome extension
├── components/          # Reusable React components
├── content/            # Content script for website blocking
├── hooks/              # Custom React hooks
├── newtab/             # New tab page components
├── options/            # Extension options page
├── popup/              # Extension popup interface
└── shared/             # Shared utilities and types
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (tested with Node.js 22)
- Chrome browser for testing

### Development Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```

### Loading in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from your project
5. The extension will now appear in Chrome

## 📋 Usage

### New Tab Page
- **Add Todos**: Use the input field to create new todos with priority levels
- **Manage Todos**: Check off completed tasks, edit existing ones, or delete them
- **Filter & Search**: Find specific todos using search and priority filters
- **Block Sites**: Add websites to your blocked list to avoid distractions
- **View Stats**: Monitor your productivity with real-time statistics

### Popup Interface
- **Quick Add**: Rapidly add todos without opening the full interface
- **Stats Overview**: See completion rates and pending tasks at a glance
- **Full App Access**: Click to open the complete productivity hub

### Options Page
- **Theme Settings**: Switch between light and dark modes
- **Data Management**: Export/import your productivity data
- **Preferences**: Configure notifications and auto-backup options

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server (requires Node.js 18+)
- `npm run build` - Build production extension
- `npm run build:watch` - Build with file watching
- `npm run type-check` - Run TypeScript compiler checks
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

### Technology Stack
- **Frontend**: React 19 with TypeScript 5.7
- **Build Tool**: Vite 7 with CRX plugin
- **Styling**: Tailwind CSS 4 with custom components
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography
- **Storage**: Chrome Storage API for data persistence

## 🎯 Key Components

### ProductivityHub (New Tab)
The main interface featuring:
- Statistics cards showing productivity metrics
- Tab navigation between todos and blocked sites
- Real-time updates and smooth animations
- Responsive design for all screen sizes

### PopupApp (Extension Popup)
Quick access interface with:
- Condensed todo management
- Productivity statistics
- Direct link to full application

### OptionsApp (Settings Page)
Configuration interface for:
- Theme preferences
- Data export/import functionality
- Extension settings and preferences

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally using Chrome's storage API
- **No External Servers**: No data is sent to external servers
- **Secure Content Scripts**: Website blocking uses secure content script injection
- **Manifest V3**: Built with the latest Chrome extension security standards

## 🐛 Troubleshooting

### Common Issues
1. **Build Errors**: Ensure you're using Node.js 18+ and run `npm install`
2. **Extension Not Loading**: Check that you selected the `dist` folder, not the project root
3. **Dark Mode Issues**: Clear browser cache and reload the extension
4. **Storage Issues**: Check Chrome's storage permissions in `chrome://extensions/`

### Development Notes
- The development server (`npm run dev`) may have issues with Node.js versions
- Production builds work reliably with `npm run build`
- Always test in Chrome after building for production

## 🎨 Customization

The extension is built with customization in mind:
- **Themes**: Easily modify colors in Tailwind configuration
- **Components**: All React components are modular and reusable
- **Features**: Add new productivity features through the modular architecture
- **Styling**: Tailwind CSS makes styling changes straightforward

## 📈 Future Enhancements

Potential features for future versions:
- **Time Tracking**: Track time spent on tasks
- **Goal Setting**: Set and track productivity goals
- **Calendar Integration**: Sync with calendar applications
- **Team Features**: Share productivity metrics with team members
- **Advanced Analytics**: Detailed productivity reports and insights

## 🤝 Contributing

This project was built as a modern Chrome extension showcase. Feel free to:
- Report bugs or suggest improvements
- Fork the project for your own customizations
- Submit pull requests for new features

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using modern web technologies**
