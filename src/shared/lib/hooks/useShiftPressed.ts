import {
  useEffect, useCallback, useState,
} from 'react';

export function useShiftPressed(): boolean {
  const [shiftPressed, setShiftPressed] = useState(false);

  const setupShiftPressed = useCallback((e: KeyboardEvent) => {
    setShiftPressed(e.shiftKey);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', setupShiftPressed);
    document.addEventListener('keyup', setupShiftPressed);

    return () => {
      document.removeEventListener('keydown', setupShiftPressed);
      document.removeEventListener('keyup', setupShiftPressed);
    };
  }, [setupShiftPressed]);

  return shiftPressed;
}
