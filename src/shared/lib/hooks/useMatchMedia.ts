import { useMemo, useSyncExternalStore } from 'react';

// Границы не пересекаются: на 650 и 1200 ровно один флаг true
const queries = [
  '(max-width: 650px)',
  '(min-width: 650.02px) and (max-width: 1199.98px)',
  '(min-width: 1200px)',
];

type MatchMedia = {isMobile: boolean, isTablet: boolean, isDesktop: boolean};

const mediaQueryLists = queries.map((query) => matchMedia(query));

const subscribe = (onChange: () => void) => {
  mediaQueryLists.forEach((list) => list.addEventListener('change', onChange));

  return () => mediaQueryLists.forEach((list) => list.removeEventListener('change', onChange));
};

// Снимок — индекс совпавшего запроса: примитив, стабилен между рендерами
const getSnapshot = () => mediaQueryLists.findIndex((list) => list.matches);

export const useMatchMedia = (): MatchMedia => {
  const index = useSyncExternalStore(subscribe, getSnapshot);

  return useMemo(() => ({
    isMobile: index === 0,
    isTablet: index === 1,
    isDesktop: index === 2,
  }), [index]);
};
