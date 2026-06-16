import {
  useEffect, useCallback, useState,
} from 'react';

export const useArrowPressed = (ingoreInInputs = true) => {
  const [arrowPressed, setArrowPressed] = useState({
    left: false,
    up: false,
    down: false,
    right: false,
  });

  const setupArrowPressed = useCallback((e: KeyboardEvent) => {
    const keysMap:{ [index: string]: string } = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    const key = keysMap[e.key];

    if (!key) {
      return;
    }

    if (ingoreInInputs && document.activeElement?.nodeName === 'INPUT') {
      return;
    }

    setArrowPressed((c) => ({
      ...c,
      [key]: e.type === 'keydown',
    }));
  }, [ingoreInInputs]);

  useEffect(() => {
    document.addEventListener('keydown', setupArrowPressed);
    document.addEventListener('keyup', setupArrowPressed);

    return () => {
      document.removeEventListener('keydown', setupArrowPressed);
      document.removeEventListener('keyup', setupArrowPressed);
    };
  }, [setupArrowPressed]);

  return arrowPressed;
};
