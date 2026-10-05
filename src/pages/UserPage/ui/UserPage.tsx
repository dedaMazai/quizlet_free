import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChartNoAxesColumn, UserX } from 'lucide-react';
import { useGetUserQuery } from '@/entities/User';
import { StatsPeriod, useGetStudyOverviewQuery } from '@/entities/Statistics';
import { AccuracyTimeCards } from '@/widgets/AccuracyTimeCards';
import { StreakHeatmap } from '@/widgets/StreakHeatmap';
import { MasteryChart } from '@/widgets/MasteryChart';
import { DeckProgressList } from '@/widgets/DeckProgressList';
import { BackBar } from '@/shared/ui/BackBar';
import { BackLink } from '@/shared/ui/BackLink';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Kicker } from '@/shared/ui/Kicker';
import { Loader } from '@/shared/ui/Loader';
import { PageHeader } from '@/shared/ui/PageHeader';
import { getSettingsUsersPath, RoutePath } from '@/shared/config/router/routePath';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './UserPage.module.scss';

/** Пояс по умолчанию на сервере (user_timezone), если пользователь свой не выбрал */
const DEFAULT_TZ = 'Europe/Moscow';

/** «Прогресс» другого пользователя (6.23 только для чтения) — из вкладки «Пользователи» */
const UserPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id_user: userId } = useParams();
    const { isMobile } = useMatchMedia();
    const [period, setPeriod] = useState<StatsPeriod>(StatsPeriod.YEAR);

    const { data: user, isLoading: isUserLoading } = useGetUserQuery(userId!, { skip: !userId });
    const tz = user?.timezone || DEFAULT_TZ;
    const { data: overview, isLoading } = useGetStudyOverviewQuery({ tz, userId }, { skip: !user });
    // Пока сводка грузится, виджеты показывают скелетоны — пустое состояние не мелькает
    const showStats = isLoading || (overview?.totalAnswers ?? 0) > 0;

    if (isUserLoading) return <Loader />;

    if (!user || !userId) {
        return (
            <EmptyState
                icon={UserX}
                kicker={t('Пользователи')}
                title={t('Пользователь не найден')}
                primary={{ label: t('К пользователям'), onClick: () => navigate(getSettingsUsersPath()) }}
            />
        );
    }

    const name = [user.name, user.surname].filter(Boolean).join(' ') || user.email;

    return (
        <div className={cls.UserPage}>
            {isMobile
                ? <BackBar to={getSettingsUsersPath()} label={t('Пользователи')} />
                : (
                    <BackLink
                        items={[
                            { label: t('Аккаунт'), to: RoutePath.PROFILE() },
                            { label: t('Пользователи'), to: getSettingsUsersPath() },
                        ]}
                    />
                )}
            <div className={cls.titleBlock}>
                <Kicker>{`${t('Прогресс')} · ${user.email}`}</Kicker>
                <PageHeader
                    className={cls.header}
                    title={name}
                    extra={showStats && (
                        <BoxSegmented<StatsPeriod>
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { label: isMobile ? t('Нед.') : t('Неделя'), value: StatsPeriod.WEEK },
                                { label: isMobile ? t('Мес.') : t('Месяц'), value: StatsPeriod.MONTH },
                                { label: t('Год'), value: StatsPeriod.YEAR },
                            ]}
                        />
                    )}
                />
            </div>

            {showStats ? (
                <>
                    <AccuracyTimeCards tz={tz} period={period} userId={userId} />
                    <StreakHeatmap tz={tz} userId={userId} />
                    <div className={cls.chartsGrid}>
                        <MasteryChart userId={userId} />
                        {!isMobile && <DeckProgressList tz={tz} userId={userId} />}
                    </div>
                </>
            ) : (
                <EmptyState
                    icon={ChartNoAxesColumn}
                    kicker={t('Прогресс')}
                    title={t('Пользователь ещё не занимался')}
                    description={t('Серия, точность и освоение колод появятся после первых ответов.')}
                />
            )}
        </div>
    );
};

export default UserPage;
