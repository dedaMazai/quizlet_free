import {
  useState, useLayoutEffect, useCallback,
} from 'react';

const queries = [
  '(max-width: 650px)',
  '(min-width: 650px) and (max-width: 1200px)',
  '(min-width: 1200px)',
];

type MatchMedia = {isMobile: boolean, isTablet: boolean, isDesktop: boolean};

export const useMatchMedia = (): MatchMedia => {
  const mediaQueryLists = queries.map((query) => matchMedia(query));

  const getValues = useCallback(() => mediaQueryLists.map((list) => list.matches), [mediaQueryLists]);

  const [values, setValues] = useState(getValues);

  useLayoutEffect(() => {
    const handler = () => setValues(getValues);

    mediaQueryLists.forEach((list) => list.addEventListener('change', handler));

    return () => mediaQueryLists.forEach((list) => list.removeEventListener('change', handler));
  }, [getValues, mediaQueryLists]);

  return [
    'isMobile',
    'isTablet',
    'isDesktop',
  ].reduce<any>(
    (acc, screen, index) => ({
      ...acc,
      [screen]: values[index],
    }),
    {},
  );
};
