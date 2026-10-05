import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from 'antd';
import { useGetDueCountQuery } from '@/entities/Card';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import cls from './ErrorScreen.module.scss';

interface ErrorScreenProps {
    /** Номер ошибки в рамке: 404, 403 */
    code: string;
    title: string;
    description: string;
}

/** Экран ошибки 404/403 (Public 6.33): номер в Blueprint, текст, «Повторить N» / «На главную» */
export const ErrorScreen = memo(({ code, title, description }: ErrorScreenProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: due } = useGetDueCountQuery(undefined);
    const dueCount = due?.count ?? 0;

    return (
        <div className={cls.ErrorScreen}>
            <Blueprint className={cls.code}>
                <span className={cls.codeText}>{code}</span>
            </Blueprint>
            <h1 className={cls.title}>{title}</h1>
            <p className={cls.description}>
                {description}
                {dueCount > 0 && ` ${t('{{count}} карточек тем временем ждут повторения.', { count: dueCount })}`}
            </p>
            <div className={cls.actions}>
                {dueCount > 0 && (
                    <Button type="primary" className={cls.button} onClick={() => navigate(RoutePath.REVIEW())}>
                        <BlueprintMarks />
                        {t('Повторить {{count}}', { count: dueCount })}
                    </Button>
                )}
                <Button className={classNames(cls.button, [cls.secondary])} onClick={() => navigate(RoutePath.MAIN())}>
                    {t('На главную')}
                </Button>
            </div>
        </div>
    );
});

ErrorScreen.displayName = 'ErrorScreen';
