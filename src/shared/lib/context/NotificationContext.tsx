import {
  createContext, useContext,
} from 'react';
import { NotificationInstance } from 'antd/es/notification/interface';

export const NotificationContext = createContext<NotificationInstance | null>(null);

export function useNotificationFn() {
  return useContext(NotificationContext);
}
