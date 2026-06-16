import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Modal } from 'antd';
import {
  Card,
  useCreateCardMutation,
  useUpdateCardMutation,
} from '@/entities/Card';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';

interface CardFormValues {
  term: string;
  translation: string;
  example?: string;
}

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  deckUuid: string;
  card?: Card;
}

export const CardForm: FC<CardFormProps> = (props) => {
  const { open, onClose, deckUuid, card } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();
  const [form] = Form.useForm<CardFormValues>();

  const [createCard, { isLoading: isCreating }] = useCreateCardMutation();
  const [updateCard, { isLoading: isUpdating }] = useUpdateCardMutation();

  const isEdit = Boolean(card);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        term: card?.term ?? '',
        translation: card?.translation ?? '',
        example: card?.example ?? '',
      });
    }
  }, [open, card, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (card) {
        await updateCard({ uuid: card.uuid, ...values }).unwrap();
        message.success(t('Слово обновлено'));
      } else {
        await createCard({ deck_uuid: deckUuid, ...values }).unwrap();
        message.success(t('Слово добавлено'));
      }
      form.resetFields();
      onClose();
    } catch {
      message.error(t('Не удалось сохранить слово'));
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? t('Редактировать слово') : t('Добавить слово')}
      okText={t('Сохранить')}
      cancelText={t('Отмена')}
      confirmLoading={isCreating || isUpdating}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="term"
          label={t('Слово')}
          rules={[{ required: true, message: t('Введите слово') }]}
        >
          <Input autoFocus placeholder="apple" />
        </Form.Item>
        <Form.Item
          name="translation"
          label={t('Перевод')}
          rules={[{ required: true, message: t('Введите перевод') }]}
        >
          <Input placeholder={t('яблоко')} />
        </Form.Item>
        <Form.Item name="example" label={t('Пример')}>
          <Input.TextArea rows={2} placeholder={t('Необязательно')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
