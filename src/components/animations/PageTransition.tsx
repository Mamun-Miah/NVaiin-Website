'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Custom easing curves
const EASE_IN_OUT_CIRC = [0.85, 0, 0.15, 1];
const EASE_OUT_QUART = [0.25, 0.46, 0.45, 0.94];

/**
 * Clip-path wipe overlay that sweeps across the screen on route changes.
 * Wipes in from right, then out to the right, creating a cinematic reveal.
 */
function TransitionOverlay() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'wipeIn' | 'wipeOut'>('idle');
  const prevPathname = useRef(pathname);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Compute derived state during render
  const isTransitioning = phase !== 'idle';
  const direction: 'in' | 'out' = phase === 'wipeOut' ? 'out' : 'in';

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;

      // Clear any pending timers from previous transition
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      // Schedule transition phases via callbacks (not synchronous setState)
      const startTimer = setTimeout(() => {
        setPhase('wipeIn');
      }, 0);
      const wipeOutTimer = setTimeout(() => {
        setPhase('wipeOut');
      }, 400);
      const endTimer = setTimeout(() => {
        setPhase('idle');
      }, 900);

      timersRef.current = [startTimer, wipeOutTimer, endTimer];

      return () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
      };
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key={`overlay-${direction}`}
          className="fixed inset-0 z-[9998] pointer-events-none"
          initial={{
            clipPath: direction === 'in' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 0)',
          }}
          animate={{
            clipPath: direction === 'in' ? 'inset(0 0% 0 0)' : 'inset(0 0 0 100%)',
          }}
          exit={{
            clipPath: direction === 'out' ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0)',
          }}
          transition={{
            duration: direction === 'in' ? 0.45 : 0.4,
            ease: EASE_IN_OUT_CIRC,
          }}
        >
          {/* Gold overlay with subtle gradient */}
          <div className="absolute inset-0 bg-nv-gold" />
          {/* Inner shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-nv-gold/90 via-nv-gold to-nv-gold/80" />
          {/* Subtle grain texture on overlay */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Wraps page content with a fade + slide-up enter animation.
 * Resets animation on each route change for a fresh entrance effect.
 */
function PageContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animationKey, setAnimationKey] = useState(`initial-${pathname}`);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setAnimationKey(`page-${pathname}-${Date.now()}`);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <motion.div
      key={animationKey}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: EASE_OUT_QUART,
        delay: 0.05,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Complete page transition system for N'VAIIN.
 *
 * Provides:
 * - A gold clip-path wipe overlay that sweeps across the screen during route changes
 * - A subtle fade + slide-up animation for page content entering
 *
 * Usage: Wrap {children} in a layout file with this component.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TransitionOverlay />
      <PageContent>{children}</PageContent>
    </>
  );
}
