import {
    ComponentPropsWithRef, FC, memo, ReactNode, useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Dropdown, MenuProps } from 'antd';
import { ChevronRight } from 'lucide-react';
import { ChangePasswordModal, ProfileForm } from '@/features/EditProfile';
import { DailyGoalSwitcher } from '@/features/DailyGoalSwitcher';
import { useVoiceOptions } from '@/features/VoiceSwitcher';
import { DeleteAccountButton } from '@/features/DeleteAccount';
import { useGetAiUsageQuery } from '@/entities/Card';
import { useGetContactRequestsQuery } from '@/entities/Contact';
import {
    UserAvatar, useGetTelegramLinkQuery, useLogoutMutation, useUserInfo,
} from '@/entities/User';
import { ThemeMode } from '@/shared/const/theme';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useTheme } from '@/shared/lib/hooks/useTheme';
import { isTelegramMiniApp } from '@/shared/lib/telegram';
import { Blueprint } from '@/shared/ui/Blueprint';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { TelegramButton } from '@/shared/ui/TelegramButton';
import cls from './MobileAccount.module.scss';

const CHEVRON_SIZE = 16;
const ICON_STROKE = 1.5;
/** Не больше 30 делений, как в AiQuotaCard: при большом лимите одно деление — несколько запросов */
const MAX_SEGMENTS = 30;
/** Ширина модалки на десктопе — на мобильной ModalFrame рисует шторку */
const PROFILE_MODAL_WIDTH = 720;

enum InterfaceLang {
    RU = 'ru',
    EN = 'en',
}

// Названия языков — на самом языке, не переводятся
const LANG_LABELS: Record<InterfaceLang, string> = {
    [InterfaceLang.RU]: 'Русский',
    [InterfaceLang.EN]: 'English',
};

interface SettingRowProps {
    label: string;
    children: ReactNode;
}

/** Строка настройки с контролом справа */
const SettingRow: FC<SettingRowProps> = ({ label, children }) => (
    <div className={cls.row}>
        <span className={cls.rowLabel}>{label}</span>
        {children}
    </div>
);

interface LinkRowProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
    label: string;
    value?: string;
}

/** Строка-кнопка «подпись · значение ›»; ref и обработчики — для триггера Dropdown */
const LinkRow: FC<LinkRowProps> = ({
    label, value, className, ...rest
}) => (
    // Dropdown передаёт свой className триггеру — объединяем, а не перетираем
    <button type="button" {...rest} className={classNames(cls.row, [className])}>
        <span className={cls.rowLabel}>{label}</span>
        <span className={cls.rowValue}>
            {value}
            <ChevronRight aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />
        </span>
    </button>
);

/** Аккаунт на мобильной (6.56): один экран — профиль, квота ИИ, настройки, выход */
export const MobileAccount = memo(() => {
    const { t, i18n } = useTranslation();
    const user = useUserInfo();
    const [logout] = useLogoutMutation();
    const { data: telegramLink } = useGetTelegramLinkQuery();
    const { mode, setMode } = useTheme();
    const voice = useVoiceOptions();
    const { data: remainingRaw, isLoading } = useGetAiUsageQuery();
    const [profileOpen, setProfileOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const navigate = useNavigate();
    const { data: contactRequests } = useGetContactRequestsQuery();

    const lang = i18n.language === InterfaceLang.EN ? InterfaceLang.EN : InterfaceLang.RU;
    const fullName = [user?.name, user?.surname].filter(Boolean).join(' ') || user?.email;

    // Квота ИИ — как в AiQuotaCard: у admin без лимита
    const unlimited = user?.role?.name === 'admin';
    const limit = user?.ai_limit ?? 0;
    const remaining = Math.max(0, Math.min(remainingRaw ?? limit, limit));

    const segments = useMemo(() => {
        const count = unlimited ? MAX_SEGMENTS : Math.min(Math.max(limit, 1), MAX_SEGMENTS);
        let used = count;
        if (unlimited) used = 0;
        else if (limit) used = Math.round(((limit - remaining) / limit) * count);
        // true — деление ещё доступно
        return Array.from({ length: count }, (_, i) => i >= used);
    }, [unlimited, limit, remaining]);

    const langMenu = useMemo<MenuProps>(() => ({
        items: Object.values(InterfaceLang).map((key) => ({ key, label: LANG_LABELS[key] })),
        selectable: true,
        selectedKeys: [lang],
        onClick: ({ key }) => i18n.changeLanguage(key),
    }), [lang, i18n]);

    const { select: selectVoice } = voice;
    const voiceMenu = useMemo<MenuProps>(() => ({
        items: voice.options.map((option) => ({ key: option.value, label: option.label })),
        selectable: true,
        selectedKeys: voice.activeUri ? [voice.activeUri] : [],
        onClick: ({ key }) => selectVoice(key),
    }), [voice.options, voice.activeUri, selectVoice]);

    const voiceLabel = voice.options.find((option) => option.value === voice.activeUri)?.label;

    const openProfile = useCallback(() => setProfileOpen(true), []);
    const closeProfile = useCallback(() => setProfileOpen(false), []);
    const openPassword = useCallback(() => setPasswordOpen(true), []);
    const closePassword = useCallback(() => setPasswordOpen(false), []);

    return (
        <div className={cls.MobileAccount}>
            <div className={cls.profile}>
                <UserAvatar user={user} className={cls.avatar} />
                <div className={cls.profileText}>
                    <span className={cls.name}>{fullName}</span>
                    <span className={cls.email}>{user?.email}</span>
                </div>
            </div>

            <Blueprint className={cls.quota}>
                <div className={cls.quotaHead}>
                    <Kicker size={KickerSize.SM}>{t('Запросы к ИИ')}</Kicker>
                    <span className={cls.quotaValue}>
                        {unlimited ? '∞' : (isLoading ? '—' : remaining)}
                        {!unlimited && <span className={cls.quotaLimit}>{` / ${limit}`}</span>}
                    </span>
                </div>
                <div className={cls.segments}>
                    {segments.map((left, i) => (
                         
                        <i key={i} className={left ? cls.segmentLeft : cls.segmentUsed} />
                    ))}
                </div>
            </Blueprint>

            <div className={cls.settings}>
                <Kicker size={KickerSize.SM}>{t('Настройки')}</Kicker>
                <SettingRow label={t('Тема')}>
                    <BoxSegmented<ThemeMode>
                        className={cls.compact}
                        value={mode}
                        onChange={setMode}
                        options={[
                            { label: t('Светлая'), value: ThemeMode.LIGHT },
                            { label: t('Тёмная'), value: ThemeMode.DARK },
                            { label: t('Авто'), value: ThemeMode.SYSTEM },
                        ]}
                    />
                </SettingRow>
                <Dropdown menu={langMenu} trigger={['click']} placement="bottomRight" rootClassName={cls.menu}>
                    <LinkRow label={t('Язык')} value={LANG_LABELS[lang]} />
                </Dropdown>
                {voice.supported && voice.options.length > 0 && (
                    <Dropdown menu={voiceMenu} trigger={['click']} placement="bottomRight" rootClassName={cls.menu}>
                        <LinkRow label={t('Голос')} value={voiceLabel} />
                    </Dropdown>
                )}
                {/* Нет в макете: цель дня негде больше поменять */}
                <SettingRow label={t('Цель дня')}>
                    <div className={cls.compact}>
                        <DailyGoalSwitcher />
                    </div>
                </SettingRow>
                <SettingRow label={t('Telegram')}>
                    {telegramLink ? (
                        <span className={cls.rowValue}>
                            {telegramLink.username ? `@${telegramLink.username}` : t('Привязан')}
                        </span>
                    ) : !isTelegramMiniApp() && (
                        <TelegramButton size="small">{t('Открыть бота')}</TelegramButton>
                    )}
                </SettingRow>
                <LinkRow
                    label={t('Контакты')}
                    value={contactRequests?.length ? t('Запросы · {{count}}', { count: contactRequests.length }) : undefined}
                    onClick={() => navigate(RoutePath.CONTACTS())}
                />
                <LinkRow label={t('Профиль и аватар')} onClick={openProfile} />
                <LinkRow label={t('Сменить пароль')} onClick={openPassword} />
            </div>

            <button type="button" className={cls.logout} onClick={() => logout()}>
                {t('Выйти')}
            </button>
            <DeleteAccountButton className={cls.deleteAccount} />

            <ModalFrame
                open={profileOpen}
                width={PROFILE_MODAL_WIDTH}
                title={t('Профиль')}
                onClose={closeProfile}
                destroyOnHidden
            >
                <ProfileForm hidePasswordChange />
            </ModalFrame>
            <ChangePasswordModal open={passwordOpen} onClose={closePassword} />
        </div>
    );
});

MobileAccount.displayName = 'MobileAccount';
