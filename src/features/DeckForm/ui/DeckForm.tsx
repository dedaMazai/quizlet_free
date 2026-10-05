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
import { useToast } from '@/shared/lib/toast';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { MODAL_MOTION } from '@/shared/const/motion';
import cls from './DeckForm.module.scss';

interface DeckFormValues {
  name: string;
  description?: string;
}

interface DeckFormProps {
  open: boolean;
  onClose: () => void;
  deck?: Deck;
  /** После создания новой колоды — например, чтобы сразу открыть импорт */
  onCreated?: (deck: Deck) => void;
}

export const DeckForm: FC<DeckFormProps> = (props) => {
  const {
    open, onClose, deck, onCreated,
  } = props;
  const { t } = useTranslation();
  const toast = useToast();
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
        toast.success(t('Колода обновлена'));
      } else {
        const created = await createDeck(values).unwrap();
        toast.success(t('Колода создана'));
        onCreated?.(created);
      }
      form.resetFields();
      onClose();
    } catch {
      toast.error(t('Не удалось сохранить колоду'));
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
