import { useEffect, useState } from 'react';
import { MOTION_MS } from '@/shared/const/motion';
import { useReducedMotion } from './useReducedMotion';

interface CountUpOptions {
  enabled: boolean;
  duration?: number;
}

// Близко к `--ease-enter`: быстрый старт, мягкая посадка
const easeOut = (t: number) => 1 - (1 - t) ** 4;

/** Count-up 0→target один раз за маунт; без `enabled` или при reduced motion — сразу итог */
export const useCountUp = (target: number, { enabled, duration = MOTION_MS.deliberate }: CountUpOptions): number => {
  const reduced = useReducedMotion();
  const animate = enabled && !reduced;
  const [value, setValue] = useState(animate ? 0 : target);
  const [done, setDone] = useState(!animate);

  useEffect(() => {
    if (done) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * easeOut(progress)));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [done, target, duration]);

  return done ? target : value;
};
