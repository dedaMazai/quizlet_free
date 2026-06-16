import { useTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Typography } from 'antd';
import { useParams } from 'react-router';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useGetUserQuery, useUserInfo } from '@/entities/User';
import { buildName } from '@/shared/lib/helpers/buildName';
import { GENDER } from '@/shared/const/const';
import { MyTypography } from '@/shared/ui/MyTypography';
import { formatDateTime } from '@/shared/lib/formatters';

const UserPage = () => {
    const { t } = useTranslation();
    const userInfo = useUserInfo();
    const { id_user: userUuid } = useParams();

    const { data: user } = useGetUserQuery(userUuid!, {
        skip: !userUuid,
    });

    const userPhoto = user?.avatar_file?.url;

    if (!userUuid) {
        return null;
    }

    return (
        <VStack max gap="24">
        {user && (
                <Typography.Title level={1}>
                    {buildName({
                        surname: user.surname,
                        name: user.name,
                        middle_name: user.middle_name,
                        language: userInfo?.language,
                    })}
                </Typography.Title>
        )}
            <Card style={{ width: '100%' }} variant="borderless">
                <VStack max gap="24">
                    <HStack
                        max
                        gap="24"
                        wrap
                        justify='between'
                        align='start'
                    >
                        {userPhoto ? (
                            <img
                                width={200}
                                height={200}
                                style={{
                                    borderRadius: 6,
                                    objectFit: 'cover',
                                }}
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
                    </HStack>
                    <VStack max gap="6">
                        <HStack max justify="between" wrap>
                            <Typography.Title level={5}>
                                {t('Общее')}
                            </Typography.Title>
                        </HStack>
                        <HStack max wrap gap='12'>
                            {
                                [
                                    {
                                        label: t('Телефон'),
                                        value: user?.tel || '—',
                                    },
                                    {
                                        label: t('E-mail'),
                                        value: user?.email || '—',
                                    },
                                    {
                                        label: t('Пол'),
                                        value: user?.gender ? t(GENDER[user?.gender]) : '—',
                                    },
                                    {
                                        label: t('Роль'),
                                        value: user?.role?.name || '—',
                                    },
                                    {
                                        label: t('Последний сеанс'),
                                        value: user?.last_signed_in_at ? formatDateTime(user?.last_signed_in_at) : '—',
                                    },
                                ].map(({ label, value }, index) => (
                                    <VStack style={{ width: 232 }} key={index}>
                                        <MyTypography.Base type="secondary">
                                            {label}:
                                        </MyTypography.Base>
                                        <MyTypography.Base>
                                            {value}
                                        </MyTypography.Base>
                                    </VStack>
                                ))
                            }
                        </HStack>
                    </VStack>
                </VStack>
            </Card>
        </VStack>
    );
};

export default UserPage;
