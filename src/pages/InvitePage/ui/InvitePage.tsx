import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Link2Off, UserCheck, UserPlus } from 'lucide-react';
import { useAcceptContactInviteMutation, useGetContactInviteInfoQuery } from '@/entities/Contact';
import { RoutePath } from '@/shared/config/router/routePath';
import { useToast } from '@/shared/lib/toast';
import { EmptyState, EmptyStateAlign } from '@/shared/ui/EmptyState';
import { Loader } from '@/shared/ui/Loader';
import cls from './InvitePage.module.scss';

/** Приглашение в контакты по ссылке: подтверждение перед добавлением */
const InvitePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const { token = '' } = useParams<{ token: string }>();
    const { data: invite, isLoading, isError } = useGetContactInviteInfoQuery(token, { skip: !token });
    const [acceptInvite, { isLoading: isAccepting }] = useAcceptContactInviteMutation();

    const toContacts = () => navigate(RoutePath.CONTACTS(), { replace: true });
    const toMain = () => navigate(RoutePath.MAIN(), { replace: true });

    const handleAccept = async () => {
        if (isAccepting) return;
        try {
            await acceptInvite(token).unwrap();
            toast.success(t('Контакт добавлен'));
            toContacts();
        } catch (err) {
            const text = (err as { error?: string })?.error;
            toast.error(text ? t(text) : t('Не удалось принять приглашение'));
        }
    };

    const renderContent = () => {
        if (isLoading) return <Loader />;

        if (isError || !invite) {
            return (
                <EmptyState
                    icon={Link2Off}
                    kicker={t('Приглашение')}
                    title={t('Приглашение недействительно или устарело')}
                    description={t('Попросите прислать новую ссылку.')}
                    primary={{ label: t('На главную'), onClick: toMain }}
                    align={EmptyStateAlign.CENTER}
                />
            );
        }

        if (invite.is_self) {
            return (
                <EmptyState
                    icon={UserPlus}
                    kicker={t('Приглашение')}
                    title={t('Это ваше собственное приглашение')}
                    description={t('Отправьте ссылку тому, кого хотите добавить в контакты.')}
                    primary={{ label: t('К контактам'), onClick: toContacts }}
                    align={EmptyStateAlign.CENTER}
                />
            );
        }

        if (invite.is_contact) {
            return (
                <EmptyState
                    icon={UserCheck}
                    kicker={t('Приглашение')}
                    title={t('{{name}} уже в ваших контактах', { name: invite.inviter_name })}
                    primary={{ label: t('К контактам'), onClick: toContacts }}
                    align={EmptyStateAlign.CENTER}
                />
            );
        }

        return (
            <EmptyState
                icon={UserPlus}
                kicker={t('Приглашение')}
                title={t('{{name}} приглашает вас в контакты', { name: invite.inviter_name })}
                description={t('Контакты делятся колодами друг с другом без ввода почты.')}
                primary={{ label: t('Добавить в контакты'), onClick: handleAccept }}
                secondary={{ label: t('Не сейчас'), onClick: toMain }}
                align={EmptyStateAlign.CENTER}
            />
        );
    };

    return <div className={cls.InvitePage}>{renderContent()}</div>;
};

export default InvitePage;
