import {
  useEffect, useCallback, useState,
} from 'react';

export function useCtrlPressed(): boolean {
  const [ctrlPressed, setCtrlPressed] = useState(false);

  const setupCtrlPressed = useCallback((e: KeyboardEvent) => {
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    setCtrlPressed(isCtrlPressed);
  }, []);

  const clearCtrlPressed = useCallback((e: KeyboardEvent) => {
    const isCtrlClosed = e.ctrlKey || e.metaKey;
    setCtrlPressed(isCtrlClosed);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', setupCtrlPressed);
    document.addEventListener('keyup', clearCtrlPressed);

    return () => {
      document.removeEventListener('keydown', setupCtrlPressed);
      document.removeEventListener('keyup', clearCtrlPressed);
    };
  }, [setupCtrlPressed, clearCtrlPressed]);

  return ctrlPressed;
}
