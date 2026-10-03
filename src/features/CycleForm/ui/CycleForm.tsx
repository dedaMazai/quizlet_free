import { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Form, Input, InputNumber, Modal, Select, Space,
} from 'antd';
import {
  CycleWord,
  LearningCycle,
  useCreateCycleMutation,
  useUpdateCycleMutation,
} from '@/entities/LearningCycle';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import cls from './CycleForm.module.scss';

/** Размер порции по умолчанию — как в тетради: 10 слов в день. */
const DEFAULT_DAILY_NEW_COUNT = 10;
const MAX_DAILY_NEW_COUNT = 200;

interface CycleFormValues {
  name: string;
  daily_new_count: number;
  start_word_uuid?: string | null;
}

interface CycleFormProps {
  open: boolean;
  onClose: () => void;
  /** Редактируемый цикл; не задан — создание нового. */
  cycle?: LearningCycle;
  /** Слова цикла — для выбора точки старта повтора. */
  words?: CycleWord[];
  onCreated?: (cycle: LearningCycle) => void;
}

export const CycleForm: FC<CycleFormProps> = (props) => {
  const {
    open, onClose, cycle, words = [], onCreated,
  } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();
  const [form] = Form.useForm<CycleFormValues>();

  const [createCycle, { isLoading: isCreating }] = useCreateCycleMutation();
  const [updateCycle, { isLoading: isUpdating }] = useUpdateCycleMutation();

  const startWordUuid = Form.useWatch('start_word_uuid', form);
  const startNumber = useMemo(() => {
    const idx = words.findIndex((w) => w.uuid === startWordUuid);
    return idx >= 0 ? idx + 1 : null;
  }, [words, startWordUuid]);

  const wordOptions = useMemo(
    () => words.map((w, i) => ({ value: w.uuid, label: `${i + 1}. ${w.term} — ${w.translation}` })),
    [words],
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: cycle?.name ?? '',
        daily_new_count: cycle?.daily_new_count ?? DEFAULT_DAILY_NEW_COUNT,
        start_word_uuid: cycle?.start_word_uuid ?? null,
      });
    }
  }, [open, cycle, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (cycle) {
        await updateCycle({
          uuid: cycle.uuid,
          name: values.name,
          daily_new_count: values.daily_new_count,
          start_word_uuid: values.start_word_uuid ?? null,
        }).unwrap();
        message.success(t('Цикл обновлён'));
      } else {
        const created = await createCycle({
          name: values.name,
          daily_new_count: values.daily_new_count,
        }).unwrap();
        message.success(t('Цикл создан'));
        onCreated?.(created);
      }
      form.resetFields();
      onClose();
    } catch {
      message.error(t('Не удалось сохранить цикл'));
    }
  };

  return (
    <Modal
      open={open}
      title={cycle ? t('Настройки цикла') : t('Создать цикл')}
      okText={t('Сохранить')}
      cancelText={t('Отмена')}
      confirmLoading={isCreating || isUpdating}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t('Название')}
          rules={[{ required: true, message: t('Введите название') }]}
        >
          <Input autoFocus placeholder={t('Например: Тетрадь №1')} />
        </Form.Item>
        <Form.Item
          name="daily_new_count"
          label={t('Новых слов в день')}
          rules={[{ required: true, message: t('Укажите число слов') }]}
        >
          <InputNumber min={1} max={MAX_DAILY_NEW_COUNT} precision={0} />
        </Form.Item>
        {cycle && words.length > 0 && (
          <Form.Item
            label={t('Начинать повтор с')}
            extra={t('Слова до точки старта пропускаются, кроме важных и сегодняшних')}
          >
            <Space.Compact block>
              <InputNumber
                min={1}
                max={words.length}
                precision={0}
                value={startNumber}
                placeholder="№"
                onChange={(value) => form.setFieldValue(
                  'start_word_uuid',
                  typeof value === 'number' ? words[value - 1]?.uuid ?? null : null,
                )}
              />
              <Form.Item name="start_word_uuid" noStyle>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={wordOptions}
                  placeholder={t('С начала списка')}
                  className={cls.wordSelect}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
