import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputNumber } from 'antd';
import { ChevronDown } from 'lucide-react';
import {
    RoleSelect,
    UserAccessValidator,
    UserAvatar,
    UserAvatarSize,
    useDeleteUserMutation,
    useGetAdminUserStatsQuery,
    useImpersonateUserMutation,
    useSetUserAiLimitMutation,
    useSetUserBlockedMutation,
    useUpdateUserRoleMutation,
} from '@/entities/User';
import type { RoleName, UserInfo } from '@/entities/User';
import { Accesses } from '@/shared/types/accesses';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useToast } from '@/shared/lib/toast';
import { classNames } from '@/shared/lib/classNames/classNames';
import { RoutePath } from '@/shared/config/router/routePath';
import { getUserFullName } from '../lib/getUserFullName';
import cls from './UsersTable.module.scss';

const CHEVRON_SIZE = 14;
const ICON_STROKE = 1.5;
const DEFAULT_AI_LIMIT = 5;

interface UserDetailsPanelProps {
    user: UserInfo;
    /** Запросов к ИИ сегодня */
    aiUsed: number;
    isSelf: boolean;
}

/** Панель выбранного пользователя (6.26): сводка, роль, лимит ИИ, блокировка, вход от его имени */
export const UserDetailsPanel: FC<UserDetailsPanelProps> = (props) => {
    const { user, aiUsed, isSelf } = props;
    const { t } = useTranslation();
    const { modal } = useAntdApp();
    const toast = useToast();

    const { data: stats } = useGetAdminUserStatsQuery(user.uuid);
    const [updateUserRole] = useUpdateUserRoleMutation();
    const [setUserAiLimit] = useSetUserAiLimitMutation();
    const [setUserBlocked] = useSetUserBlockedMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [impersonateUser, { isLoading: isImpersonating }] = useImpersonateUserMutation();

    // Черновик правок; панель пересоздаётся по key при выборе другого пользователя
    const [role, setRole] = useState<RoleName | undefined>(user.role?.name);
    const [aiLimit, setAiLimit] = useState<number | null>(user.ai_limit ?? DEFAULT_AI_LIMIT);
    const [blocked, setBlocked] = useState(Boolean(user.blocked));
    const [isSaving, setIsSaving] = useState(false);

    const isAdmin = role === 'admin';
    const roleChanged = Boolean(role) && role !== user.role?.name;
    const limitChanged = !isAdmin && aiLimit !== null && aiLimit !== (user.ai_limit ?? DEFAULT_AI_LIMIT);
    const blockedChanged = blocked !== Boolean(user.blocked);
    const dirty = roleChanged || limitChanged || blockedChanged;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (roleChanged && role) {
                await updateUserRole({ user_uuid: user.uuid, role }).unwrap();
            }
            if (limitChanged && aiLimit !== null) {
                await setUserAiLimit({ user_uuid: user.uuid, ai_limit: aiLimit }).unwrap();
            }
            if (blockedChanged) {
                await setUserBlocked({ user_uuid: user.uuid, blocked }).unwrap();
            }
            toast.success(t('Изменения сохранены'));
        } catch {
            toast.error(t('Не удалось сохранить изменения'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleImpersonate = () => {
        modal.confirm({
            title: t('Войти как пользователь'),
            content: t('Вы выйдете из своего аккаунта и войдёте как {{email}}. Чтобы вернуться, войдите под своим аккаунтом.', {
                email: user.email,
            }),
            okText: t('Войти'),
            cancelText: t('Отмена'),
            onOk: async () => {
                try {
                    await impersonateUser(user.uuid).unwrap();
                    // Полная перезагрузка: состояние админа не должно пережить смену сессии
                    window.location.assign(RoutePath.MAIN());
                } catch {
                    toast.error(t('Не удалось войти как пользователь'));
                }
            },
        });
    };

    const handleDelete = () => {
        modal.confirm({
            title: t('Удалить пользователя'),
            content: t('Пользователь {{name}} и все его данные будут удалены безвозвратно.', {
                name: user.email,
            }),
            okText: t('Удалить'),
            okButtonProps: { danger: true },
            cancelText: t('Отмена'),
            onOk: async () => {
                try {
                    await deleteUser(user.uuid).unwrap();
                    toast.success(t('Пользователь удалён'));
                } catch {
                    toast.error(t('Не удалось удалить пользователя'));
                }
            },
        });
    };

    const statItems = [
        { label: t('Колод'), value: stats?.decks },
        { label: t('Слов'), value: stats?.words },
        { label: t('Серия'), value: stats?.streak },
    ];

    return (
        <Blueprint className={cls.panel}>
            <div className={cls.panelHead}>
                <UserAvatar user={user} size={UserAvatarSize.MD} />
                <div className={cls.panelName}>
                    <span className={cls.panelTitle}>{getUserFullName(user)}</span>
                    <span className={cls.muted}>{user.email}</span>
                </div>
            </div>

            <div className={cls.stats}>
                {statItems.map(({ label, value }) => (
                    <div key={label} className={cls.stat}>
                        <span className={cls.statLabel}>{label}</span>
                        <span className={cls.statValue}>{value ?? '—'}</span>
                    </div>
                ))}
            </div>

            <div className={cls.field}>
                <span className={cls.fieldLabel}>{t('Роль')}</span>
                <RoleSelect
                    className={cls.control}
                    value={role}
                    disabled={isSelf}
                    onChange={setRole}
                    suffixIcon={<ChevronDown aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />}
                />
            </div>

            <div className={cls.field}>
                <span className={cls.fieldLabel}>{t('Лимит ИИ в день')}</span>
                {isAdmin ? (
                    <div className={cls.staticInput}>
                        ∞
                        <span className={cls.muted}>{t('без лимита')}</span>
                    </div>
                ) : (
                    <InputNumber<number>
                        className={cls.control}
                        min={0}
                        precision={0}
                        value={aiLimit}
                        onChange={setAiLimit}
                        suffix={(
                            <span className={cls.muted}>
                                {t('использовано {{count}}', { count: aiUsed })}
                            </span>
                        )}
                    />
                )}
            </div>

            <div className={cls.toggleRow}>
                <span id={`blocked-${user.uuid}`}>{t('Заблокирован')}</span>
                {/* Квадратный переключатель 40×22 по макету */}
                <button
                    type="button"
                    role="switch"
                    aria-checked={blocked}
                    aria-labelledby={`blocked-${user.uuid}`}
                    disabled={isSelf}
                    className={classNames(cls.switch, { [cls.switchOn]: blocked })}
                    onClick={() => setBlocked((value) => !value)}
                >
                    <i className={cls.switchThumb} />
                </button>
            </div>

            <div className={cls.panelActions}>
                <UserAccessValidator accesses={[Accesses.users_can_update]}>
                    <Button
                        type="primary"
                        className={cls.saveButton}
                        loading={isSaving}
                        disabled={!dirty}
                        onClick={handleSave}
                    >
                        <BlueprintMarks />
                        {t('Сохранить')}
                    </Button>
                </UserAccessValidator>
                {!isSelf && (
                    <Button
                        type="text"
                        className={cls.ghostButton}
                        loading={isImpersonating}
                        disabled={user.role?.name === 'admin' || Boolean(user.blocked)}
                        onClick={handleImpersonate}
                    >
                        {t('Войти как пользователь')}
                    </Button>
                )}
                {/* Нет в макете: удаление пользователя сохранено */}
                {!isSelf && (
                    <UserAccessValidator accesses={[Accesses.users_can_delete]}>
                        <Button type="text" danger className={cls.ghostButton} onClick={handleDelete}>
                            {t('Удалить пользователя')}
                        </Button>
                    </UserAccessValidator>
                )}
            </div>
        </Blueprint>
    );
};
