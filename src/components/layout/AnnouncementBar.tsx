'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'nvaiin-announcement-dismissed';

const MARQUEE_TEXT =
  'FREE SHIPPING ON ORDERS OVER $75 \u2726 NEW DROP LIVE NOW \u2726 ';

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

function getServerSnapshot(): string {
  return '';
}

export function AnnouncementBar() {
  const dismissed = useSyncExternalStore(
    subscribeToStorage,
    getSnapshot,
    getServerSnapshot
  );

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      // Dispatch a storage event so useSyncExternalStore picks it up
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    } catch {
      // localStorage not available
    }
  }, []);

  if (dismissed === 'true') {
    return null;
  }

  return (
    <div className="relative w-full bg-nv-red text-nv-white h-9 overflow-hidden flex items-center">
      {/* Marquee Track */}
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {/* Duplicate content for seamless loop */}
        <span className="font-bebas tracking-[0.15em] text-sm">
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
        </span>
        <span className="font-bebas tracking-[0.15em] text-sm" aria-hidden>
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
        </span>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-nv-white/80 hover:text-nv-white transition-colors duration-200 z-10 cursor-hover"
        aria-label="Dismiss announcement"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
