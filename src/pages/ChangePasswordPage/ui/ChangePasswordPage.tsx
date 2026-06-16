import { useTranslation } from 'react-i18next';
import { Card, Typography, Input, Button, Form } from 'antd';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { HStack, VStack } from '@/shared/ui/Stack';
import { usePasswordRecoveryMutation } from '@/entities/User';
import { getQueryParams } from '@/shared/lib/hooks/addQueryParams';
import { RoutePath } from '@/shared/config/router/routePath';
import { useNotificationFn } from '@/shared/lib/context/NotificationContext';
import { PasswordStrengthIndicator, PasswordStrength, MIN_PASSWORD_STRENGTH } from '@/shared/ui/PasswordStrengthIndicator';

const ChangePasswordPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const notification = useNotificationFn();
    const { token } = getQueryParams<{ token: string }>();
    const mainPage = RoutePath.MAIN();

    const [form] = Form.useForm();
    const [passwordRecovery] = usePasswordRecoveryMutation();
    const [isSuccess, setIsSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(0);

    const password = Form.useWatch('password', form);

    const handleStrengthChange = useCallback((score: PasswordStrength) => {
        setPasswordStrength(score);
    }, []);

    const onFinish = async (values: any) => {
        if (!token) {
            return;
        }

        const result = await passwordRecovery({
            new_password: values.password,
            confirm_password: values.passwordConfirm,
            secret_token: token,
        });

        if ('data' in result) {
            setIsSuccess(true);
        } else if ('error' in result) {
            notification?.error({
                message: t('Ссылка недействительна, попробуйте восстановить пароль заново'),
            });
        }
    };

    return (
        <HStack style={{ padding: 24 }} max justify="center">
            <Card style={{ width: 562 }}>
                {isSuccess ? (
                    <VStack
                        max
                        justify="center"
                        align='center'
                        fullHeight
                        gap="14"
                    >
                        <Typography.Title level={3} style={{ textAlign: 'center' }}>
                            {t('Пароль успешно изменен!')}
                        </Typography.Title>
                        <Button
                            onClick={() => navigate(mainPage)}
                        >
                            {t('На главную')}
                        </Button>
                    </VStack>
                ) : (
                    <>
                        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
                            {t('Придумайте новый пароль')}
                        </Typography.Title>
                        <Form
                            form={form}
                            layout="vertical"
                            name="activate"
                            style={{
                                width: '100%',
                            }}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                name="password"
                                validateDebounce={700}
                                rules={[
                                    {
                                        required: true,
                                        message: t('Пожалуйста введите пароль'),
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (!value) {
                                                return Promise.resolve();
                                            }
        
                                            // Проверка 1: Минимальная длина
                                            if (value.length < 8) {
                                                return Promise.reject(
                                                    new Error(t('Пароль должен содержать минимум 8 символов')),
                                                );
                                            }
        
                                            // Проверка 2: Наличие строчной буквы
                                            if (!/[a-z]/.test(value)) {
                                                return Promise.reject(
                                                    new Error(t('Пароль должен содержать хотя бы одну строчную букву')),
                                                );
                                            }
        
                                            // Проверка 3: Наличие заглавной буквы
                                            if (!/[A-Z]/.test(value)) {
                                                return Promise.reject(
                                                    new Error(t('Пароль должен содержать хотя бы одну заглавную букву')),
                                                );
                                            }
        
                                            // Проверка 4: Наличие цифры
                                            if (!/\d/.test(value)) {
                                                return Promise.reject(
                                                    new Error(t('Пароль должен содержать хотя бы одну цифру')),
                                                );
                                            }
        
                                            // Проверка 5: Наличие специального символа
                                            if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
                                                return Promise.reject(
                                                    new Error(t('Пароль должен содержать хотя бы один специальный символ')),
                                                );
                                            }

                                            // Проверка 6: Минимальная сложность по zxcvbn
                                            if (passwordStrength < MIN_PASSWORD_STRENGTH) {
                                                return Promise.reject(
                                                    new Error(t('Пароль слишком простой, усложните его')),
                                                );
                                            }
        
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Input.Password
                                    placeholder={t('Введите новый пароль')}
                                    size="large"
                                />
                            </Form.Item>

                            <PasswordStrengthIndicator
                                password={password}
                                onStrengthChange={handleStrengthChange}
                            />

                            <Form.Item
                                name="passwordConfirm"
                                validateDebounce={700}
                                style={{
                                    marginBottom: 30,
                                    marginTop: 16,
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: t('Пожалуйста введите пароль'),
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t('Пароли должны совпадать')));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    placeholder={t('Повторите пароль')}
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                style={{
                                    marginBottom: 0,
                                }}
                            >
                                <Button
                                    size="large"
                                    color="default"
                                    type="primary"
                                    block
                                    htmlType='submit'
                                >
                                    {t('Сохранить пароль')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Card>
        </HStack>
    );
};

export default ChangePasswordPage;
