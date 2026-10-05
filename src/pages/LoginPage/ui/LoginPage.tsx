import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    useLoginMutation,
    useRegisterMutation,
    useRequestPasswordResetMutation,
    useUserInfoQuery,
} from '@/entities/User';
import { Loader } from '@/shared/ui/Loader';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useToast } from '@/shared/lib/toast';
import { ReactComponent as Logo } from '@/shared/assets/icons/LogoZubrika.svg';
import cls from './LoginPage.module.scss';

/** Название продукта не переводится. */
const APP_NAME = 'Zubrika';

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
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
    const [requestPasswordReset, { isLoading: isResetLoading }] = useRequestPasswordResetMutation();
    const toast = useToast();
    const [form] = Form.useForm<LoginForm>();
    const [mode, setMode] = useState(LoginMode.LOGIN);
    const isRegisterMode = mode === LoginMode.REGISTER;
    const isResetMode = mode === LoginMode.RESET;
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

    const onFinish = async (values: LoginForm) => {
        if (isResetMode) {
            const result = await requestPasswordReset(values.email);
            if ('error' in result) {
                toast.error(t('Не удалось отправить письмо, попробуйте позже'));
            } else {
                toast.success(t('Если аккаунт с этой почтой есть, мы отправили ссылку для сброса пароля'));
                setMode(LoginMode.LOGIN);
            }
        } else if (isRegisterMode) {
            const result = await register({
                email: values.email,
                password: values.password,
                name: values.name,
            });
            if ('error' in result) {
                toast.error(t('Не удалось зарегистрироваться'));
            } else if (result.data === null) {
                toast.info(t('Подтвердите регистрацию по ссылке в письме'));
            }
        } else {
            const result = await login(values);
            if ('error' in result) {
                toast.error(t('Неверный логин или пароль'));
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

    const isLoading = isLoginLoading || isRegisterLoading || isResetLoading;

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

                    <span className={cls.terms}>
                        {t('Продолжая, вы принимаете')}{' '}
                        <Link to={RoutePath.PRIVACY()}>
                            {t('пользовательское соглашение и политику конфиденциальности')}
                        </Link>
                        .
                    </span>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;
