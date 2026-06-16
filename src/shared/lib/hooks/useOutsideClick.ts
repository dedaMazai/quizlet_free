import {
  useEffect, useRef,
} from 'react';

/**
 * Хук для вызова функции по клику вне целевого объекта и его наследников.
 * handler желательно оборачивать в useCallback
 */

type TUseOutsideClick = {
  ref: { current?: any }
  inactiveZoneRef?: { current?: any }
  handler?: (event: MouseEvent) => void
  isActive?: boolean
};

const useOutsideClick = ({
  ref,
  inactiveZoneRef,
  handler,
  isActive = true,
}: TUseOutsideClick) => {
  const checkIsOutsideClick = (event: MouseEvent) => {
    const refCollection = Array.isArray(ref)
      ? ref
      : [ref];

    return !refCollection.filter((currentRef) => currentRef?.current?.contains(event.target)).length;
  };

  const checkIsInactiveZoneClick = (event: MouseEvent) => {
    const refCollection = Array.isArray(inactiveZoneRef)
      ? inactiveZoneRef
      : [inactiveZoneRef];

    return !!refCollection.filter((currentRef) => currentRef?.current?.contains(event.target)).length;
  };

  const savedListener = useRef<((this: Document, ev: MouseEvent) => void) | undefined>(undefined);

  useEffect(() => {
    if (savedListener?.current) {
      document.removeEventListener('mousedown', savedListener?.current, true);
    }

    if (isActive) {
      savedListener.current = (event) => {
        if (!checkIsOutsideClick(event) || checkIsInactiveZoneClick(event)) {
          return;
        }

        handler?.(event);
      };

      document.addEventListener('mousedown', savedListener?.current, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, handler]);

  useEffect(
    () => () => {
      if (savedListener?.current) {
        document.removeEventListener('mousedown', savedListener?.current, true);
      }
    },

     
    [],
  );
};

export { useOutsideClick };
