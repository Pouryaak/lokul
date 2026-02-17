# Technology Stack

**Analysis Date:** 2026-02-17

## Languages

**Primary:**
- TypeScript - All application code, type safety across entire codebase
- TSX - React component files

**Secondary:**
- HTML5 - PWA manifest and base template
- CSS3 - Tailwind CSS processing
- SVG - Logo and icon assets (`/Users/poak/Documents/personal-project/Lokul/public/lokul-logo.png`)

## Runtime

**Environment:**
- Browser-based application (Chrome 113+ or Edge 113+)
- WebGPU-capable modern browsers
- No Node.js runtime in production (100% client-side)

**Package Manager:**
- npm (inferred from standard Node.js project structure)
- Lockfile: Not present (scaffolded project state)

## Frameworks

**Core:**
- React 18 - UI framework, component-based architecture
- Vite - Build tool and development server (`/Users/poak/Documents/personal-project/Lokul/vite.config.ts`)
- Tailwind CSS - Utility-first CSS framework (`/Users/poak/Documents/personal-project/Lokul/tailwind.config.ts`)

**AI/ML Infrastructure:**
- WebLLM - Browser-based LLM inference engine (from README tech stack)
- WebGPU - GPU acceleration API for model inference

**Storage:**
- IndexedDB - Client-side database for conversations and data persistence
- Service Workers - Offline support and PWA functionality

**State Management (Planned - per CLAUDE.md):**
- Zustand - Lightweight state management with persistence middleware

**Database (Planned - per CLAUDE.md):**
- Dexie.js - IndexedDB wrapper for easier database operations

## Key Dependencies

**Critical (Inferred from CLAUDE.md and README):**
- `@mlc-ai/web-llm` - WebLLM library for running LLMs in browser
- `react` / `react-dom` - Core React libraries
- `zustand` - State management
- `dexie` - IndexedDB abstraction
- `tailwindcss` - Styling framework

**UI Components (Planned - per CLAUDE.md):**
- shadcn/ui - Headless UI component library
- `class-variance-authority` - Component variant management
- `clsx` / `tailwind-merge` - Class name utilities

**Performance & Experience:**
- Web Workers - For AI inference offloading (`/Users/poak/Documents/personal-project/Lokul/src/workers/inference.worker.ts`)
- Service Workers - PWA and offline support

## Development Tooling

**Linting & Formatting:**
- ESLint 9 - JavaScript/TypeScript linting with flat config (`eslint.config.js`)
  - TypeScript ESLint plugin for type-aware rules
  - React Hooks plugin (rules-of-hooks, exhaustive-deps)
  - React Refresh plugin for Fast Refresh validation
- Prettier 3 - Code formatting with Tailwind CSS plugin
- VS Code workspace settings (`.vscode/settings.json`)
  - Auto-format on save
  - ESLint auto-fix on save
  - Import organization on save

**Build Configuration:**
- `/Users/poak/Documents/personal-project/Lokul/vite.config.ts` - Vite build configuration
- `/Users/poak/Documents/personal-project/Lokul/tsconfig.json` - TypeScript configuration
- `/Users/poak/Documents/personal-project/Lokul/eslint.config.js` - ESLint flat config
- `/Users/poak/Documents/personal-project/Lokul/.prettierrc` - Prettier configuration

**Environment:**
- `/Users/poak/Documents/personal-project/Lokul/.env.example` - Environment variables template (scaffolded, empty)
- No environment variables required for core functionality (privacy-first, no API keys needed)

**PWA Configuration:**
- `/Users/poak/Documents/personal-project/Lokul/public/manifest.json` - PWA manifest with basic configuration
  - Name: "Lokul"
  - Short name: "Lokul"
  - Display mode: standalone
  - Start URL: /

## Platform Requirements

**Development:**
- Node.js 18+ (LTS recommended)
- npm or pnpm
- Modern code editor (VS Code recommended)

**Production (Client Requirements):**
- Chrome 113+ or Edge 113+ (WebGPU support required)
- 4GB+ available RAM (minimum for Quick mode)
- Modern graphics card (integrated or discrete) with WebGPU support
- Storage: Varies by model (80MB - 6.4GB per model)

**Deployment:**
- Static hosting (no server-side processing required)
- HTTPS required for Service Worker and PWA functionality
- CDN recommended for fast model downloads

## Model Specifications

**Supported Models:**
- Quick Mode: ~80MB (lightweight, fast responses)
- Smart Mode: ~2.8GB (comparable to ChatGPT 3.5)
- Genius Mode: ~6.4GB (approaching ChatGPT 4 quality)

**Model Sources:**
- Phi (Microsoft) - MIT License
- Llama (Meta) - Llama License
- Mistral (Mistral AI) - Apache 2.0

---

*Stack analysis: 2026-02-17*
