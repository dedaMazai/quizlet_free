import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Typography } from 'antd';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useUserInfo } from '@/entities/User';
import { useGetStudyOverviewQuery } from '@/entities/Statistics';
import { buildName } from '@/shared/lib/helpers/buildName';
import { MyTypography } from '@/shared/ui/MyTypography';
import { EmptyState } from '@/shared/ui/EmptyState';
import { AccuracyTimeCards } from '@/widgets/AccuracyTimeCards';
import { StreakHeatmap } from '@/widgets/StreakHeatmap';
import { MasteryChart } from '@/widgets/MasteryChart';
import { DeckProgressList } from '@/widgets/DeckProgressList';

const ProfilePage = () => {
    const { t } = useTranslation();
    const user = useUserInfo();

    const userPhoto = user?.avatar_file?.url;

    const tz = useMemo(
        () => user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        [user?.timezone],
    );

    const { data: overview } = useGetStudyOverviewQuery(tz);
    const hasData = (overview?.totalAnswers ?? 0) > 0;

    const fields = [
        { label: t('E-mail'), value: user?.email || '—' },
        { label: t('Телефон'), value: user?.tel || '—' },
        { label: t('Роль'), value: user?.role?.name || '—' },
    ];

    return (
        <VStack max gap="24">
            <Typography.Title level={1}>
                {user
                    ? buildName({
                        surname: user.surname,
                        name: user.name,
                        middle_name: user.middle_name,
                        language: user.language,
                    })
                    : t('Личный кабинет')}
            </Typography.Title>
            <Card style={{ width: '100%' }} variant="borderless">
                <HStack max gap="24" wrap align="start">
                    {userPhoto ? (
                        <img
                            width={200}
                            height={200}
                            style={{ borderRadius: 6, objectFit: 'cover' }}
                            src={userPhoto}
                            alt=""
                        />
                    ) : (
                        <Avatar
                            style={{ flexShrink: 0 }}
                            shape="square"
                            size={200}
                            icon={<UserOutlined />}
                        />
                    )}
                    <HStack gap="12" wrap align="start">
                        {fields.map(({ label, value }) => (
                            <VStack style={{ width: 232 }} key={label}>
                                <MyTypography.Base type="secondary">{label}:</MyTypography.Base>
                                <MyTypography.Base>{value}</MyTypography.Base>
                            </VStack>
                        ))}
                    </HStack>
                </HStack>
            </Card>

            <Typography.Title level={2}>{t('Статистика')}</Typography.Title>
            {hasData ? (
                <VStack max gap="24">
                    <AccuracyTimeCards tz={tz} />
                    <StreakHeatmap tz={tz} />
                    <HStack max gap="32" wrap align="start">
                        <MasteryChart />
                        <DeckProgressList tz={tz} />
                    </HStack>
                </VStack>
            ) : (
                <EmptyState
                    type="recent"
                    title={t('Пока нет данных для статистики')}
                    description={t('Пройдите заучивание, чтобы увидеть свой прогресс')}
                />
            )}
        </VStack>
    );
};

export default ProfilePage;
