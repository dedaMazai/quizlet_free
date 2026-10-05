import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { useChangePasswordMutation } from '@/entities/User';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { useToast } from '@/shared/lib/toast';
import cls from './ProfileForm.module.scss';

const MODAL_WIDTH = 440;
const MIN_PASSWORD_LENGTH = 6;

interface ChangePasswordValues {
  password: string;
  confirm: string;
}

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

/** Смена пароля текущего пользователя через Supabase Auth */
export const ChangePasswordModal: FC<ChangePasswordModalProps> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const toast = useToast();
  const [form] = Form.useForm<ChangePasswordValues>();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async () => {
    const { password } = await form.validateFields();
    try {
      await changePassword(password).unwrap();
      toast.success(t('Пароль изменён'));
      onClose();
    } catch {
      toast.error(t('Не удалось изменить пароль'));
    }
  };

  return (
    <ModalFrame
      open={open}
      width={MODAL_WIDTH}
      title={t('Сменить пароль')}
      onClose={onClose}
      destroyOnHidden
      actions={(
        <>
          <Button onClick={onClose}>{t('Отмена')}</Button>
          <Button type="primary" loading={isLoading} onClick={handleSubmit}>
            <BlueprintMarks />
            {t('Сохранить')}
          </Button>
        </>
      )}
    >
      <Form form={form} layout="vertical" requiredMark={false} className={cls.modalForm} onFinish={handleSubmit}>
        <Form.Item
          name="password"
          label={t('Новый пароль')}
          rules={[
            { required: true, message: t('Введите пароль') },
            { min: MIN_PASSWORD_LENGTH, message: t('Не короче {{count}} символов', { count: MIN_PASSWORD_LENGTH }) },
          ]}
        >
          <Input.Password className={cls.input} autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label={t('Повторите пароль')}
          dependencies={['password']}
          rules={[
            { required: true, message: t('Повторите пароль') },
            ({ getFieldValue }) => ({
              validator: (_, value) => (!value || getFieldValue('password') === value
                ? Promise.resolve()
                : Promise.reject(new Error(t('Пароли не совпадают')))),
            }),
          ]}
        >
          <Input.Password className={cls.input} autoComplete="new-password" />
        </Form.Item>
      </Form>
    </ModalFrame>
  );
};
