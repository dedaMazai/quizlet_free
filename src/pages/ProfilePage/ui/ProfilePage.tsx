import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Tag, Typography } from 'antd';
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
import cls from './ProfilePage.module.scss';

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

    const fullName = user
        ? buildName({
            surname: user.surname,
            name: user.name,
            middle_name: user.middle_name,
            language: user.language,
        })
        : '';

    const contacts = [
        { icon: <MailOutlined />, value: user?.email },
        { icon: <PhoneOutlined />, value: user?.tel },
    ];

    return (
        <VStack max gap="24">
            <Typography.Title level={1}>{t('Личный кабинет')}</Typography.Title>

            <Card className={cls.headerCard} variant="borderless">
                <div className={cls.header}>
                    {userPhoto ? (
                        <img className={cls.avatar} src={userPhoto} alt="" />
                    ) : (
                        <Avatar
                            className={cls.avatar}
                            shape="square"
                            size={96}
                            icon={<UserOutlined />}
                        />
                    )}
                    <VStack gap="8" className={cls.headerInfo}>
                        <HStack gap="12" wrap align="center">
                            <Typography.Title level={2} className={cls.name}>
                                {fullName || t('Личный кабинет')}
                            </Typography.Title>
                            {user?.role?.name && (
                                <Tag color="processing" className={cls.roleTag}>
                                    {user.role.name}
                                </Tag>
                            )}
                        </HStack>
                        <HStack gap="24" wrap align="center">
                            {contacts.map(({ icon, value }, i) => (
                                <HStack gap="8" align="center" key={i}>
                                    <span className={cls.contactIcon}>{icon}</span>
                                    <MyTypography.Base>{value || '—'}</MyTypography.Base>
                                </HStack>
                            ))}
                        </HStack>
                    </VStack>
                </div>
            </Card>

            <Typography.Title level={2}>{t('Статистика')}</Typography.Title>
            {hasData ? (
                <VStack max gap="24">
                    <AccuracyTimeCards tz={tz} />
                    <StreakHeatmap tz={tz} />
                    <div className={cls.chartsGrid}>
                        <MasteryChart />
                        <DeckProgressList tz={tz} />
                    </div>
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
