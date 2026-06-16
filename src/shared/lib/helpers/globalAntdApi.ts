import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';

/**
 * Глобальный API для Antd методов (modal, message, notification).
 * Используется для вызова методов вне React компонентов (например, в rtkApi).
 * Эти методы наследуют тему из ConfigProvider.
 */
interface GlobalAntdApi {
    modal: Omit<ModalStaticFunctions, 'warn'>;
    message: MessageInstance;
    notification: NotificationInstance;
}

let globalAntdApi: GlobalAntdApi | null = null;

/**
 * Устанавливает глобальный API Antd.
 * Вызывается из NotificationProvider после инициализации App.useApp().
 */
export const setGlobalAntdApi = (api: GlobalAntdApi): void => {
    globalAntdApi = api;
};

/**
 * Получает глобальный API Antd для использования вне React компонентов.
 * @returns GlobalAntdApi или null если API ещё не инициализирован
 */
export const getGlobalAntdApi = (): GlobalAntdApi | null => {
    return globalAntdApi;
};

/**
 * Получает глобальный notification API.
 * Возвращает null если API ещё не инициализирован.
 */
export const getGlobalNotification = (): NotificationInstance | null => {
    return globalAntdApi?.notification ?? null;
};

/**
 * Получает глобальный message API.
 * Возвращает null если API ещё не инициализирован.
 */
export const getGlobalMessage = (): MessageInstance | null => {
    return globalAntdApi?.message ?? null;
};

/**
 * Получает глобальный modal API.
 * Возвращает null если API ещё не инициализирован.
 */
export const getGlobalModal = (): Omit<ModalStaticFunctions, 'warn'> | null => {
    return globalAntdApi?.modal ?? null;
};
