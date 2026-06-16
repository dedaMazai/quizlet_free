import { useTranslation } from 'react-i18next';
import { Button, Card, Form, Input, Typography, Badge } from 'antd';
import { UserOutlined, LockOutlined, CloseOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router';
import { CSSProperties, memo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { HStack, VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    useCheckOidcMutation,
    useLoginImpersonateMutation,
    useLoginMutation,
    useUserInfoQuery,
    useUserLoggedOut,
} from '@/entities/User';
import { Loader } from '@/shared/ui/Loader';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useNotificationFn } from '@/shared/lib/context/NotificationContext';
import { ReactComponent as LogoPioneer } from '@/shared/assets/icons/LogoPioneer.svg';
import { MyTypography } from '@/shared/ui/MyTypography';
import cls from './LoginPage.module.scss';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    impersonate_email?: string;
}

interface WrapperCardProps {
    children: ReactNode;
    isImpersonateMode: boolean;
    style?: CSSProperties;
}

const WrapperCard = memo(({ children, isImpersonateMode, style }: WrapperCardProps) => {
    const { t } = useTranslation();

    const styleProp = {
        width: 562,
        backgroundColor: 'var(--card-bg)',
        border: 'none',
        position: 'relative' as const,
        ...style,
    }

    if (isImpersonateMode) {
        return (
            <Badge.Ribbon text={t('Режим имперсонации')} color="orange">
                <Card style={styleProp}>
                    {children}
                </Card>
            </Badge.Ribbon>
        )
    }

    return (
        <Card style={styleProp}>
            {children}
        </Card>
    )
})

const LoginPage = () => {
    const { t } = useTranslation();
    const [login, { isLoading: isAdminLoading }] = useLoginMutation();
    const [loginImpersonate, { isLoading: isImpersonateLoading }] = useLoginImpersonateMutation();
    const notification = useNotificationFn();
    const [form] = Form.useForm<LoginForm>();
    const [isImpersonateMode, setIsImpersonateMode] = useState(false);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [
        storageFields,
    ] = useLocalStorage<{
        email: string | undefined
    }>('LoginPageFields', {
        email: undefined,
    });

    const handleLongPressStart = () => {
        longPressTimerRef.current = setTimeout(() => {
            setIsImpersonateMode(true);
            notification?.info({
                message: t('Режим имперсонации активирован'),
            });
        }, 7000);
    };

    const handleLongPressEnd = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const onFinish = async (values: LoginForm) => {
        if (!isImpersonateMode) {
            const result = await login(values);
            if ('error' in result) {
                notification?.error({
                    message: t('Неверный логин или пароль'),
                });
            }
        } else if (values.impersonate_email) {
            const result = await loginImpersonate({
                admin_email: values.email,
                admin_password: values.password,
                user_email: values.impersonate_email,
            });
            if ('error' in result) {
                notification?.error({
                    message: t('Ошибка имперсонации'),
                });
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

    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, []);

    const isLoading = isAdminLoading || isImpersonateLoading;

    const { isLoading: userInfoIsLoading, isFetching: userInfoIsFetching, error: userInfoError } = useUserInfoQuery();
    const [, { isLoading: oidcIsLoading, isSuccess: oidcIsSuccess, isError: oidcIsError }] = useCheckOidcMutation({
        fixedCacheKey: 'init-oidc-check',
    });
    const loggedOut = useUserLoggedOut();

    const oidcErrorInUrl = useMemo(
        () => new URLSearchParams(window.location.search).has('oidc_error'),
        [],
    );

    const userInfoIs401 = !!userInfoError && 'status' in userInfoError && userInfoError.status === 401;

    const isAuthProbing = !__IS_DEV__
        && !loggedOut
        && !oidcErrorInUrl
        && (
            userInfoIsLoading
            || userInfoIsFetching
            || oidcIsLoading
            || oidcIsSuccess
            || (userInfoIs401 && !oidcIsError)
        );

    if (isAuthProbing) {
        return (
            <HStack style={{ padding: 24 }} max justify="center">
                <VStack gap="16" align="center">
                    <Loader />
                    <MyTypography.Base style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        {t('Проверка авторизации...')}
                    </MyTypography.Base>
                </VStack>
            </HStack>
        );
    }

    return (
        <HStack style={{ padding: 24 }} max justify="center">
            <WrapperCard isImpersonateMode={isImpersonateMode}>
                {isImpersonateMode && (
                    <Button
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => {
                            setIsImpersonateMode(false);
                            form.setFieldValue('impersonate_email', undefined);
                        }}
                        style={{ position: 'absolute', top: 16, left: 16 }}
                    >
                        {t('Выйти из режима имперсонации')}
                    </Button>
                )}
                <HStack max justify='center'>
                    <div
                        onMouseDown={handleLongPressStart}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={handleLongPressStart}
                        onTouchEnd={handleLongPressEnd}
                        style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                        }}
                    >
                        <LogoPioneer width={104} height={40} style={{ color: 'var(--color-logo)' }} />
                    </div>
                </HStack>
                <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {t('Вход в личный кабинет')}
                </Typography.Title>
                <Form
                    form={form}
                    name="login"
                    initialValues={{
                        remember: false,
                    }}
                    style={{
                        width: '100%',
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="email"
                        validateDebounce={700}
                        rules={[
                            {
                                required: true,
                                message: t('Пожалуйста введите почту'),
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: 'var(--color-logo)' }} />}
                            placeholder={t('Почта')}
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        validateDebounce={700}
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: t('Пожалуйста введите пароль'),
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'var(--color-logo)' }} />}
                            iconRender={(visible) =>
                                visible
                                    ? <EyeOutlined style={{ color: 'var(--color-logo)' }} />
                                    : <EyeInvisibleOutlined style={{ color: 'var(--color-logo)' }} />
                            }
                            placeholder={t('Пароль')}
                            size="large"
                        />
                    </Form.Item>

                    {isImpersonateMode && (
                        <Form.Item
                            name="impersonate_email"
                            validateDebounce={700}
                            rules={[
                                {
                                    required: true,
                                    message: t('Пожалуйста введите email пользователя'),
                                },
                                {
                                    type: 'email',
                                    message: t('Введите корректную почту'),
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: 'var(--color-warning)' }} />}
                                placeholder={t('Email пользователя для входа')}
                                size="large"
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        style={{
                            marginBottom: 12,
                        }}
                    >
                        <Button
                            size="large"
                            color="default"
                            block
                            htmlType="submit"
                        >
                            {isLoading ? <Loader className={cls.loader} /> : t('Войти')}
                        </Button>
                    </Form.Item>
                </Form>
                <HStack max justify="center">
                    <MyTypography.Small style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {t('Нажимая «Войти», вы принимаете')}{' '}
                        <NavLink to={RoutePath.PRIVACY()}>
                            {t('пользовательское соглашение и политику конфиденциальности')}
                        </NavLink>
                    </MyTypography.Small>
                </HStack>
            </WrapperCard>
        </HStack>
    );
};

export default LoginPage;
