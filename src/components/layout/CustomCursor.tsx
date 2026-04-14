'use client';

import { useEffect, useRef } from 'react';

const LERP_FACTOR = 0.15;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const isDesktopRef = useRef(false);

  useEffect(() => {
    // Only render on desktop
    const checkDesktop = () => {
      isDesktopRef.current = window.innerWidth > 768;
      const root = document.documentElement;
      if (isDesktopRef.current) {
        root.style.cursor = 'none';
        // Restore default cursor for inputs
        document.querySelectorAll('input, textarea, select, [contenteditable]').forEach((el) => {
          (el as HTMLElement).style.cursor = 'text';
        });
      } else {
        root.style.cursor = '';
      }
    };

    const animate = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;

      if (!dot || !ring) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Dot follows mouse directly
      dot.style.transform = `translate(${posRef.current.x - 4}px, ${posRef.current.y - 4}px)`;

      // Ring follows with lerp (smooth delay)
      ringPosRef.current.x +=
        (posRef.current.x - ringPosRef.current.x) * LERP_FACTOR;
      ringPosRef.current.y +=
        (posRef.current.y - ringPosRef.current.y) * LERP_FACTOR;

      ring.style.transform = `translate(${ringPosRef.current.x - 16}px, ${ringPosRef.current.y - 16}px)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    checkDesktop();

    const handleResize = () => {
      checkDesktop();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDesktopRef.current) return;
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (!isDesktopRef.current) return;
      const target = e.target as HTMLElement;
      if (target.closest('.cursor-hover') || target.closest('a') || target.closest('button')) {
        ringRef.current?.classList.add('hover');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!isDesktopRef.current) return;
      const target = e.target as HTMLElement;
      if (target.closest('.cursor-hover') || target.closest('a') || target.closest('button')) {
        ringRef.current?.classList.remove('hover');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('resize', handleResize);

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Don't render anything if SSR or initial check
  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring hidden md:block" aria-hidden="true" />
    </>
  );
}
