import {
    ChangeEvent, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Select } from 'antd';
import {
    ChevronDown, Search, SearchX, Users,
} from 'lucide-react';
import {
    RoleSelect,
    UserAvatar,
    useUserInfo,
    useGetUsersQuery,
    useGetUsersAiUsageQuery,
} from '@/entities/User';
import type { UserInfo, RoleName } from '@/entities/User';
import { classNames } from '@/shared/lib/classNames/classNames';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import { getUserFullName } from '../lib/getUserFullName';
import { UserDetailsPanel } from './UserDetailsPanel';
import cls from './UsersTable.module.scss';

type BlockStatusFilter = 'all' | 'active' | 'blocked';

const ICON_SIZE = 15;
const CHEVRON_SIZE = 14;
const ICON_STROKE = 1.5;
const DEFAULT_AI_LIMIT = 5;
const SKELETON_ROWS = 7;

/** Пользователи 6.26: поиск, таблица и панель выбранного пользователя */
export const UsersTable = () => {
    const { t } = useTranslation();
    const currentUser = useUserInfo();

    const { data: users, isLoading } = useGetUsersQuery();
    const { data: aiUsage } = useGetUsersAiUsageQuery();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleName | undefined>();
    const [statusFilter, setStatusFilter] = useState<BlockStatusFilter>('all');
    const [selectedId, setSelectedId] = useState<string>();

    const applyDebouncedSearch = useDebounce(setDebouncedSearch, 300);
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        applyDebouncedSearch(e.target.value);
    };

    const resetFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setRoleFilter(undefined);
        setStatusFilter('all');
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
                const fio = [user.surname, user.name, user.middle_name].filter(Boolean).join(' ').toLowerCase();
                if (!fio.includes(query) && !user.email.toLowerCase().includes(query)) {
                    return false;
                }
            }
            return true;
        });
    }, [users, roleFilter, statusFilter, debouncedSearch]);

    // Без явного выбора — первый в списке
    const selectedUser = filteredUsers.find((u) => u.uuid === selectedId) ?? filteredUsers[0];

    const getAiLabel = (user: UserInfo) => (user.role?.name === 'admin'
        ? '∞'
        : `${aiUsage?.[user.uuid] ?? 0}/${user.ai_limit ?? DEFAULT_AI_LIMIT}`);

    if (!isLoading && !users?.length) {
        return (
            <EmptyState
                icon={Users}
                kicker={t('Пользователи')}
                title={t('Пользователи не найдены')}
            />
        );
    }

    return (
        <div className={cls.UsersTable}>
            <div className={cls.main}>
                <div className={cls.toolbar}>
                    <Input
                        className={cls.search}
                        aria-label={t('Имя или почта')}
                        placeholder={t('Имя или почта')}
                        prefix={<Search aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        value={search}
                        onChange={handleSearchChange}
                        allowClear
                    />
                    {/* Нет в макете: фильтры роли и статуса сохранены */}
                    <RoleSelect
                        className={cls.filter}
                        placeholder={t('Все роли')}
                        value={roleFilter}
                        onChange={setRoleFilter}
                        allowClear
                        suffixIcon={<ChevronDown aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />}
                    />
                    <Select<BlockStatusFilter>
                        className={cls.filter}
                        aria-label={t('Статус')}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={statusOptions}
                        suffixIcon={<ChevronDown aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />}
                    />
                </div>

                <div className={cls.table} role="table">
                    <div className={classNames(cls.row, [cls.head])} role="row">
                        <span role="columnheader">{t('Пользователь')}</span>
                        <span role="columnheader">{t('Роль')}</span>
                        <span role="columnheader">{t('Статус')}</span>
                        <span role="columnheader">{t('ИИ')}</span>
                    </div>

                    {isLoading && Array.from({ length: SKELETON_ROWS }, (_, i) => (
                        <Skeleton key={i} className={cls.skeletonRow} />
                    ))}

                    {filteredUsers.map((user) => (
                        <button
                            key={user.uuid}
                            type="button"
                            role="row"
                            aria-selected={user.uuid === selectedUser?.uuid}
                            className={classNames(cls.row, { [cls.selected]: user.uuid === selectedUser?.uuid })}
                            onClick={() => setSelectedId(user.uuid)}
                        >
                            <span className={cls.person} role="cell">
                                <UserAvatar user={user} />
                                <span className={cls.personText}>
                                    <span className={cls.name}>{getUserFullName(user)}</span>
                                    <span className={cls.email}>{user.email}</span>
                                </span>
                            </span>
                            <span className={cls.role} role="cell">
                                {user.role?.name === 'admin' ? t('Админ') : t('Пользователь')}
                            </span>
                            <span className={cls.status} role="cell">
                                <i className={classNames(cls.statusDot, { [cls.blocked]: user.blocked })} />
                                {user.blocked ? t('Заблокирован') : t('Активен')}
                            </span>
                            <span className={cls.ai} role="cell">{getAiLabel(user)}</span>
                        </button>
                    ))}

                    {!isLoading && !filteredUsers.length && (
                        <EmptyState
                            className={cls.empty}
                            icon={SearchX}
                            kicker={t('Ничего не найдено')}
                            title={t('Пользователи не найдены')}
                            primary={{ label: t('Сбросить поиск'), onClick: resetFilters }}
                        />
                    )}
                </div>
            </div>

            {selectedUser && (
                <UserDetailsPanel
                    key={selectedUser.uuid}
                    user={selectedUser}
                    aiUsed={aiUsage?.[selectedUser.uuid] ?? 0}
                    isSelf={selectedUser.uuid === currentUser?.uuid}
                />
            )}
        </div>
    );
};
