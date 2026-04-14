'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type RevealDirection = 'up' | 'left' | 'right' | 'clip';

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
}

const directionVariants = {
  up: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  clip: {
    hidden: { clipPath: 'inset(100% 0 0 0)' },
    visible: { clipPath: 'inset(0% 0 0 0)' },
  },
};

const directionTransitionDefaults: Record<RevealDirection, object> = {
  up: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  left: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  right: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  clip: { duration: 0.8, ease: [0.77, 0, 0.175, 1] },
};

export function RevealSection({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.8,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const variants = directionVariants[direction];
  const transitionBase = directionTransitionDefaults[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        ...transitionBase,
        duration,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
