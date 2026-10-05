import { RefObject, useEffect, useState } from 'react';

/** `true` с момента, когда элемент впервые попал во viewport */
export const useInViewport = (ref: RefObject<Element | null>, enabled = true): boolean => {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || seen || !element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setSeen(true);
        observer.disconnect();
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, enabled, seen]);

  return seen;
};
