# Implementation Plan: Convert to React App

## Objective

Convert the existing vanilla TypeScript Vite project in `apps/website` into a React application using Tailwind CSS and integrate the provided `App` component.

## Scope & Context

- Add React and DOM libraries (`react`, `react-dom`).
- Add styling and icon libraries (`tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`).
- Configure Vite, TypeScript, and Tailwind.
- Substitute the vanilla entry files with React equivalents.

## Implementation Steps

### 1. Update Dependencies

Modify `apps/website/package.json` to include:

- `dependencies`: `react`, `react-dom`, `lucide-react`
- `devDependencies`: `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`

### 2. Configure Build & Styling Tools

- Create `apps/website/vite.config.ts` enabling `@vitejs/plugin-react`.
- Create `apps/website/tailwind.config.js` to process paths within `src/**/*.{js,ts,jsx,tsx}`.
- Create `apps/website/postcss.config.js` to enable Tailwind and Autoprefixer.
- Update `apps/website/tsconfig.json` to add `"jsx": "react-jsx"` to compilerOptions.
- Replace `apps/website/src/style.css` content with Tailwind base directives.

### 3. Create React Source Code

- Write the user-provided code into `apps/website/src/App.tsx`.
- Create `apps/website/src/main.tsx` to render `<App />` using React DOM to the `#app` element.

### 4. Cleanup & Entry Updates

- Update `apps/website/index.html` to point the script tag to `/src/main.tsx`.
- Remove the obsolete vanilla files: `apps/website/src/main.ts` and `apps/website/src/counter.ts`.

## Verification & Testing

- Run `pnpm install` in the root (or `apps/website`) to link and download new dependencies.
- Run `npm run build` or `pnpm run build` inside `apps/website` to verify build succeeds.
- Verify the new React application displays properly in the browser (by running `pnpm run dev` and visually confirming).
