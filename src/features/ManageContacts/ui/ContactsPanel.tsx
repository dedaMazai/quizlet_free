import { FC, memo, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from 'antd';
import { Copy, RefreshCw } from 'lucide-react';
import {
    Contact,
    ContactLabel,
    ContactRequest,
    useGetContactInviteQuery,
    useGetContactRequestsQuery,
    useGetContactsQuery,
    useRemoveContactMutation,
    useRenewContactInviteMutation,
    useRequestContactMutation,
    useRespondContactRequestMutation,
    useSetContactLabelMutation,
    useContactLabelOptions,
} from '@/entities/Contact';
import { UserAvatar } from '@/entities/User';
import { RoutePath } from '@/shared/config/router/routePath';
import { formatDate } from '@/shared/lib/formatters';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useCopyToClipboard } from '@/shared/lib/hooks/useCopyToClipboard';
import { useToast } from '@/shared/lib/toast';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Loader } from '@/shared/ui/Loader';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import cls from './ContactsPanel.module.scss';

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;
// Достаточная проверка формата: есть ли такой аккаунт, сервер не сообщает
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SectionProps {
    title: string;
    children: ReactNode;
}

const Section: FC<SectionProps> = ({ title, children }) => (
    <section className={cls.section}>
        <SectionHeader className={cls.sectionHeader} size={SectionHeaderSize.SM} title={title} />
        {children}
    </section>
);

interface PersonProps {
    person: Pick<Contact, 'name' | 'email' | 'avatar'>;
    actions: ReactNode;
}

const Person: FC<PersonProps> = ({ person, actions }) => (
    <div className={cls.person}>
        <UserAvatar user={{ ...person, name: person.name ?? '' }} />
        <div className={cls.personText}>
            <span className={cls.name}>{person.name || person.email}</span>
            {person.name && <span className={cls.email}>{person.email}</span>}
        </div>
        <div className={cls.personActions}>{actions}</div>
    </div>
);

/** Ссылка-приглашение: кто откроет и подтвердит — попадёт в контакты */
const InviteSection = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { data: invite, isLoading } = useGetContactInviteQuery();
    const [renewInvite, { isLoading: isRenewing }] = useRenewContactInviteMutation();
    const [, copy] = useCopyToClipboard();
    const url = invite ? `${window.location.origin}${RoutePath.INVITE(invite.token)}` : '';

    const handleCopy = async () => {
        if (await copy(url)) toast.success(t('Ссылка скопирована'));
    };

    const handleRenew = async () => {
        try {
            await renewInvite().unwrap();
            toast.success(t('Старая ссылка больше не работает'));
        } catch {
            toast.error(t('Не удалось обновить ссылку'));
        }
    };

    return (
        <Section title={t('Пригласить по ссылке')}>
            <div className={cls.formRow}>
                <Input className={cls.input} value={url} readOnly disabled={isLoading} />
                <Button
                    type="primary"
                    className={cls.button}
                    disabled={!url}
                    icon={<Copy aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    onClick={handleCopy}
                >
                    <BlueprintMarks />
                    {t('Копировать')}
                </Button>
            </div>
            <div className={cls.noteRow}>
                <span className={cls.note}>
                    {invite
                        ? t('Отправьте ссылку другу или ученикам. Действует до {{date}}.', { date: formatDate(invite.expires_at) })
                        : t('Отправьте ссылку другу или ученикам.')}
                </span>
                <Button
                    type="link"
                    className={cls.linkButton}
                    loading={isRenewing}
                    icon={<RefreshCw aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    onClick={handleRenew}
                >
                    {t('Новая ссылка')}
                </Button>
            </div>
        </Section>
    );
};

/** Запрос по email. Ответ всегда один: существование аккаунта не раскрывается */
const RequestSection = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [requestContact, { isLoading }] = useRequestContactMutation();
    const trimmedEmail = email.trim();
    const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);

    const handleRequest = async () => {
        if (!isEmailValid) return;
        try {
            await requestContact(trimmedEmail).unwrap();
            toast.success(t('Если такой пользователь есть, он получит запрос'));
            setEmail('');
        } catch (err) {
            const text = (err as { error?: string })?.error;
            toast.error(text ? t(text) : t('Не удалось отправить запрос'));
        }
    };

    return (
        <Section title={t('Добавить по email')}>
            <div className={cls.formRow}>
                <Input
                    className={cls.input}
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onPressEnter={handleRequest}
                    placeholder={t('Почта пользователя Zubrika')}
                    allowClear
                />
                <Button
                    className={cls.button}
                    loading={isLoading}
                    disabled={!isEmailValid}
                    onClick={handleRequest}
                >
                    {t('Отправить запрос')}
                </Button>
            </div>
            <span className={cls.note}>
                {t('Человек увидит запрос в уведомлениях и сможет его принять. Мы не сообщаем, есть ли аккаунт с таким адресом.')}
            </span>
        </Section>
    );
};

interface RequestsSectionProps {
    requests: ContactRequest[];
}

const RequestsSection: FC<RequestsSectionProps> = ({ requests }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [respond, { isLoading, originalArgs }] = useRespondContactRequestMutation();

    const handleRespond = async (id: string, accept: boolean) => {
        try {
            await respond({ id, accept }).unwrap();
            if (accept) toast.success(t('Контакт добавлен'));
        } catch (err) {
            const text = (err as { error?: string })?.error;
            toast.error(text ? t(text) : t('Не удалось ответить на запрос'));
        }
    };

    return (
        <Section title={t('Запросы · {{count}}', { count: requests.length })}>
            {requests.map((request) => {
                const busy = isLoading && originalArgs?.id === request.id;
                return (
                    <Person
                        key={request.id}
                        person={request}
                        actions={(
                            <>
                                <Button type="primary" size="small" loading={busy && originalArgs?.accept} disabled={busy} onClick={() => handleRespond(request.id, true)}>
                                    {t('Принять')}
                                </Button>
                                <Button size="small" loading={busy && !originalArgs?.accept} disabled={busy} onClick={() => handleRespond(request.id, false)}>
                                    {t('Отклонить')}
                                </Button>
                            </>
                        )}
                    />
                );
            })}
        </Section>
    );
};

const ContactsSection = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { modal } = useAntdApp();
    const labelOptions = useContactLabelOptions();
    const { data: contacts, isLoading } = useGetContactsQuery();
    const [setLabel] = useSetContactLabelMutation();
    const [removeContact] = useRemoveContactMutation();

    const handleLabel = async (id: string, label?: ContactLabel) => {
        try {
            await setLabel({ id, label: label ?? null }).unwrap();
        } catch {
            toast.error(t('Не удалось изменить метку'));
        }
    };

    const handleRemove = (contact: Contact) => {
        modal.confirm({
            title: t('Удалить {{name}} из контактов?', { name: contact.name || contact.email }),
            content: t('Доступ к общим колодам сохранится — его можно закрыть в настройках доступа колоды.'),
            okText: t('Удалить'),
            okButtonProps: { danger: true },
            cancelText: t('Отмена'),
            onOk: async () => {
                try {
                    await removeContact(contact.id).unwrap();
                } catch {
                    toast.error(t('Не удалось удалить контакт'));
                }
            },
        });
    };

    return (
        <Section title={t('Контакты · {{count}}', { count: contacts?.length ?? 0 })}>
            {isLoading && <Loader />}
            {!isLoading && !contacts?.length && (
                <span className={cls.empty}>
                    {t('Пока никого. Пригласите по ссылке или отправьте запрос по email — потом сможете делиться колодами в пару кликов.')}
                </span>
            )}
            {contacts?.map((contact) => (
                <Person
                    key={contact.id}
                    person={contact}
                    actions={(
                        <>
                            <Select
                                className={cls.labelSelect}
                                size="small"
                                value={contact.label}
                                options={labelOptions}
                                placeholder={t('Без метки')}
                                allowClear
                                onChange={(value?: ContactLabel) => handleLabel(contact.id, value)}
                            />
                            <Button type="link" danger className={cls.linkButton} onClick={() => handleRemove(contact)}>
                                {t('Удалить')}
                            </Button>
                        </>
                    )}
                />
            ))}
        </Section>
    );
};

/** Контакты: с ними можно делиться колодами, выбирая из списка, а не вводя email */
export const ContactsPanel = memo(() => {
    const { data: requests } = useGetContactRequestsQuery();

    return (
        <div className={cls.ContactsPanel}>
            {Boolean(requests?.length) && <RequestsSection requests={requests ?? []} />}
            <ContactsSection />
            <InviteSection />
            <RequestSection />
        </div>
    );
});

ContactsPanel.displayName = 'ContactsPanel';
