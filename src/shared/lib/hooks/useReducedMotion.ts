import { useSyncExternalStore } from 'react';

const mediaQueryList = matchMedia('(prefers-reduced-motion: reduce)');

const subscribe = (onChange: () => void) => {
  mediaQueryList.addEventListener('change', onChange);

  return () => mediaQueryList.removeEventListener('change', onChange);
};

const getSnapshot = () => mediaQueryList.matches;

/** `prefers-reduced-motion: reduce` — движения сводятся к opacity, счётчики сразу итог */
export const useReducedMotion = (): boolean => useSyncExternalStore(subscribe, getSnapshot);
