'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Image from 'next/image';

interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
  width?: number;
  height?: number;
}

export function ParallaxImage({
  src,
  alt,
  speed = 0.1,
  className,
  fill = false,
  priority = false,
  sizes,
  unoptimized = false,
  width,
  height,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isVisible = useRef(false);
  const [inView, setInView] = useState(false);

  const updatePosition = useCallback(() => {
    if (!isVisible.current || !imageRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const offset = elementCenter - viewportCenter;

    imageRef.current.style.transform = `translateY(${offset * speed}px)`;
  }, [speed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.current = entry.isIntersecting;
          setInView(entry.isIntersecting);

          if (entry.isIntersecting) {
            // Start RAF loop
            const loop = () => {
              updatePosition();
              rafRef.current = requestAnimationFrame(loop);
            };
            rafRef.current = requestAnimationFrame(loop);
          } else {
            // Stop RAF loop
            if (rafRef.current) {
              cancelAnimationFrame(rafRef.current);
              rafRef.current = 0;
            }
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [updatePosition]);

  // Also listen to scroll events for smoother updates
  useEffect(() => {
    if (!inView) return;

    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [inView, updatePosition]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      <div
        ref={imageRef}
        style={{
          willChange: 'transform',
          ...(fill
            ? { position: 'absolute', inset: '-10% 0', width: '100%', height: '120%' }
            : {}),
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          priority={priority}
          sizes={sizes}
          unoptimized={unoptimized}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          style={fill ? { objectFit: 'cover' } : undefined}
        />
      </div>
    </div>
  );
}
