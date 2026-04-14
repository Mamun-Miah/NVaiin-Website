'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  revealDelay?: number;
}

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

export function TextScramble({
  text,
  className,
  scrambleSpeed = 30,
  revealDelay = 50,
}: TextScrambleProps) {
  // Start with the actual text on both server & client (avoids hydration mismatch)
  // Client will scramble after mount
  const [displayText, setDisplayText] = useState(text);
  const [hasScrambled, setHasScrambled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousText = useRef(text);

  const getRandomChar = useCallback(() => {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }, []);

  const runScramble = useCallback(() => {
    // Clear any running interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initialize with scrambled characters
    const scrambled = text
      .split('')
      .map((char) => (char === ' ' ? ' ' : getRandomChar()))
      .join('');
    setDisplayText(scrambled);

    let resolvedIndex = 0;
    const chars = text.split('');

    intervalRef.current = setInterval(() => {
      if (resolvedIndex >= chars.length) {
        // All characters resolved
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayText(text);
        return;
      }

      // Resolve characters up to resolvedIndex and scramble the rest
      resolvedIndex++;
      const result = chars
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < resolvedIndex) return char;
          return getRandomChar();
        })
        .join('');

      setDisplayText(result);
    }, revealDelay);
  }, [text, revealDelay, getRandomChar]);

  useEffect(() => {
    // Only scramble after mount and if text changed
    if (text === previousText.current && hasScrambled) return;
    previousText.current = text;

    // Small delay to ensure the real text is painted first
    const timer = setTimeout(() => {
      setHasScrambled(true);
      runScramble();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, runScramble, hasScrambled]);

  return (
    <span className={className} aria-label={text}>
      {displayText}
    </span>
  );
}
