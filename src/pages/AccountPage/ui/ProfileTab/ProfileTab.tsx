import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    EditOutlined, MailOutlined, PhoneOutlined, UserOutlined,
} from '@ant-design/icons';
import {
    Avatar, Button, Card, Tag, Typography,
} from 'antd';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useUserInfo, ROLE_NAMES } from '@/entities/User';
import { buildName } from '@/shared/lib/helpers/buildName';
import { getAvatarSrc } from '@/shared/const/avatars';
import { MyTypography } from '@/shared/ui/MyTypography';
import { EditProfileModal } from '@/features/EditProfile';
import cls from './ProfileTab.module.scss';

export const ProfileTab = memo(() => {
    const { t } = useTranslation();
    const user = useUserInfo();
    const [editOpen, setEditOpen] = useState(false);

    const userPhoto = getAvatarSrc(user?.avatar);

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
            <HStack max justify="end">
                <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
                    {t('Редактировать')}
                </Button>
            </HStack>

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
                                    {t(ROLE_NAMES[user.role.name])}
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
                        {user?.description && (
                            <MyTypography.Base type="secondary">
                                {user.description}
                            </MyTypography.Base>
                        )}
                    </VStack>
                </div>
            </Card>

            <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
        </VStack>
    );
});

ProfileTab.displayName = 'ProfileTab';
