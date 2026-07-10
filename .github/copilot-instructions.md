<!-- Copilot instructions for the Expert2 prototype repo -->
# Copilot / AI Agent Instructions

Purpose: help an AI coding agent be immediately productive in this repository by summarizing the architecture, developer workflows, conventions, and concrete examples.

- **Entry / Build**: install with `npm i` (README). Start dev: `npm run dev` (runs `vite`). Build: `npm run build` (runs `vite build`). Vite is configured in `vite.config.ts`.

- **Path alias**: the repo uses `@` => `src` (see `vite.config.ts`). Prefer imports like `@/app/components/top-header` (examples in `src/app/App.tsx`).

- **Big picture**:
  - Single-page React app (TypeScript/TSX). Entry: `src/main.tsx` -> `src/app/App.tsx`.
  - `App.tsx` orchestrates top-level view state and routes between `ModernHomeView`, `ModernChatInterface`, and `PolicyManagementView` via local React state. Study `App.tsx` to understand data flow for `selectedLaws`, `relatedLaws`, `chatQuery`, and `hasChatMessages`.
  - UI primitives and patterns live under `src/app/components/ui/` (Radix wrappers, toasts, dialogs). Higher-level pages/components are in `src/app/components/`.

- **Key files & directories to inspect**:
  - `src/main.tsx` — app bootstrap
  - `src/app/App.tsx` — top-level orchestrator and example of navigation guard patterns (leave-confirm dialog)
  - `src/app/components/` — feature components like `modern-chat-interface.tsx`, `top-header.tsx`, `law-selection-modal.tsx`
  - `src/app/components/ui/` — shared UI primitives (accordion, alert-dialog, input, form components)
  - `vite.config.ts` — alias and required plugins (React + `@tailwindcss/vite`) — do not remove these plugins
  - `package.json` — scripts and notable dependency list (Radix, MUI, Tailwind, Sonner, Emotion)

- **Patterns & conventions** (concrete, discoverable):
  - UI composition: low-level primitives in `ui/`; higher-level components compose those primitives (e.g., `AlertDialog` variants in `ui/alert-dialog.tsx` used across app).
  - Props‑driven navigation: `App.tsx` passes event handlers (e.g., `onStartChat`, `onOpenLawSelector`) rather than using a router. Follow this when adding new view transitions.
  - Modal state is controlled via boolean `isOpen` props (see `LawSelectionModal`, `EnhancedChatHistoryModal`). Use the same `isOpen` + `onClose` pattern.
  - Toasts use `Toaster` (`src/app/components/ui/sonner`), prefer this over ad-hoc notifications.

- **Build / edit rules**:
  - Preserve `react()` and `tailwindcss()` plugins in `vite.config.ts` — comment in config says they are required.
  - The project uses Tailwind utilities (`src/styles/tailwind.css`, `index.css`). Editing global styles should be done in `src/styles/*`.

- **Dependencies & integrations**:
  - UI libraries: Radix primitives (`@radix-ui/*`), MUI present in deps but many components wrap Radix + custom styles.
  - No obvious server/back-end code in this repo — most flows are front-end state; if adding API calls, add them as new modules under `src/` and document endpoint usage.

- **When changing components**:
  - Update or add exports in the component file next to its name (no central barrel pattern is required). Follow existing casing (kebab for filenames, PascalCase for exports, e.g., `top-header.tsx` exports `TopHeader`).
  - Use the alias `@/` for imports so files remain consistent with existing imports.

- **Debugging / Local testing**:
  - Dev server provides fast HMR: `npm run dev`. Use browser devtools for React/Tailwind debugging. No test runner configured — avoid adding test infra unless requested.

- **Examples** (copy-paste friendly):
  - Import a component using the repo alias: `import { TopHeader } from "@/app/components/top-header";`
  - Add a modal following pattern: accepts `isOpen`, `onClose`, `onConfirm` props and resides in `src/app/components/`.

If anything in the draft is unclear or missing (e.g., preferred package manager, intended backend integration, or CI workflows), tell me which part to expand and I will iterate.
