import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Form, Input, Modal,
} from 'antd';
import {
  Deck,
  useCreateDeckMutation,
  useUpdateDeckMutation,
} from '@/entities/Deck';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './DeckForm.module.scss';

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
  const { isMobile } = useMatchMedia();

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

  const title = isEdit ? t('Редактировать колоду') : t('Создать колоду');
  const formNode = (
    <Form
      form={form}
      layout="vertical"
      // Шторка монтирует форму позже эффекта — значения дублируем начальными
      initialValues={{ name: deck?.name ?? '', description: deck?.description ?? '' }}
      className={isMobile ? cls.sheetForm : undefined}
    >
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
  );

  // Mobile: шторка вместо модалки
  if (isMobile) {
    return (
      <ModalFrame
        open={open}
        width="100%"
        title={title}
        onClose={onClose}
        actions={(
          <>
            <Button onClick={onClose}>{t('Отмена')}</Button>
            <Button type="primary" loading={isCreating || isUpdating} onClick={handleSubmit}>
              <BlueprintMarks />
              {t('Сохранить')}
            </Button>
          </>
        )}
      >
        {formNode}
      </ModalFrame>
    );
  }

  return (
    <Modal
      open={open}
      title={title}
      okText={t('Сохранить')}
      cancelText={t('Отмена')}
      confirmLoading={isCreating || isUpdating}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
    >
      {formNode}
    </Modal>
  );
};
