import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'antd';
import { useLogoutMutation } from '@/entities/User';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useToast } from '@/shared/lib/toast';
import { ModalFrame } from '@/shared/ui/ModalFrame';

import { useDeleteMyAccountMutation } from '../model/api/deleteAccountApi';
import cls from './DeleteAccountButton.module.scss';

const MODAL_WIDTH = 480;

interface DeleteAccountButtonProps {
    className?: string;
}

/** Удаление аккаунта со всеми данными (отзыв согласия на обработку ПДн). Подтверждение — вводом слова */
export const DeleteAccountButton = memo(({ className }: DeleteAccountButtonProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deleteAccount, { isLoading }] = useDeleteMyAccountMutation();
    const [logout] = useLogoutMutation();

    const confirmWord = t('удалить');
    const isConfirmed = confirmText.trim().toLowerCase() === confirmWord.toLowerCase();

    const close = () => {
        setOpen(false);
        setConfirmText('');
    };

    const handleDelete = async () => {
        if (!isConfirmed) return;
        const result = await deleteAccount();
        if ('error' in result) {
            const raw = String((result.error as { error?: unknown }).error ?? '');
            toast.error(raw.includes('ADMIN_CANNOT_SELF_DELETE')
                ? t('Администратор не может удалить свой аккаунт: сначала передайте роль другому')
                : t('Не удалось удалить аккаунт, попробуйте позже'));
            return;
        }
        close();
        toast.success(t('Аккаунт и все данные удалены'));
        // Сессия удалённого пользователя больше не действует: выход очищает состояние и кэш
        logout();
    };

    return (
        <>
            <Button danger className={classNames(cls.trigger, [className])} onClick={() => setOpen(true)}>
                {t('Удалить аккаунт')}
            </Button>
            <ModalFrame
                open={open}
                width={MODAL_WIDTH}
                title={t('Удалить аккаунт?')}
                onClose={close}
                destroyOnHidden
                actions={(
                    <>
                        <Button onClick={close}>{t('Отмена')}</Button>
                        <Button danger type="primary" loading={isLoading} disabled={!isConfirmed} onClick={handleDelete}>
                            {t('Удалить навсегда')}
                        </Button>
                    </>
                )}
            >
                <div className={cls.content}>
                    <p className={cls.text}>
                        {t('Аккаунт будет удалён сразу и без возможности восстановления. Вместе с ним удалятся:')}
                    </p>
                    <ul className={cls.list}>
                        <li>{t('колоды, карточки и избранное')}</li>
                        <li>{t('прогресс, история занятий и статистика')}</li>
                        <li>{t('циклы заучивания, результаты по грамматике и настройки')}</li>
                        <li>{t('профиль, согласия и привязка Telegram')}</li>
                    </ul>
                    <p className={cls.text}>
                        {t('Колоды, которыми вы делились, пропадут и у других участников. Сохранить слова можно заранее — экспортом колоды.')}
                    </p>
                    <label className={cls.confirm}>
                        <span>{t('Чтобы подтвердить, введите слово «{{word}}»', { word: confirmWord })}</span>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            onPressEnter={handleDelete}
                            autoComplete="off"
                        />
                    </label>
                </div>
            </ModalFrame>
        </>
    );
});

DeleteAccountButton.displayName = 'DeleteAccountButton';
