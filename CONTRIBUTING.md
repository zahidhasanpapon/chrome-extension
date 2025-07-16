# Contributing to Productivity Hub Chrome Extension

Thank you for your interest in contributing to the Productivity Hub Chrome Extension! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** when available
3. **Provide detailed information** including:
   - Chrome version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check the [roadmap](TODO.md)** to see if it's already planned
2. **Open a discussion** before creating a feature request
3. **Explain the use case** and how it benefits users
4. **Consider implementation complexity** and maintenance burden

## 🛠️ Development Setup

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Chrome browser
- Git

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/productivity-hub-extension.git
   cd productivity-hub-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run build:watch
   ```

4. **Load extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards below
   - Write tests if applicable
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions
- Prefer **functional components** with hooks

### React Components

- Use **functional components** with hooks
- Follow **single responsibility principle**
- Use **TypeScript interfaces** for props
- Implement **proper error boundaries**
- Use **React.memo** for performance when needed

### CSS/Styling

- Use **Tailwind CSS** classes
- Follow **mobile-first** responsive design
- Use **semantic class names**
- Maintain **consistent spacing** (4px, 8px, 16px, 24px, 32px)
- Use **CSS custom properties** for theme values

### File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── feature/         # Feature-specific components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
└── constants/           # Application constants
```

### Naming Conventions

- **Components**: PascalCase (`TodoList.tsx`)
- **Files**: camelCase (`utils.ts`) or kebab-case (`todo-list.css`)
- **Variables**: camelCase (`isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`TodoItem`)

## 🧪 Testing

### Manual Testing

Before submitting a PR, please test:

1. **Core functionality** works as expected
2. **No console errors** in browser dev tools
3. **Responsive design** on different screen sizes
4. **Extension popup** and options page work
5. **Website blocking** functions correctly

### Automated Testing

We encourage adding tests for:

- **Utility functions** in `src/lib/`
- **Custom hooks** in `src/hooks/`
- **Complex components** with business logic

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of the code
- [ ] Comments added for hard-to-understand areas
- [ ] Documentation updated if needed
- [ ] No console errors or warnings
- [ ] Extension loads and functions correctly

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Extension functionality verified

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Additional Notes
Any additional information or context
```

### Review Process

1. **Automated checks** must pass (linting, build)
2. **Manual review** by maintainers
3. **Testing** in development environment
4. **Approval** and merge

## 🎯 Areas for Contribution

### High Priority

- **Bug fixes** and stability improvements
- **Performance optimizations**
- **Accessibility improvements**
- **Test coverage** expansion

### Medium Priority

- **New features** from the roadmap
- **UI/UX improvements**
- **Documentation** enhancements
- **Code refactoring**

### Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`
- `bug`

## 🔧 Chrome Extension Specific Guidelines

### Manifest V3 Compliance

- Use **service workers** instead of background pages
- Follow **content security policy** requirements
- Use **declarative APIs** when possible
- Handle **permission requests** gracefully

### Storage Best Practices

- Use **Chrome Storage API** for persistence
- Implement **data migration** for schema changes
- Handle **storage quota limits**
- Provide **import/export** functionality

### Performance Considerations

- **Minimize bundle size** with code splitting
- **Lazy load** components when possible
- **Debounce** user input and API calls
- **Cache** frequently accessed data

## 📚 Resources

### Documentation

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools

- [Chrome Extension Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Vite Documentation](https://vitejs.dev/guide/)

## 🤔 Questions?

If you have questions about contributing:

1. **Check existing documentation** and issues
2. **Start a discussion** on GitHub
3. **Ask in the issue** you're working on
4. **Contact maintainers** if needed

## 🙏 Recognition

Contributors will be:

- **Listed in the README** acknowledgments
- **Mentioned in release notes** for significant contributions
- **Invited to be maintainers** for consistent, high-quality contributions

Thank you for helping make the Productivity Hub Chrome Extension better for everyone! 🚀