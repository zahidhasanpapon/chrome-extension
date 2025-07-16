# 🚀 Installation Guide - Modern Productivity Hub

## Quick Setup

### 1. **Load the Extension in Chrome**

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `dist` folder from this project
   - The extension should now appear in your extensions list

### 2. **Verify Installation**

1. **Check Extension Icon**
   - You should see the Productivity Hub icon in your Chrome toolbar

2. **Test New Tab**
   - Open a new tab (Ctrl+T / Cmd+T)
   - You should see the modern Productivity Hub interface

3. **Test Popup**
   - Click the extension icon in the toolbar
   - A popup should appear with quick stats

## 🎯 Features to Test

### **Todo Management**
- ✅ Add new todos
- ✅ Mark todos as complete
- ✅ Delete todos
- ✅ Search todos
- ✅ View statistics

### **Website Blocking**
- ✅ Add sites to block (try: facebook.com, youtube.com)
- ✅ Visit a blocked site to see the block page
- ✅ Remove sites from blocked list

### **Modern UI**
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Glass-morphism effects
- ✅ Tailwind CSS styling
- ✅ shadcn/ui components

## 🔧 Development Mode

### **For Development**
```bash
# Install dependencies
npm install

# Start development with watch mode
npm run build:watch
```

### **After Making Changes**
1. The extension will auto-rebuild with `build:watch`
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Open a new tab to see changes

## 🐛 Troubleshooting

### **Extension Not Loading**
- Make sure you selected the `dist` folder, not the root folder
- Check that `dist/manifest.json` exists
- Verify Developer mode is enabled

### **New Tab Not Changing**
- Refresh the extension in `chrome://extensions/`
- Close all existing tabs and open a new one
- Check browser console for errors (F12)

### **Styles Not Loading**
- Ensure the build completed successfully
- Check that CSS files exist in `dist/assets/`
- Refresh the extension

### **Build Errors**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## 📱 Testing Checklist

### **Basic Functionality**
- [ ] Extension loads without errors
- [ ] New tab shows Productivity Hub
- [ ] Popup opens and shows stats
- [ ] Options page accessible

### **Todo Features**
- [ ] Can add new todos
- [ ] Can mark todos complete
- [ ] Can delete todos
- [ ] Search works
- [ ] Statistics update

### **Blocking Features**
- [ ] Can add sites to block
- [ ] Blocked sites show block page
- [ ] Can remove sites from block list
- [ ] Block page has proper styling

### **UI/UX**
- [ ] Responsive on different screen sizes
- [ ] Animations work smoothly
- [ ] Colors and styling look correct
- [ ] No console errors

## 🎉 Success!

If everything works correctly, you now have a modern, beautiful productivity extension with:

- **React 18** + **TypeScript**
- **Tailwind CSS** styling
- **shadcn/ui** components
- **Modern Chrome Extension** architecture

Enjoy your new productivity hub! 🚀