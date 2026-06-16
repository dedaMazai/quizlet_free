import { FC, memo } from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '@/shared/lib/formatters';

interface LocalDraftRecoveryModalProps {
    open: boolean;
    savedAt?: string;
    onAccept: () => void;
    onDecline: () => void;
}

/**
 * Modal for recovering unsaved local drafts
 */
export const LocalDraftRecoveryModal: FC<LocalDraftRecoveryModalProps> = memo((props) => {
    const { open, savedAt, onAccept, onDecline } = props;
    const { t } = useTranslation();

    return (
        <Modal
            open={open}
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: 'var(--color-warning)' }} />
                    {t('Найдены несохранённые изменения')}
                </Space>
            }
            okText={t('Восстановить')}
            cancelText={t('Отклонить')}
            onOk={onAccept}
            onCancel={onDecline}
            closable={false}
            maskClosable={false}
        >
            <Typography.Paragraph>
                {t('Обнаружена локально сохранённая версия документа.')}
            </Typography.Paragraph>
            {savedAt && (
                <Typography.Text type="secondary">
                    {t('Сохранено')}: {formatRelativeTime(savedAt)}
                </Typography.Text>
            )}
            <Typography.Paragraph style={{ marginTop: 16 }}>
                {t('Хотите восстановить несохранённые изменения или использовать версию с сервера?')}
            </Typography.Paragraph>
        </Modal>
    );
});

LocalDraftRecoveryModal.displayName = 'LocalDraftRecoveryModal';
