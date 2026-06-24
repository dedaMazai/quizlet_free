import {
    ChangeEvent, FC, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
    Avatar, Button, Input, InputNumber, Select, Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    DeleteOutlined,
    LockOutlined,
    SearchOutlined,
    UnlockOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    RoleSelect,
    UserAccessValidator,
    useUserInfo,
    useGetUsersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
    useSetUserBlockedMutation,
    useSetUserAiLimitMutation,
} from '@/entities/User';
import type { UserInfo, RoleName } from '@/entities/User';
import { Accesses } from '@/shared/types/accesses';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { EmptyState } from '@/shared/ui/EmptyState';
import { StatusTag } from '@/shared/ui/StatusTag';
import { buildName } from '@/shared/lib/helpers/buildName';
import { getAvatarSrc } from '@/shared/const/avatars';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';

type BlockStatusFilter = 'all' | 'active' | 'blocked';

interface AiLimitCellProps {
    value: number;
    onCommit: (value: number) => void;
}

// Inline-редактирование лимита ИИ: коммитим только при потере фокуса/Enter, чтобы не дёргать мутацию.
const AiLimitCell: FC<AiLimitCellProps> = ({ value, onCommit }) => {
    const [local, setLocal] = useState<number | null>(value);

    const commit = () => {
        if (local === null || local === value) {
            return;
        }
        onCommit(local);
    };

    return (
        <InputNumber
            min={0}
            max={25}
            value={local}
            onChange={setLocal}
            onBlur={commit}
            onPressEnter={commit}
            style={{ width: '100%' }}
        />
    );
};

export const UsersTable = () => {
    const { t } = useTranslation();
    const { message, modal } = useAntdApp();
    const currentUser = useUserInfo();

    const { data: users, isLoading } = useGetUsersQuery();
    const [updateUserRole] = useUpdateUserRoleMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [setUserBlocked] = useSetUserBlockedMutation();
    const [setUserAiLimit] = useSetUserAiLimitMutation();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleName | undefined>();
    const [statusFilter, setStatusFilter] = useState<BlockStatusFilter>('all');

    const applyDebouncedSearch = useDebounce(setDebouncedSearch, 300);
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        applyDebouncedSearch(e.target.value);
    };

    const statusOptions = useMemo(() => [
        { value: 'all' as const, label: t('Все статусы') },
        { value: 'active' as const, label: t('Активные') },
        { value: 'blocked' as const, label: t('Заблокированные') },
    ], [t]);

    const filteredUsers = useMemo(() => {
        const query = debouncedSearch.trim().toLowerCase();

        return (users ?? []).filter((user) => {
            if (roleFilter && user.role?.name !== roleFilter) {
                return false;
            }
            if (statusFilter === 'blocked' && !user.blocked) {
                return false;
            }
            if (statusFilter === 'active' && user.blocked) {
                return false;
            }
            if (query) {
                const fio = buildName({
                    surname: user.surname,
                    name: user.name,
                    middle_name: user.middle_name,
                    language: currentUser?.language,
                }).toLowerCase();
                if (!fio.includes(query) && !user.email.toLowerCase().includes(query)) {
                    return false;
                }
            }
            return true;
        });
    }, [users, roleFilter, statusFilter, debouncedSearch, currentUser?.language]);

    const handleRoleChange = async (user: UserInfo, role: RoleName) => {
        try {
            await updateUserRole({ user_uuid: user.uuid, role }).unwrap();
            message.success(t('Роль обновлена'));
        } catch {
            message.error(t('Не удалось изменить роль'));
        }
    };

    const handleAiLimitChange = async (user: UserInfo, ai_limit: number) => {
        try {
            await setUserAiLimit({ user_uuid: user.uuid, ai_limit }).unwrap();
            message.success(t('Лимит обновлён'));
        } catch {
            message.error(t('Не удалось изменить лимит'));
        }
    };

    const handleToggleBlock = (user: UserInfo) => {
        const blocking = !user.blocked;
        modal.confirm({
            title: blocking ? t('Заблокировать пользователя') : t('Разблокировать пользователя'),
            content: blocking
                ? t('Пользователь {{name}} не сможет войти в систему.', { name: user.email })
                : t('Пользователь {{name}} снова сможет войти в систему.', { name: user.email }),
            okText: blocking ? t('Заблокировать') : t('Разблокировать'),
            okButtonProps: { danger: blocking },
            cancelText: t('Отмена'),
            onOk: async () => {
                try {
                    await setUserBlocked({ user_uuid: user.uuid, blocked: blocking }).unwrap();
                    message.success(blocking
                        ? t('Пользователь заблокирован')
                        : t('Пользователь разблокирован'));
                } catch {
                    message.error(t('Не удалось изменить статус блокировки'));
                }
            },
        });
    };

    const handleDelete = (user: UserInfo) => {
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
                    message.success(t('Пользователь удалён'));
                } catch {
                    message.error(t('Не удалось удалить пользователя'));
                }
            },
        });
    };

    const columns = useMemo<ColumnsType<UserInfo>>(() => [
        {
            title: t('Пользователь'),
            key: 'name',
            render: (_, user) => (
                <HStack gap="12" align="center">
                    <Avatar src={getAvatarSrc(user.avatar)} icon={<UserOutlined />} />
                    <MyTypography.Base>
                        {buildName({
                            surname: user.surname,
                            name: user.name,
                            middle_name: user.middle_name,
                            language: currentUser?.language,
                        }) || user.email}
                    </MyTypography.Base>
                </HStack>
            ),
        },
        {
            title: t('E-mail'),
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: t('Роль'),
            key: 'role',
            width: 200,
            render: (_, user) => {
                const isSelf = user.uuid === currentUser?.uuid;
                return (
                    <UserAccessValidator accesses={[Accesses.users_can_update]} skip={isSelf}>
                        <RoleSelect
                            value={user.role?.name}
                            disabled={isSelf}
                            style={{ width: '100%' }}
                            onChange={(role) => handleRoleChange(user, role)}
                        />
                    </UserAccessValidator>
                );
            },
        },
        {
            title: t('Лимит ИИ'),
            key: 'ai_limit',
            width: 140,
            render: (_, user) => {
                if (user.role?.name === 'admin') {
                    return <MyTypography.Base type="secondary">{t('Без лимита')}</MyTypography.Base>;
                }
                return (
                    <UserAccessValidator accesses={[Accesses.users_can_update]}>
                        <AiLimitCell
                            value={user.ai_limit ?? 5}
                            onCommit={(value) => handleAiLimitChange(user, value)}
                        />
                    </UserAccessValidator>
                );
            },
        },
        {
            title: t('Статус'),
            key: 'status',
            width: 140,
            render: (_, user) => (user.blocked
                ? <StatusTag variant="warning">{t('Заблокирован')}</StatusTag>
                : <StatusTag variant="success">{t('Активен')}</StatusTag>),
        },
        {
            title: t('Действия'),
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, user) => {
                if (user.uuid === currentUser?.uuid) {
                    return null;
                }
                return (
                    <HStack gap="4" justify="center">
                        <UserAccessValidator accesses={[Accesses.users_can_update]}>
                            <Button
                                type="text"
                                title={user.blocked ? t('Разблокировать') : t('Заблокировать')}
                                icon={user.blocked ? <UnlockOutlined /> : <LockOutlined />}
                                onClick={() => handleToggleBlock(user)}
                            />
                        </UserAccessValidator>
                        <UserAccessValidator accesses={[Accesses.users_can_delete]}>
                            <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(user)}
                            />
                        </UserAccessValidator>
                    </HStack>
                );
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [t, currentUser]);

    if (!isLoading && !users?.length) {
        return <EmptyState type="recent" title={t('Пользователи не найдены')} />;
    }

    return (
        <VStack max gap="16">
            <HStack max gap="8" wrap align="start">
                <Input
                    placeholder={t('Поиск по ФИО или e-mail')}
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={handleSearchChange}
                    allowClear
                    style={{ width: 280 }}
                />
                <RoleSelect
                    placeholder={t('Все роли')}
                    value={roleFilter}
                    onChange={setRoleFilter}
                    allowClear
                    style={{ width: 180 }}
                />
                <Select<BlockStatusFilter>
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    style={{ width: 180 }}
                />
            </HStack>

            <Table<UserInfo>
                style={{ width: '100%' }}
                rowKey="uuid"
                loading={isLoading}
                columns={columns}
                dataSource={filteredUsers}
                pagination={false}
                locale={{
                    emptyText: <EmptyState type="search" title={t('Пользователи не найдены')} />,
                }}
            />
        </VStack>
    );
};
