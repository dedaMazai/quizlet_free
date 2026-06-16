import { App } from 'antd';

/**
 * Хук для использования контекстных методов Ant Design (modal, message, notification).
 * Эти методы наследуют тему из ConfigProvider, в отличие от статических методов.
 *
 * @example
 * const { modal, message, notification } = useAntdApp();
 *
 * // Вместо Modal.confirm используйте:
 * modal.confirm({
 *   title: 'Подтверждение',
 *   onOk: () => handleConfirm(),
 * });
 *
 * // Вместо message.success используйте:
 * message.success('Успешно!');
 */
export const useAntdApp = () => {
    const { modal, message, notification } = App.useApp();

    return {
        modal,
        message,
        notification,
    };
};
