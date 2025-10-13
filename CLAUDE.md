do not do any npm commends just edit the code for me
do minimum work don't overcomplicate things

# CLAUDE.md - Agentic Note Taking Frontend

This file contains project-specific information to help Claude understand and work with this codebase effectively.

## Project Overview

A React application for meeting note-taking with a liquid glass design aesthetic. Features three-panel layout with transcript, notes, and chat functionality.

## Tech Stack

- **Frontend**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Styling**: CSS with CSS Custom Properties
- **Package Manager**: npm

## Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── Components/          # Reusable UI components
│   ├── Background.jsx   # Background with image overlay
│   ├── LiquidGlassDiv.jsx  # Glass morphism container
│   └── Components.css   # Component-specific styles
├── Modules/             # Main application modules
│   ├── Application.jsx  # Main layout component
│   ├── ChatPanel.jsx    # Chat functionality
│   ├── NotePanel.jsx    # Note-taking interface
│   ├── TranscriptPanel.jsx # Transcription display
│   └── Modules.css      # Module-specific styles
├── App.jsx             # Root application component
├── App.css             # Global application styles
├── index.css           # Base styles and CSS variables
└── main.jsx            # Application entry point
```

## CSS Architecture

### CSS File Organization

- **index.css**: Global styles and CSS custom properties (design tokens)
- **Components.css**: Styles for reusable components
- **Modules.css**: Styles for application modules
- **App.css**: Application-level styles

### CSS Naming Conventions

- Use kebab-case for class names: `.component-name`
- Use BEM-inspired naming: `.component--modifier`
- CSS custom properties use: `--property-name`

### Key CSS Custom Properties

```css
/* Colors */
--color-primary: #646cff;
--color-text-primary: rgba(255, 255, 255, 0.87);
--color-background-dark: #242424;

/* Glass Morphism */
--glass-background: rgba(255, 255, 255, 0.05);
--glass-blur: blur(20px);

/* Spacing */
--spacing-xs: 8px;
--spacing-sm: 16px;
--spacing-md: 24px;
--spacing-lg: 32px;

/* Border Radius */
--border-radius-sm: 8px;
--border-radius-md: 12px;
--border-radius-lg: 20px;

/* Transitions */
--transition-base: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

## Development Guidelines

### Styling

- Use CSS custom properties for consistent theming
- Avoid inline styles - use CSS classes instead
- Follow the established naming conventions
- Maintain responsive design with mobile-first approach

### Component Structure

- Components should be functional components with hooks
- Import CSS files at the top of component files
- Use descriptive class names that reflect component purpose
- Keep components focused and single-responsibility

### Code Quality

- Run `npm run lint` before committing
- Follow React best practices
- Use semantic HTML elements
- Maintain accessibility standards

## Recent Refactoring Changes

1. **Removed inline styles** from Background.jsx and moved to CSS classes
2. **Standardized CSS naming** from camelCase to kebab-case
3. **Added CSS custom properties** for consistent theming
4. **Improved CSS organization** with clear section comments
5. **Updated README** with comprehensive documentation

## Design System

### Layout

- Three-panel layout: 37.5% left, 37.5% right, 25% chat
- Fixed positioning for main application container
- Flexbox-based responsive design

### Glass Morphism Effects

- Translucent backgrounds with backdrop blur
- Subtle borders and sophisticated shadows
- Smooth hover transitions with scale and translate effects
- Responsive adjustments for mobile devices

### Responsive Breakpoints

- Desktop: 768px and above (default)
- Mobile: max-width: 768px

## Notes for Future Development

- The project uses modern React 19 features
- Vite provides fast development experience
- CSS custom properties enable easy theme customization
- Glass morphism effects are implemented with backdrop-filter
- The application supports automatic light/dark theme detection