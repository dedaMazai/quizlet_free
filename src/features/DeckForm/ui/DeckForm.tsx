import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Modal } from 'antd';
import {
  Deck,
  useCreateDeckMutation,
  useUpdateDeckMutation,
} from '@/entities/Deck';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';

interface DeckFormValues {
  name: string;
  description?: string;
}

interface DeckFormProps {
  open: boolean;
  onClose: () => void;
  deck?: Deck;
}

export const DeckForm: FC<DeckFormProps> = (props) => {
  const { open, onClose, deck } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();
  const [form] = Form.useForm<DeckFormValues>();

  const [createDeck, { isLoading: isCreating }] = useCreateDeckMutation();
  const [updateDeck, { isLoading: isUpdating }] = useUpdateDeckMutation();

  const isEdit = Boolean(deck);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: deck?.name ?? '', description: deck?.description ?? '' });
    }
  }, [open, deck, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (deck) {
        await updateDeck({ uuid: deck.uuid, ...values }).unwrap();
        message.success(t('Колода обновлена'));
      } else {
        await createDeck(values).unwrap();
        message.success(t('Колода создана'));
      }
      form.resetFields();
      onClose();
    } catch {
      message.error(t('Не удалось сохранить колоду'));
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? t('Редактировать колоду') : t('Создать колоду')}
      okText={t('Сохранить')}
      cancelText={t('Отмена')}
      confirmLoading={isCreating || isUpdating}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t('Название')}
          rules={[{ required: true, message: t('Введите название') }]}
        >
          <Input autoFocus placeholder={t('Например: Путешествия')} />
        </Form.Item>
        <Form.Item name="description" label={t('Описание')}>
          <Input.TextArea rows={2} placeholder={t('Необязательно')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
