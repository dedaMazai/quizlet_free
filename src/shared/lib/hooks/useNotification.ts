import { useEffect, useRef } from 'react';
import { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useTranslation } from 'react-i18next';
import { useNotificationFn } from '../context/NotificationContext';

interface UseNotificationProps {
  isLoading?: { active?: boolean, text?: string }
  isSuccess?: { active?: boolean, text?: string }
  isError?: {
    active?: boolean
    text?: string
    error?: FetchBaseQueryError | SerializedError | undefined
  }
}

type TypeError = {
  [codeError: string]: string
  msg: string
};

type DetailsError = string | Record<string, TypeError | string> | TypeError[] | undefined;

export const useNotification = ({
  isLoading,
  isSuccess,
  isError,
}: UseNotificationProps) => {
  const loadingName = useRef<number | undefined>(undefined);
  const { t } = useTranslation();
  const notification = useNotificationFn();

  useEffect(() => {
    if (isLoading?.active) {
      const key = Math.random();

      loadingName.current = key;
      notification?.info({
        key,
        message: isLoading.text || t('Загрузка...'),
        duration: 0,
      });
    }

    if (!isLoading?.active && loadingName.current) {
      notification?.destroy(loadingName.current);
    }

    return () => {
      notification?.destroy(loadingName.current);
      loadingName.current = undefined;
    };
  }, [
    isLoading?.active,
    isLoading?.text,
    notification,
    t,
  ]);

  useEffect(() => {
    if (isSuccess?.active) {
      notification?.success({
        message: isSuccess.text || t('Успешно!'),
      });
    }
  }, [
    isSuccess?.active,
    isSuccess?.text,
    notification,
    t,
  ]);

  useEffect(() => {
    if (isError?.active) {
      let error: string | undefined;

      if (isError.error && 'data' in isError.error) {
        const detail = (isError.error as { data?: { detail?: DetailsError } })?.data?.detail;

        if (typeof detail === 'string') {
          error = detail;
        }

        if (typeof detail === 'object') {
          if (Array.isArray(detail)) {
            detail.forEach((errorDetail) => {
              if (typeof errorDetail === 'string') {
                error = `${error
                  ? `${error}; `
                  : ''}${errorDetail}`;
              }

              if (typeof errorDetail === 'object') {
                error = `${error
                  ? `${error}; `
                  : ''}${errorDetail.msg}`;
              }
            });
          } else {
            Object.values(detail)
              .forEach((errorDetail) => {
                if (typeof errorDetail === 'string') {
                  error = `${error
                    ? `${error}; `
                    : ''}${errorDetail}`;
                }

                if (typeof errorDetail === 'object') {
                  Object.values(errorDetail)
                    .forEach((errorDetailMassage) => {
                      error = `${error
                        ? `${error}; `
                        : ''}${errorDetailMassage}`;
                    });
                }
              });
          }
        }
      }

      notification?.error({
        message: error || isError.text || t('Ошибка.'),
      });
    }
  }, [
    isError?.active,
    isError?.error,
    isError?.text,
    notification,
    t,
  ]);
};
