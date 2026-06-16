import { useTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Typography } from 'antd';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useUserInfo } from '@/entities/User';
import { buildName } from '@/shared/lib/helpers/buildName';
import { MyTypography } from '@/shared/ui/MyTypography';

const ProfilePage = () => {
    const { t } = useTranslation();
    const user = useUserInfo();

    const userPhoto = user?.avatar_file?.url;

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
        </VStack>
    );
};

export default ProfilePage;
