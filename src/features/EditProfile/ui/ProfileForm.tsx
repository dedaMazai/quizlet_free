import {
  FC, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Form, Input, Select,
} from 'antd';
import { ChevronDown } from 'lucide-react';
import {
  UserAvatar, UserAvatarSize, useUpdateMeInfoMutation, useUserInfo,
} from '@/entities/User';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AvatarPicker } from './AvatarPicker';
import { ChangePasswordModal } from './ChangePasswordModal';
import cls from './ProfileForm.module.scss';

const CHEVRON_SIZE = 14;
const ICON_STROKE = 1.5;
const DESCRIPTION_ROWS = 3;

interface ProfileFormValues {
  name: string;
  surname?: string;
  middle_name?: string;
  tel?: string;
  timezone?: string;
  description?: string;
  avatar?: string;
}

/** «UTC+3» из «GMT+3»; «GMT» → «UTC» */
const getUtcOffset = (timeZone: string): string => {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  return part.replace('GMT', 'UTC');
};

/** «Europe/Moscow» → «Moscow (UTC+3)» */
const getTimezoneLabel = (timeZone: string): string => {
  const city = timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone;
  return `${city} (${getUtcOffset(timeZone)})`;
};

const BROWSER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface ProfileFormProps {
  /** Без «Сменить пароль» — когда смена пароля есть рядом отдельной строкой (мобильный аккаунт) */
  hidePasswordChange?: boolean;
}

/** Профиль 6.24: аватар, поля профиля, «Сохранить» и «Сменить пароль» */
export const ProfileForm: FC<ProfileFormProps> = ({ hidePasswordChange }) => {
  const { t } = useTranslation();
  const { message } = useAntdApp();
  const user = useUserInfo();
  const [form] = Form.useForm<ProfileFormValues>();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [updateMeInfo, { isLoading }] = useUpdateMeInfoMutation();

  const avatar = Form.useWatch('avatar', form);
  const name = Form.useWatch('name', form);
  const surname = Form.useWatch('surname', form);

  const timezoneOptions = useMemo(
    () => Intl.supportedValuesOf('timeZone').map((zone) => ({ value: zone, label: getTimezoneLabel(zone) })),
    [],
  );

  useEffect(() => {
    form.setFieldsValue({
      name: user?.name ?? '',
      surname: user?.surname ?? '',
      middle_name: user?.middle_name ?? '',
      tel: user?.tel ?? '',
      // Пояс не выбран — предлагаем пояс браузера, сохранится по «Сохранить»
      timezone: user?.timezone ?? BROWSER_TIMEZONE,
      description: user?.description ?? '',
      avatar: user?.avatar,
    });
  }, [user, form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateMeInfo(values).unwrap();
      message.success(t('Профиль обновлён'));
    } catch {
      message.error(t('Не удалось сохранить профиль'));
    }
  };

  // Превью аватара по текущим значениям формы, до сохранения
  const preview = user && {
    ...user, avatar, name: name || user.name, surname,
  };

  return (
    <Blueprint className={cls.ProfileForm}>
      <Form<ProfileFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        className={cls.form}
        onFinish={handleSubmit}
        onFinishFailed={() => message.error(t('Введите имя'))}
      >
        <div className={cls.avatarRow}>
          <UserAvatar user={preview} size={UserAvatarSize.LG} />
          <div className={cls.avatarPick}>
            <Kicker size={KickerSize.SM}>{t('Аватар')}</Kicker>
            <Form.Item name="avatar" noStyle>
              <AvatarPicker user={preview} />
            </Form.Item>
          </div>
        </div>

        <div className={cls.fields}>
          <label className={cls.field}>
            <span className={cls.label}>{t('Имя')}</span>
            <Form.Item name="name" noStyle rules={[{ required: true, whitespace: true }]}>
              <Input className={cls.input} />
            </Form.Item>
          </label>
          <label className={cls.field}>
            <span className={cls.label}>{t('Фамилия')}</span>
            <Form.Item name="surname" noStyle>
              <Input className={cls.input} />
            </Form.Item>
          </label>
          {/* Нет в макете: поля профиля сохранены */}
          <label className={cls.field}>
            <span className={cls.label}>{t('Отчество')}</span>
            <Form.Item name="middle_name" noStyle>
              <Input className={cls.input} />
            </Form.Item>
          </label>
          <label className={cls.field}>
            <span className={cls.label}>{t('Телефон')}</span>
            <Form.Item name="tel" noStyle>
              <Input className={cls.input} placeholder="+7 999 123-45-67" />
            </Form.Item>
          </label>
          <label className={classNames(cls.field, [cls.wide])}>
            <span className={cls.label}>{t('Почта')}</span>
            <Input className={cls.input} value={user?.email} readOnly />
          </label>
          <label className={cls.field}>
            <span className={cls.label}>{t('Часовой пояс')}</span>
            <Form.Item name="timezone" noStyle>
              <Select
                className={cls.input}
                showSearch
                optionFilterProp="label"
                options={timezoneOptions}
                suffixIcon={<ChevronDown aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />}
              />
            </Form.Item>
          </label>
          <label className={classNames(cls.field, [cls.wide])}>
            <span className={cls.label}>{t('Описание')}</span>
            <Form.Item name="description" noStyle>
              <Input.TextArea rows={DESCRIPTION_ROWS} placeholder={t('Расскажите о себе')} />
            </Form.Item>
          </label>
        </div>

        <div className={cls.actions}>
          <Button type="primary" htmlType="submit" className={cls.button} loading={isLoading}>
            <BlueprintMarks />
            {t('Сохранить')}
          </Button>
          {!hidePasswordChange && (
            <Button className={cls.button} onClick={() => setPasswordOpen(true)}>
              {t('Сменить пароль')}
            </Button>
          )}
        </div>
      </Form>

      {!hidePasswordChange && (
        <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      )}
    </Blueprint>
  );
};
