import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { isJSON } from '../helpers/isJSON';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Функция для получения значения из localStorage
  const getStoredValue = useCallback(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null && isJSON(item)) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      // Тихо игнорируем ошибки чтения localStorage
    }
    return initialValue;
  }, [key, initialValue]);

  // Инициализируем состояние сразу с правильным значением
  const [value, setValue] = useState<T>(getStoredValue);

  // Сохраняем в localStorage при изменении значения
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Тихо игнорируем ошибки записи в localStorage
    }
  }, [key, value]);

  const setStoredValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    setValue((prevValue) => {
      console.log('11111', typeof newValue === 'function');
      const valueToStore = typeof newValue === 'function'
        ? (newValue as (prevValue: T) => T)(prevValue)
        : newValue;

      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // Тихо игнорируем ошибки записи в localStorage
      }

      return valueToStore;
    });
  }, [key]);

  const forceSet = useCallback((newValue: T) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      // Тихо игнорируем ошибки записи в localStorage
    }
  }, [key]);

  return [value, setStoredValue, forceSet] as const;
};
