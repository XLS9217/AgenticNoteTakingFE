# Repository Guidelines

## Project Structure & Module Organization
- Source code lives in `src/`.
  - `src/Components/` — reusable UI (e.g., `Background.jsx`, `LiquidGlassDiv.jsx`).
  - `src/Modules/` — feature panels and layout (e.g., `Application.jsx`, `ChatPanel/`).
  - `src/Api/` — HTTP/WebSocket clients (`request.js`, `gateway.js`).
- Assets are in `public/` (e.g., `public/img.png`).
- Entry points: `index.html`, `src/main.jsx`, `src/App.jsx`.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server at `http://localhost:5173`.
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint checks.
Note: Tests are not configured yet; see “Testing Guidelines”.

## Coding Style & Naming Conventions
- JavaScript/JSX with 2‑space indentation; prefer single quotes; include semicolons.
- Components in PascalCase files (e.g., `ChatPanel.jsx`); default export for components to match current code.
- CSS classes use kebab‑case; keep component/module styles in their respective `.css` files.
- Keep network/config in `src/Api/`; avoid hardcoding endpoints in components.

## Testing Guidelines
- No tests currently. When adding tests, use Vitest + React Testing Library.
- Place tests alongside files as `ComponentName.test.jsx` or under `src/__tests__/`.
- Aim to cover rendering, user interactions, and API boundaries.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`.
- Keep PRs focused; include description, linked issues, and screenshots/GIFs for UI changes.
- Update docs when changing scripts, environment variables, or API contracts.

## Security & Configuration Tips
- Externalize endpoints via Vite env vars:
  - `.env`: `VITE_API_BASE_URL=https://api.example.com`
  - `.env`: `VITE_WS_URL=wss://api.example.com/agent/chat_session`
- In `src/Api/request.js` and `gateway.js`, read from `import.meta.env` instead of hardcoding.

## Agent-Specific Instructions
- Prefer minimal, surgical changes; follow existing patterns.
- Avoid running local commands without user approval; focus on code edits.
