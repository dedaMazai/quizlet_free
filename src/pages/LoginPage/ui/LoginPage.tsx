import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { Link, useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import { LOGIN_MODE_PARAM, LOGIN_MODE_REGISTER, RoutePath } from '@/shared/config/router/routePath';
import {
    useLinkTelegramMutation,
    useLoginMutation,
    useRegisterMutation,
    useRequestPasswordResetMutation,
    useTelegramCreateAccountMutation,
    useUserInfoQuery,
} from '@/entities/User';
import { Loader } from '@/shared/ui/Loader';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { usePageMeta } from '@/shared/lib/hooks/usePageMeta';
import { useToast } from '@/shared/lib/toast';
import { isTelegramMiniApp } from '@/shared/lib/telegram';
import { TelegramButton } from '@/shared/ui/TelegramButton';
import { LEGAL_VERSION } from '@/shared/const/legal';
import {
    isLegalConsentComplete, LegalConsentChecks, LegalConsentValue,
} from '@/features/LegalConsent';
import { ReactComponent as Logo } from '@/shared/assets/icons/LogoZubrika.svg';
import cls from './LoginPage.module.scss';

/** Название продукта не переводится. */
const APP_NAME = 'Zubrika';
const RESET_TOAST_DURATION_MS = 7000;

enum LoginMode {
    LOGIN = 'login',
    REGISTER = 'register',
    RESET = 'reset',
}

interface LoginForm {
    email: string;
    password: string;
    name?: string;
}

/** Вход и регистрация (Public 6.31/6.32): слева тёмное поле со слоганом, справа форма */
const LoginPage = () => {
    const { t } = useTranslation();
    usePageMeta({ title: t('Вход') });
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
    const [requestPasswordReset, { isLoading: isResetLoading }] = useRequestPasswordResetMutation();
    const [telegramCreateAccount, { isLoading: isTelegramLoading }] = useTelegramCreateAccountMutation();
    const [linkTelegram] = useLinkTelegramMutation();
    const inTelegram = isTelegramMiniApp();
    const toast = useToast();
    const [form] = Form.useForm<LoginForm>();
    const [searchParams] = useSearchParams();
    // CTA лендинга открывают форму сразу на регистрации
    const [mode, setMode] = useState(
        searchParams.get(LOGIN_MODE_PARAM) === LOGIN_MODE_REGISTER ? LoginMode.REGISTER : LoginMode.LOGIN,
    );
    const isRegisterMode = mode === LoginMode.REGISTER;
    const isResetMode = mode === LoginMode.RESET;
    // Галочки не ставятся заранее: согласие должно быть активным действием
    const [legalConsent, setLegalConsent] = useState<LegalConsentValue>({ terms: false, consent: false });
    const [showLegalErrors, setShowLegalErrors] = useState(false);
    const [
        storageFields,
    ] = useLocalStorage<{
        email: string | undefined
    }>('LoginPageFields', {
        email: undefined,
    });

    const pillars = [
        {
            key: 'srs',
            title: t('Интервальные повторения'),
            description: t('Слово возвращается ровно тогда, когда начинает забываться.'),
        },
        {
            key: 'context',
            title: t('Слово в контексте'),
            description: t('Режим «Пропуски» — вставить слово в свой пример.'),
        },
        {
            key: 'chunks',
            title: t('Фразы с ИИ'),
            description: t('К каждому слову — 2–3 частотные коллокации.'),
        },
    ];

    // Mini App: вход по привязанному Telegram или новый аккаунт без почты и пароля
    const onTelegramStart = async () => {
        const result = await telegramCreateAccount();
        if ('error' in result) {
            toast.error(t('Не удалось войти через Telegram'));
        }
    };

    // Mini App: после входа по почте привязываем Telegram, чтобы дальше входить автоматически.
    // Ошибка привязки вход не отменяет.
    const linkTelegramAfterAuth = async () => {
        if (!inTelegram) return;
        const result = await linkTelegram();
        if ('error' in result) {
            toast.warning(t('Не удалось привязать Telegram — возможно, он уже привязан к другому аккаунту'));
        }
    };

    const onFinish = async (values: LoginForm) => {
        if (isResetMode) {
            const result = await requestPasswordReset(values.email);
            if ('error' in result) {
                toast.error(t('Не удалось отправить письмо, попробуйте позже'));
            } else {
                // Письма часто попадают в «Спам» — тост заметный, держится дольше обычного и закрывается крестиком
                toast.warning(
                    <>
                        <strong>{t('Обязательно проверьте «Спам»')}</strong>
                        {' '}
                        {t('— ссылка придёт, если аккаунт с этой почтой есть')}
                    </>,
                    { duration: RESET_TOAST_DURATION_MS, closable: true },
                );
                setMode(LoginMode.LOGIN);
            }
        } else if (isRegisterMode) {
            // Без обеих галочек аккаунт не создаём: согласие на обработку ПДн — условие регистрации
            if (!isLegalConsentComplete(legalConsent)) {
                setShowLegalErrors(true);
                toast.error(t('Отметьте согласие с документами'));
                return;
            }
            const result = await register({
                email: values.email,
                password: values.password,
                name: values.name,
                legalVersion: LEGAL_VERSION,
            });
            if ('error' in result) {
                toast.error(t('Не удалось зарегистрироваться'));
            } else if (result.data === null) {
                toast.info(t('Подтвердите регистрацию по ссылке в письме'));
            } else {
                await linkTelegramAfterAuth();
            }
        } else {
            const result = await login(values);
            if ('error' in result) {
                toast.error(t('Неверный логин или пароль'));
            } else {
                await linkTelegramAfterAuth();
            }
        }
    };

    useEffect(() => {
        if (storageFields.email) {
            form.setFieldsValue({
                email: storageFields.email,
            });
        }
    }, [form, storageFields]);

    const isLoading = isLoginLoading || isRegisterLoading || isResetLoading || isTelegramLoading;

    const titles: Record<LoginMode, string> = {
        [LoginMode.LOGIN]: t('Вход'),
        [LoginMode.REGISTER]: t('Регистрация'),
        [LoginMode.RESET]: t('Восстановление пароля'),
    };
    const subtitles: Record<LoginMode, string> = {
        [LoginMode.LOGIN]: t('С возвращением. Повторения ждут.'),
        [LoginMode.REGISTER]: t('Пара полей — и можно создавать первую колоду'),
        [LoginMode.RESET]: t('Пришлём на почту ссылку, по которой можно задать новый пароль'),
    };
    const submitLabels: Record<LoginMode, string> = {
        [LoginMode.LOGIN]: t('Войти'),
        [LoginMode.REGISTER]: t('Зарегистрироваться'),
        [LoginMode.RESET]: t('Отправить ссылку'),
    };

    const { isLoading: userInfoIsLoading, isFetching: userInfoIsFetching } = useUserInfoQuery();

    // Показываем лоадер только пока идёт проверка сессии Supabase. Как только она
    // завершилась (в т.ч. с 401 = нет сессии) — показываем форму входа.
    const isAuthProbing = !__IS_DEV__ && (userInfoIsLoading || userInfoIsFetching);

    if (isAuthProbing) {
        return (
            <div className={cls.probing}>
                <Loader />
                <span className={cls.probingText}>{t('Проверка авторизации...')}</span>
            </div>
        );
    }

    return (
        <div className={cls.LoginPage}>
            <section className={cls.panel}>
                <div className={cls.logo}>
                    <Logo className={cls.logoIcon} />
                    <span className={cls.logoText}>{APP_NAME}</span>
                </div>
                <div className={cls.slogan}>
                    <Kicker tone={KickerTone.ON_DARK} className={cls.sloganKicker}>
                        {t('Английский по карточкам')}
                    </Kicker>
                    <span className={cls.sloganTitle}>{t('Учите фразами. Не забывайте через месяц.')}</span>
                </div>
                <div className={cls.pillars}>
                    {pillars.map((pillar, index) => (
                        <div key={pillar.key} className={cls.pillar}>
                            <span className={cls.pillarIndex}>{String(index + 1).padStart(2, '0')}</span>
                            <span className={cls.pillarTitle}>{pillar.title}</span>
                            <span className={cls.pillarText}>{pillar.description}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={cls.formSide}>
                <div className={cls.formBox}>
                    <div className={cls.heading}>
                        <h1 className={cls.title}>{titles[mode]}</h1>
                        <span className={cls.subtitle}>{subtitles[mode]}</span>
                    </div>

                    {inTelegram && !isResetMode && (
                        <div className={cls.telegram}>
                            <Button
                                size="large"
                                block
                                className={cls.telegramButton}
                                disabled={isLoading}
                                onClick={onTelegramStart}
                            >
                                {t('Продолжить через Telegram')}
                            </Button>
                            <span className={cls.telegramHint}>
                                {t('Уже есть аккаунт на сайте? Войдите ниже — Telegram привяжется к нему')}
                            </span>
                        </div>
                    )}

                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        requiredMark={false}
                        className={cls.form}
                        onFinish={onFinish}
                    >
                        <div className={cls.fields}>
                            {isRegisterMode && (
                                <Form.Item name="name" label={t('Имя · необязательно')} className={cls.field}>
                                    <Input
                                        className={cls.input}
                                        placeholder={t('Как к вам обращаться')}
                                        autoComplete="name"
                                    />
                                </Form.Item>
                            )}
                            <Form.Item
                                name="email"
                                label={t('Почта')}
                                className={cls.field}
                                validateDebounce={700}
                                rules={[
                                    {
                                        required: true,
                                        message: t('Пожалуйста введите почту'),
                                    },
                                ]}
                            >
                                <Input className={cls.input} autoComplete="email" />
                            </Form.Item>
                            {!isResetMode && (
                                <Form.Item
                                    name="password"
                                    label={t('Пароль')}
                                    className={cls.field}
                                    validateDebounce={700}
                                    rules={[
                                        {
                                            required: true,
                                            message: t('Пожалуйста введите пароль'),
                                        },
                                    ]}
                                >
                                    <Input.Password
                                        className={cls.input}
                                        autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                                        // AntD перезаписывает className у возвращённого элемента — стиль на вложенном
                                        iconRender={(visible) => (
                                            <span>
                                                <span className={cls.toggle}>
                                                    {visible ? t('Скрыть') : t('Показать')}
                                                </span>
                                            </span>
                                        )}
                                    />
                                </Form.Item>
                            )}
                            {mode === LoginMode.LOGIN && (
                                <button
                                    type="button"
                                    className={cls.forgot}
                                    onClick={() => setMode(LoginMode.RESET)}
                                >
                                    {t('Забыли пароль?')}
                                </button>
                            )}
                        </div>

                        {isRegisterMode && (
                            <LegalConsentChecks
                                value={legalConsent}
                                onChange={setLegalConsent}
                                showErrors={showLegalErrors}
                                className={cls.legal}
                            />
                        )}

                        <Button type="primary" htmlType="submit" block className={cls.submit} disabled={isLoading}>
                            <BlueprintMarks />
                            {isLoading
                                ? <Loader className={cls.loader} />
                                : submitLabels[mode]}
                        </Button>
                    </Form>

                    <div className={cls.links}>
                        <button
                            type="button"
                            className={cls.switch}
                            onClick={() => setMode(mode === LoginMode.LOGIN ? LoginMode.REGISTER : LoginMode.LOGIN)}
                        >
                            {mode === LoginMode.LOGIN && t('Нет аккаунта? Регистрация')}
                            {mode === LoginMode.REGISTER && t('Уже есть аккаунт? Войти')}
                            {mode === LoginMode.RESET && t('Вспомнили пароль? Войти')}
                        </button>
                        <Link to={RoutePath.ABOUT()} className={cls.about}>
                            {t('О сервисе')}
                        </Link>
                    </div>

                    {!inTelegram && !isResetMode && (
                        <div className={cls.telegramPromo}>
                            <span className={cls.telegramHint}>{t('Удобнее с телефона? Zubrika есть в Telegram — вход в один клик')}</span>
                            <TelegramButton block className={cls.telegramButton} />
                        </div>
                    )}

                    {!isRegisterMode && (
                        <span className={cls.terms}>
                            <Link to={RoutePath.TERMS()}>{t('Пользовательское соглашение')}</Link>
                            {' · '}
                            <Link to={RoutePath.PRIVACY()}>{t('Политика конфиденциальности')}</Link>
                        </span>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LoginPage;
