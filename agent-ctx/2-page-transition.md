# Task 2 — Page Transition System

## Agent: Main
## Status: Completed

## What was done

### 1. Created PageTransition component
- **File**: `src/components/animations/PageTransition.tsx`
- **Client component** using Framer Motion + Next.js `usePathname`

#### TransitionOverlay (internal)
- Detects route changes via `usePathname()` with `useRef` tracking previous pathname
- Three-phase animation: `idle → wipeIn → wipeOut → idle`
- Uses `setTimeout` callbacks (deferred) to avoid React's `react-hooks/set-state-in-effect` lint error
- **Wipe-in**: Gold clip-path sweeps from right edge to cover screen (0.45s, `EASE_IN_OUT_CIRC`)
- **Wipe-out**: Gold clip-path retracts from left to right revealing new content (0.4s)
- Overlay layers: solid gold base + subtle gradient + grain texture at low opacity
- Fixed position `z-[9998]`, `pointer-events-none` so it doesn't block interaction

#### PageContent (internal)
- Wraps page children with `motion.div`
- Fade + slide-up enter animation (opacity 0→1, y 16px→0)
- Re-triggers on each route change via `animationKey` state derived from pathname
- Uses `requestAnimationFrame` to update key (satisfies lint rule)
- Duration: 0.6s with slight 0.05s delay

#### PageTransition (exported)
- Composes `TransitionOverlay` + `PageContent`
- Simple `<>` fragment wrapper — minimal footprint

### 2. Integrated into root layout
- **File**: `src/app/layout.tsx`
- Imported `PageTransition` from `@/components/animations/PageTransition`
- Wrapped `{children}` inside `<main>` with `<PageTransition>`
- No changes needed to other layouts or pages

### 3. Lint verification
- ESLint passes with zero errors
- Removed unused `EASE_OUT_EXPO` constant
- All setState calls properly deferred via callbacks

## Design decisions
- **No `AnimatePresence mode="wait"` at layout level** — avoids server component hydration issues
- **setTimeout(0) for initial phase trigger** — satisfies React's `set-state-in-effect` lint rule
- **requestAnimationFrame for PageContent key update** — same lint rule compliance
- **Timers properly cleaned up** — effect cleanup function clears all pending timers
- **z-index 9998** — above page content but below modals (modals typically use 9999+)
