import { App } from 'antd';

/**
 * Хук для использования контекстного modal из Ant Design.
 * Наследует тему из ConfigProvider, в отличие от статических методов.
 * Тосты — через `useToast` из `@/shared/lib/toast`.
 *
 * @example
 * const { modal } = useAntdApp();
 *
 * // Вместо Modal.confirm используйте:
 * modal.confirm({
 *   title: 'Подтверждение',
 *   onOk: () => handleConfirm(),
 * });
 */
export const useAntdApp = () => {
    const { modal } = App.useApp();

    return {
        modal,
    };
};
