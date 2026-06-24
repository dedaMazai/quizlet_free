import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import {
    RoleSelect,
    UserAccessValidator,
    useUserInfo,
    useGetUsersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
} from '@/entities/User';
import type { UserInfo, RoleName } from '@/entities/User';
import { Accesses } from '@/shared/types/accesses';
import { HStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { EmptyState } from '@/shared/ui/EmptyState';
import { buildName } from '@/shared/lib/helpers/buildName';
import { getAvatarSrc } from '@/shared/const/avatars';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';

export const UsersTable = () => {
    const { t } = useTranslation();
    const { message, modal } = useAntdApp();
    const currentUser = useUserInfo();

    const { data: users, isLoading } = useGetUsersQuery();
    const [updateUserRole] = useUpdateUserRoleMutation();
    const [deleteUser] = useDeleteUserMutation();

    const handleRoleChange = async (user: UserInfo, role: RoleName) => {
        try {
            await updateUserRole({ user_uuid: user.uuid, role }).unwrap();
            message.success(t('Роль обновлена'));
        } catch {
            message.error(t('Не удалось изменить роль'));
        }
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
            title: t('Действия'),
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, user) => {
                if (user.uuid === currentUser?.uuid) {
                    return null;
                }
                return (
                    <UserAccessValidator accesses={[Accesses.users_can_delete]}>
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(user)}
                        />
                    </UserAccessValidator>
                );
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [t, currentUser]);

    if (!isLoading && !users?.length) {
        return <EmptyState type="recent" title={t('Пользователи не найдены')} />;
    }

    return (
        <Table<UserInfo>
            rowKey="uuid"
            loading={isLoading}
            columns={columns}
            dataSource={users}
            pagination={false}
        />
    );
};
