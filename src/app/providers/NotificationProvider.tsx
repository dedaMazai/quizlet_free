import {
  PropsWithChildren, useEffect, useMemo,
} from 'react';
import {
  App,
  notification,
} from 'antd';
import { NotificationContext } from '@/shared/lib/context/NotificationContext';
import { setGlobalAntdApi } from '@/shared/lib/helpers/globalAntdApi';
import { ToastProvider } from '@/shared/lib/toast';

export function NotificationProvider({ children }: PropsWithChildren) {
  const [api, contentHolder] = notification.useNotification({
    stack: false,
  });

  // Получаем контекстные методы из App для использования вне React компонентов
  const { modal, message, notification: contextNotification } = App.useApp();

  // Устанавливаем глобальный API для использования вне React (например, в rtkApi)
  useEffect(() => {
    setGlobalAntdApi({
      modal,
      message,
      notification: contextNotification,
    });
  }, [modal, message, contextNotification]);

  return (
    <NotificationContext.Provider value={useMemo(() => api, [api])}>
      {/* Тосты приложения — свой стек (BACKLOG §3) вместо message/notification AntD */}
      <ToastProvider>{children}</ToastProvider>
      {contentHolder}
    </NotificationContext.Provider>
  );
}
