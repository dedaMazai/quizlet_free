 
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { memo, useMemo, useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { buildName } from '@/shared/lib/helpers/buildName';
import { useGetUsersSearchQuery } from '../model/api/userApi';
import { useUserInfo } from '../model/selectors/getUserData';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { UserInfo } from '../model/types/user';

interface UserSelectProps {
    placeholder?: string;
    id?: string;
    maxTagTextLength?: number ;
    value?: string | string[];
    disabled?: boolean;
    onChange?: (value: string | string[]) => void;
    onSetSelected?: (value: UserInfo | UserInfo[] | undefined) => void;
    style?: React.CSSProperties;
    mode?: 'multiple' | 'tags';
    maxTagCount?: number | "responsive";
    autoSelectCurrentUser?: boolean;
    allowClear?: boolean;
    pageSize?: number; // Размер страницы для пагинации
    minSearchLength?: number; // Минимальное количество символов для поиска
}

export const UserSelect = memo((props: UserSelectProps) => {
    const {
        id,
        value,
        onChange,
        onSetSelected,
        style,
        placeholder,
        mode,
        disabled,
        maxTagTextLength,
        maxTagCount,
        autoSelectCurrentUser,
        allowClear,
        pageSize = 10, // По умолчанию 10 пользователей на страницу
        minSearchLength, // Минимальное количество символов для поиска
    } = props;

    const { t } = useTranslation();
    const userInfo = useUserInfo();

    const [currentPage, setCurrentPage] = useState(1);
    const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [_searchValue, searchValueDebounced, _setSearchValue, debounceSearchValue] = useDebounceState('');
    
    // Ref для отслеживания последнего обработанного запроса
    const lastProcessedQuery = useRef<string>('');

    const searchParams = useMemo(() => {
        if (!searchValueDebounced || (minSearchLength && searchValueDebounced.length < minSearchLength)) return {};

        return {
            query: searchValueDebounced,
        };
    }, [searchValueDebounced, minSearchLength]);

    // Сброс при изменении поискового запроса или фильтров (должен быть ПЕРЕД запросом)
    useLayoutEffect(() => {
        setCurrentPage(1);
        setAllUsers([]);
        setHasMore(true);
        lastProcessedQuery.current = '';
    }, []);

    const { data: usersResponse, isFetching } = useGetUsersSearchQuery({
        limit: pageSize,
        page: currentPage,
        ...searchParams,
    });

    // Обновление списка пользователей при получении новых данных
    useEffect(() => {
        if (usersResponse?.objects) {
            // Создаем уникальный ключ для текущего запроса
            const queryKey = `
            ${JSON.stringify(searchParams)}_
            ${currentPage}
            `;

            // Проверяем, не обрабатывали ли мы уже этот запрос
            if (lastProcessedQuery.current === queryKey || isFetching) {
                return;
            }

            lastProcessedQuery.current = queryKey;

            if (currentPage === 1) {
                // Первая страница - заменяем весь список
                setAllUsers(usersResponse.objects);
            } else {
                // Последующие страницы - добавляем к существующему списку, избегая дублирования
                setAllUsers(prev => {
                    const existingIds = new Set(prev.map((user: UserInfo) => user.uuid));
                    const newUsers = usersResponse.objects.filter((user: UserInfo) => !existingIds.has(user.uuid));
                    return [...prev, ...newUsers];
                });
            }

            // Проверяем, есть ли еще данные для загрузки
            const totalLoaded = currentPage * pageSize;
            setHasMore(totalLoaded < (usersResponse.total || 0));
        }
    }, [
        currentPage,
        isFetching,
        pageSize,
        searchParams,
        usersResponse?.objects,
        usersResponse?.total,
    ]);

    // Добавление текущего пользователя, если он отсутствует в списке (для Customer роли)
    useEffect(() => {
        if (userInfo?.uuid && autoSelectCurrentUser) {
            setAllUsers(prev => {
                const existingIds = new Set(prev.map((user: UserInfo) => user.uuid));

                // Если текущий пользователь не найден в списке, добавляем его
                if (!existingIds.has(userInfo.uuid)) {
                    return [...prev, userInfo];
                }

                return prev;
            });
        }
    }, [userInfo, autoSelectCurrentUser]);

    const options = useMemo(() => allUsers?.map((user: UserInfo) => ({
        value: user.uuid,
        label: `${buildName({
            surname: user.surname,
            name: user.name,
            middle_name: user.middle_name,
            language: userInfo?.language,
        })}`,
    })), [userInfo?.language, allUsers]);

    const normalizeOptions = useMemo(() => allUsers.reduce((acc: Record<string, UserInfo & { label: string }>, user: UserInfo) => {
        acc[user.uuid] = {
            ...user,
            label: `${buildName({
                surname: user.surname,
                name: user.name,
                middle_name: user.middle_name,
                language: userInfo?.language,
            })}`,
        };
        return acc;
    }, {}), [allUsers, userInfo?.language]);

    const onNumberChange = (val: string | string[]) => {
        onChange?.(val);

        if (Array.isArray(val)) {
            const currentUsers = val.map(id => normalizeOptions[id]);
            onSetSelected?.(currentUsers);
        } else {
            const currentUser = normalizeOptions[val];
            onSetSelected?.(currentUser);
        }
    };

    // Обработчик поиска
    const handleSearch = useCallback((value: string) => {
        debounceSearchValue(value);
    }, [debounceSearchValue]);

    // Обработчик потери фокуса - сбрасываем поиск если поле пустое
    const handleBlur = useCallback(() => {
        setCurrentPage(1);
    }, []);

        // Обработчик прокрутки для подгрузки данных
    const handlePopupScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { target } = e;
        const element = target as HTMLDivElement;

        // Проверяем, достиг ли пользователь конца списка
        // Увеличиваем порог для более надежной работы с колесиком мыши
        const threshold = 20;
        const { scrollTop, scrollHeight, clientHeight } = element;

        // Дополнительная проверка: если прокрутили больше 90% от общей высоты
        const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        const isScrolledEnough = scrollPercentage >= 0.9;

        if ((isNearBottom || isScrolledEnough) && hasMore && !isFetching) {
            setCurrentPage(prev => prev + 1);
        }
    }, [hasMore, isFetching]);

    useEffect(() => {
        if (autoSelectCurrentUser && !value && userInfo?.uuid && allUsers?.length > 0) {
            // Проверяем, что текущий пользователь есть в списке доступных пользователей
            const currentUserInList = allUsers.find((user: UserInfo) => user.uuid === userInfo.uuid);
            if (currentUserInList) {
                onChange?.(userInfo.uuid);

                const currentUser = normalizeOptions[userInfo.uuid];
                onSetSelected?.(currentUser);
            }
        }
    }, [autoSelectCurrentUser, value, userInfo?.uuid, allUsers, onChange, onSetSelected, normalizeOptions]);

    return (
        <Select
            id={id}
            maxTagCount={maxTagCount}
            maxTagTextLength={maxTagTextLength}
            value={value}
            onChange={onNumberChange}
            style={style}
            placeholder={placeholder}
            options={options}
            mode={mode}
            disabled={disabled}
            showSearch={{
                onSearch: handleSearch,
                filterOption: false, // Отключаем клиентскую фильтрацию, используем серверную
            }}
            allowClear={allowClear}
            loading={isFetching && currentPage === 1}
            onBlur={handleBlur}
            onPopupScroll={handlePopupScroll}
            notFoundContent={(() => {
                if (isFetching && currentPage === 1) {
                    return t('Загрузка...');
                }
                if (searchValueDebounced && minSearchLength && searchValueDebounced.length < minSearchLength) {
                    return t(`Введите минимум ${minSearchLength} символа для поиска`);
                }
                return t('Пользователи не найдены');
            })()}
            popupRender={(menu) => (
                <div>
                    {menu}
                    {isFetching && currentPage > 1 && (
                        <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {t('Загрузка...')}
                        </div>
                    )}
                    {!hasMore && allUsers.length > 0 && (
                        <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {t('Все пользователи загружены')}
                        </div>
                    )}
                </div>
            )}
        />
    );
});
