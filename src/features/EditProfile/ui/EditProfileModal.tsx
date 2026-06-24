import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Modal } from 'antd';
import { useUserInfo, useUpdateMeInfoMutation } from '@/entities/User';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { AvatarPicker } from './AvatarPicker';

interface EditProfileFormValues {
  surname?: string;
  name: string;
  middle_name?: string;
  tel?: string;
  description?: string;
  avatar?: string;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const EditProfileModal: FC<EditProfileModalProps> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();
  const user = useUserInfo();
  const [form] = Form.useForm<EditProfileFormValues>();

  const [updateMeInfo, { isLoading }] = useUpdateMeInfoMutation();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        surname: user?.surname ?? '',
        name: user?.name ?? '',
        middle_name: user?.middle_name ?? '',
        tel: user?.tel ?? '',
        description: user?.description ?? '',
        avatar: user?.avatar,
      });
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      await updateMeInfo(values).unwrap();
      message.success(t('Профиль обновлён'));
      onClose();
    } catch {
      message.error(t('Не удалось сохранить профиль'));
    }
  };

  return (
    <Modal
      open={open}
      title={t('Редактировать профиль')}
      okText={t('Сохранить')}
      cancelText={t('Отмена')}
      confirmLoading={isLoading}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="surname" label={t('Фамилия')}>
          <Input placeholder={t('Необязательно')} />
        </Form.Item>
        <Form.Item
          name="name"
          label={t('Имя')}
          rules={[{ required: true, message: t('Введите имя') }]}
        >
          <Input placeholder={t('Имя')} />
        </Form.Item>
        <Form.Item name="middle_name" label={t('Отчество')}>
          <Input placeholder={t('Необязательно')} />
        </Form.Item>
        <Form.Item name="tel" label={t('Телефон')}>
          <Input placeholder="+7 999 123-45-67" />
        </Form.Item>
        <Form.Item name="description" label={t('Описание')}>
          <Input.TextArea rows={3} placeholder={t('Расскажите о себе')} />
        </Form.Item>
        <Form.Item name="avatar" label={t('Аватар')}>
          <AvatarPicker />
        </Form.Item>
      </Form>
    </Modal>
  );
};
