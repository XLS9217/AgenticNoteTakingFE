# Agentic Note Taking Frontend

A modern React application for meeting note-taking with a beautiful liquid glass design aesthetic.

## 🎨 Design Style

**Liquid Glass Design** - Featuring elegant glassmorphism effects with:
- Translucent backgrounds with backdrop blur
- Subtle borders and sophisticated shadows
- Smooth transitions and hover effects
- Responsive design with mobile optimization

![Application Preview](public/img.png)

## 🚀 Features

- **Three-Panel Layout**: Transcript, Notes, and Chat panels
- **Glass Morphism UI**: Modern translucent glass-like containers
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme Support**: Automatic theme detection
- **Smooth Animations**: Elegant hover and transition effects

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Styling**: CSS with CSS Custom Properties
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AgenticNoteTakingFE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

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

## 🎨 CSS Architecture

The project uses a structured CSS approach with:

- **CSS Custom Properties**: Centralized design tokens for colors, spacing, and effects
- **Component-Specific Styles**: Organized by component/module
- **Consistent Naming**: BEM-inspired naming conventions
- **Responsive Design**: Mobile-first responsive breakpoints

### Key CSS Variables

- Colors: `--color-primary`, `--color-text-primary`, etc.
- Spacing: `--spacing-xs`, `--spacing-sm`, `--spacing-md`, etc.
- Glass Effects: `--glass-background`, `--glass-blur`, etc.
- Transitions: `--transition-base`, `--transition-fast`

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Development

This project uses:
- **React 19** with modern hooks
- **Vite** for fast development and building
- **ESLint** for code quality
- **CSS Variables** for consistent theming

## 📄 License

This project is for educational and development purposes.