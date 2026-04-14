'use client';

import { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  as?: keyof JSX.IntrinsicElements;
  springBackDuration?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  as: Tag = 'button',
  springBackDuration = 0.8,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const isHovering = useRef(false);
  const animRef = useRef<gsap.core.Tween | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      isHovering.current = true;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) * strength;
      const dy = (e.clientY - centerY) * strength;

      if (animRef.current) {
        animRef.current.kill();
      }

      gsap.set(el, {
        x: dx,
        y: dy,
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    isHovering.current = false;

    if (animRef.current) {
      animRef.current.kill();
    }

    animRef.current = gsap.to(el, {
      x: 0,
      y: 0,
      duration: springBackDuration,
      ease: 'elastic.out(1, 0.3)',
    });
  }, [springBackDuration]);

  useEffect(() => {
    return () => {
      if (animRef.current) {
        animRef.current.kill();
        animRef.current = null;
      }
    };
  }, []);

  const Element = Tag as React.ElementType;

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: 'transform' }}
    >
      {children}
    </Element>
  );
}
