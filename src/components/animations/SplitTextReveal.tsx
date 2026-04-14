'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';

type SplitType = 'chars' | 'words' | 'lines';
type TriggerMode = 'onMount' | 'onScroll';

interface SplitTextRevealProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  stagger?: number;
  animation?: SplitType;
  trigger?: TriggerMode;
  duration?: number;
  ease?: string;
  tagClassName?: string;
}

export function SplitTextReveal({
  text,
  as: Tag = 'div',
  className,
  delay = 0,
  stagger = 0.03,
  animation = 'chars',
  trigger = 'onMount',
  duration = 0.6,
  ease = 'power3.out',
  tagClassName,
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasAnimated = useRef(false);
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after hydration (deferred to satisfy React 19 hooks rule)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const splitContent = useCallback((el: HTMLElement) => {
    // Clear previous content
    el.innerHTML = '';

    if (animation === 'chars') {
      text.split('').forEach((char) => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'bottom';

        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.textContent = char === ' ' ? '\u00A0' : char;
        inner.className = tagClassName || '';

        wrapper.appendChild(inner);
        el.appendChild(wrapper);
      });
    } else if (animation === 'words') {
      text.split(' ').forEach((word, i) => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'bottom';
        wrapper.style.marginRight = '0.25em';

        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.textContent = word;
        inner.className = tagClassName || '';

        wrapper.appendChild(inner);
        el.appendChild(wrapper);

        // Add space between words
        if (i < text.split(' ').length - 1) {
          const space = document.createElement('span');
          space.style.display = 'inline-block';
          space.style.width = '0.25em';
          el.appendChild(space);
        }
      });
    } else {
      // lines: treat the whole text as one line block
      text.split('\n').forEach((line) => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'block';
        wrapper.style.overflow = 'hidden';

        const inner = document.createElement('span');
        inner.style.display = 'block';
        inner.textContent = line || '\u00A0';
        inner.className = tagClassName || '';

        wrapper.appendChild(inner);
        el.appendChild(wrapper);
      });
    }
  }, [text, animation, tagClassName]);

  const runAnimation = useCallback(() => {
    const el = containerRef.current;
    if (!el || hasAnimated.current) return;

    hasAnimated.current = true;

    splitContent(el);

    const targets = el.querySelectorAll(':scope > span > span');

    // Set initial state
    gsap.set(targets, {
      y: '100%',
      opacity: 0,
    });

    // Create timeline
    const tl = gsap.timeline({ delay });
    tl.to(targets, {
      y: '0%',
      opacity: 1,
      duration,
      stagger,
      ease,
    });

    tlRef.current = tl;
  }, [splitContent, delay, stagger, duration, ease]);

  useEffect(() => {
    // Only run GSAP animation after the component is mounted (client-side only)
    if (!mounted) return;

    const el = containerRef.current;
    if (!el) return;

    if (trigger === 'onMount') {
      // Use double rAF to ensure the browser has painted the server HTML
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          runAnimation();
        });
      });
      return () => cancelAnimationFrame(timer);
    }

    // onScroll: use IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [trigger, runAnimation, mounted]);

  useEffect(() => {
    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  const Element = Tag as React.ElementType;

  return (
    <Element ref={containerRef as React.Ref<HTMLElement>} className={className} aria-label={text}>
      {text}
    </Element>
  );
}
