# Productivity Hub - Modern React + Tailwind + shadcn/ui

A modern Chrome extension built with React, TypeScript, Tailwind CSS, and shadcn/ui components that transforms your new tab page into a productivity hub.

## 🚀 Features

### ✨ Modern Tech Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Vite** for fast development and building
- **Chrome Extension Manifest V3**

### 📝 Todo Management
- Create, edit, and delete todos
- Priority levels (High, Medium, Low)
- Search and filter functionality
- Progress tracking and statistics
- Completion rate monitoring

### 🚫 Website Blocking
- Block distracting websites
- Beautiful custom block pages
- Real-time blocking across all tabs
- Import/export blocked sites lists
- Smart URL validation

### 🎨 Modern UI/UX
- Glass-morphism design
- Smooth animations with Framer Motion
- Responsive layout
- Dark/light theme support
- Accessible components

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chrome-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Chrome Extension Setup

1. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

2. **Development Workflow**
   - Run `npm run build:watch` for automatic rebuilds
   - Refresh the extension in Chrome after changes
   - Open a new tab to see your changes

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── TodoList.tsx    # Todo management component
│   ├── BlockedSitesList.tsx # Website blocking component
│   └── StatsCards.tsx  # Statistics display
├── lib/                # Utility functions
│   └── utils.ts        # Common utilities and Chrome API helpers
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
├── newtab/             # New tab page
│   ├── index.html
│   ├── index.tsx
│   └── ProductivityHub.tsx
├── popup/              # Extension popup
│   ├── index.html
│   ├── index.tsx
│   └── PopupApp.tsx
├── options/            # Options page
│   ├── index.html
│   ├── index.tsx
│   └── OptionsApp.tsx
├── background/         # Background script
│   └── index.ts
├── content/            # Content script for blocking
│   └── index.ts
└── globals.css         # Global styles with Tailwind
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`focus-*` colors)
- **Secondary**: Green gradient (`motivate-*` colors)
- **Accent**: Custom productivity theme
- **UI**: shadcn/ui default palette

### Components
All UI components are built with shadcn/ui and customized for the productivity theme:
- `Button` - Multiple variants including gradient styles
- `Card` - Glass-morphism effects
- `Input` - Consistent form styling
- `Badge` - Priority and status indicators

### Animations
- Smooth transitions with Tailwind CSS
- Custom keyframes for productivity-focused interactions
- Hover effects and micro-interactions

## 🔧 Configuration

### Tailwind CSS
The project uses a custom Tailwind configuration with:
- Extended color palette for productivity theme
- Custom animations and keyframes
- Glass-morphism utilities
- shadcn/ui integration

### Vite Configuration
- Chrome extension plugin (`@crxjs/vite-plugin`)
- React plugin for JSX support
- Path aliases (`@/` for `src/`)
- Multi-entry build for different extension pages

### TypeScript
- Strict mode enabled
- Chrome extension types
- Path mapping for clean imports
- Proper type definitions for all components

## 📦 Building and Distribution

### Development Build
```bash
npm run dev          # Start development server
npm run build:watch  # Watch mode for extension development
```

### Production Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Extension Packaging
1. Run `npm run build`
2. The `dist` folder contains the built extension
3. Zip the `dist` folder for Chrome Web Store submission

## 🚀 Deployment

### Chrome Web Store
1. Build the extension: `npm run build`
2. Create a zip file of the `dist` folder
3. Upload to Chrome Web Store Developer Dashboard
4. Fill in store listing details
5. Submit for review

### Local Installation
1. Build the extension: `npm run build`
2. Open `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select `dist` folder

## 🧪 Testing

### Manual Testing
- Test all functionality in development mode
- Verify extension works across different websites
- Test website blocking functionality
- Ensure data persistence works correctly

### Browser Compatibility
- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:watch` - Watch mode for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🔍 Troubleshooting

### Common Issues

1. **Extension not loading**
   - Ensure you've built the project: `npm run build`
   - Check that manifest.json is valid
   - Verify all required files are in dist folder

2. **Styles not applying**
   - Check Tailwind CSS is properly configured
   - Ensure globals.css is imported
   - Verify PostCSS configuration

3. **TypeScript errors**
   - Check tsconfig.json configuration
   - Ensure all types are properly imported
   - Verify Chrome extension types are installed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide React](https://lucide.dev/) for the icon library
- [Vite](https://vitejs.dev/) for the fast build tool