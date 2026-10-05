import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useChangePasswordMutation, useVerifyPasswordResetMutation } from '@/entities/User';
import { RoutePath } from '@/shared/config/router/routePath';
import { useToast } from '@/shared/lib/toast';
import { Loader } from '@/shared/ui/Loader';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { ReactComponent as Logo } from '@/shared/assets/icons/LogoZubrika.svg';
import cls from './ChangePasswordPage.module.scss';

/** Название продукта не переводится. */
const APP_NAME = 'Zubrika';
const MIN_PASSWORD_LENGTH = 6;

enum LinkStatus {
    CHECKING = 'checking',
    VALID = 'valid',
    INVALID = 'invalid',
}

interface ChangePasswordValues {
    password: string;
    confirm: string;
}

/** Новый пароль по ссылке из письма восстановления (/change_password?token_hash=…) */
const ChangePasswordPage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const tokenHash = searchParams.get('token_hash');
    const [form] = Form.useForm<ChangePasswordValues>();
    const [verifyPasswordReset] = useVerifyPasswordResetMutation();
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [status, setStatus] = useState(tokenHash ? LinkStatus.CHECKING : LinkStatus.INVALID);
    // Токен одноразовый: StrictMode не должен потратить его вторым вызовом эффекта
    const isVerifyStarted = useRef(false);

    useEffect(() => {
        if (!tokenHash || isVerifyStarted.current) return;
        isVerifyStarted.current = true;
        verifyPasswordReset(tokenHash).then((result) => {
            setStatus('error' in result ? LinkStatus.INVALID : LinkStatus.VALID);
        });
    }, [tokenHash, verifyPasswordReset]);

    const onFinish = async ({ password }: ChangePasswordValues) => {
        try {
            await changePassword(password).unwrap();
            toast.success(t('Пароль изменён'));
            // Полная перезагрузка: приложение подхватит новую сессию при старте
            window.location.assign(RoutePath.MAIN());
        } catch {
            toast.error(t('Не удалось изменить пароль'));
        }
    };

    const renderContent = () => {
        if (status === LinkStatus.CHECKING) {
            return <Loader />;
        }

        if (status === LinkStatus.INVALID) {
            return (
                <>
                    <div className={cls.heading}>
                        <h1 className={cls.title}>{t('Ссылка недействительна')}</h1>
                        <span className={cls.subtitle}>
                            {t('Ссылка устарела или уже была использована. Запросите новую на странице входа.')}
                        </span>
                    </div>
                    <Link to={RoutePath.LOGIN()} className={cls.link}>
                        {t('Запросить новую ссылку')}
                    </Link>
                </>
            );
        }

        return (
            <>
                <div className={cls.heading}>
                    <h1 className={cls.title}>{t('Новый пароль')}</h1>
                    <span className={cls.subtitle}>{t('Придумайте новый пароль для входа')}</span>
                </div>
                <Form
                    form={form}
                    name="change-password"
                    layout="vertical"
                    requiredMark={false}
                    className={cls.form}
                    onFinish={onFinish}
                >
                    <div className={cls.fields}>
                        <Form.Item
                            name="password"
                            label={t('Новый пароль')}
                            className={cls.field}
                            rules={[
                                { required: true, message: t('Введите пароль') },
                                {
                                    min: MIN_PASSWORD_LENGTH,
                                    message: t('Не короче {{count}} символов', { count: MIN_PASSWORD_LENGTH }),
                                },
                            ]}
                        >
                            <Input.Password className={cls.input} autoComplete="new-password" />
                        </Form.Item>
                        <Form.Item
                            name="confirm"
                            label={t('Повторите пароль')}
                            className={cls.field}
                            dependencies={['password']}
                            rules={[
                                { required: true, message: t('Повторите пароль') },
                                ({ getFieldValue }) => ({
                                    validator: (_, value) => (!value || getFieldValue('password') === value
                                        ? Promise.resolve()
                                        : Promise.reject(new Error(t('Пароли не совпадают')))),
                                }),
                            ]}
                        >
                            <Input.Password className={cls.input} autoComplete="new-password" />
                        </Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" block className={cls.submit} loading={isLoading}>
                        <BlueprintMarks />
                        {t('Сохранить пароль')}
                    </Button>
                </Form>
            </>
        );
    };

    return (
        <div className={cls.ChangePasswordPage}>
            <div className={cls.box}>
                <Link to={RoutePath.LOGIN()} className={cls.logo}>
                    <Logo className={cls.logoIcon} />
                    <span className={cls.logoText}>{APP_NAME}</span>
                </Link>
                {renderContent()}
            </div>
        </div>
    );
};

export default ChangePasswordPage;
