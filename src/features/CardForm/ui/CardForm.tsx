import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Form, Input, Modal, Segmented,
} from 'antd';
import {
  Card,
  CardType,
  inferCardType,
  useCreateCardMutation,
  useUpdateCardMutation,
} from '@/entities/Card';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { useToast } from '@/shared/lib/toast';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { MODAL_MOTION } from '@/shared/const/motion';
import cls from './CardForm.module.scss';

interface CardFormValues {
  term: string;
  translation: string;
  example?: string;
  card_type: CardType;
}

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  deckUuid: string;
  card?: Card;
  /** Удаление из шторки на мобильном, где у строки нет своей кнопки */
  onDelete?: () => void;
}

export const CardForm: FC<CardFormProps> = (props) => {
  const {
    open, onClose, deckUuid, card, onDelete,
  } = props;
  const { t } = useTranslation();
  const toast = useToast();
  const [form] = Form.useForm<CardFormValues>();
  const { isMobile } = useMatchMedia();

  const [createCard, { isLoading: isCreating }] = useCreateCardMutation();
  const [updateCard, { isLoading: isUpdating }] = useUpdateCardMutation();

  const isEdit = Boolean(card);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        term: card?.term ?? '',
        translation: card?.translation ?? '',
        example: card?.example ?? '',
        card_type: card?.card_type ?? inferCardType(card?.term ?? ''),
      });
    }
  }, [open, card, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (card) {
        await updateCard({ uuid: card.uuid, ...values }).unwrap();
        toast.success(t('Слово обновлено'));
      } else {
        await createCard({ deck_uuid: deckUuid, ...values }).unwrap();
        toast.success(t('Слово добавлено'));
      }
      form.resetFields();
      onClose();
    } catch {
      toast.error(t('Не удалось сохранить слово'));
    }
  };

  const title = isEdit ? t('Редактировать слово') : t('Добавить слово');
  const formNode = (
    <Form
      form={form}
      layout="vertical"
      // Шторка монтирует форму позже эффекта — значения дублируем начальными
      initialValues={{
        term: card?.term ?? '',
        translation: card?.translation ?? '',
        example: card?.example ?? '',
        card_type: card?.card_type ?? inferCardType(card?.term ?? ''),
      }}
      className={isMobile ? cls.sheetForm : undefined}
    >
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
      <Form.Item name="card_type" label={t('Тип')}>
        <Segmented
          options={[
            { label: t('Слово'), value: 'word' },
            { label: t('Фраза'), value: 'phrase' },
          ]}
        />
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
            {isEdit && onDelete && (
              <Button danger onClick={onDelete}>{t('Удалить')}</Button>
            )}
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
      {...MODAL_MOTION}
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
