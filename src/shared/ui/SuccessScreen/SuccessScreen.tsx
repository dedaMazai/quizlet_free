import { memo } from 'react';
import { Button, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './SuccessScreen.module.scss';

interface SuccessScreenProps {
    className?: string;
    title: string;
    description?: string;
    onClose: () => void;
}

/**
 * SuccessScreen - экран успешного завершения действия
 * @param className - дополнительные CSS классы
 * @param title - заголовок успешного завершения
 * @param description - описание успешного завершения
 * @param onClose - обработчик закрытия
 */
export const SuccessScreen = memo(({
    className,
    title,
    description,
    onClose,
}: SuccessScreenProps) => {
    const { t } = useTranslation();

    return (
        <VStack
            max
            fullHeight
            justify="between"
            align="center"
            className={classNames(cls.wrapper, [className])}
        >
            {/* Decorative background circles */}
            <div className={cls.decorCircle} />
            <div className={cls.decorCircle} />
            <div className={cls.decorCircle} />

            {/* Confetti animation */}
            <div className={cls.confettiContainer}>
                <div className={cls.confetti} />
                <div className={cls.confetti} />
                <div className={cls.confetti} />
                <div className={cls.confetti} />
                <div className={cls.confetti} />
                <div className={cls.confetti} />
            </div>

            <VStack
                fullHeight
                max
                gap="24"
                justify="center"
                align="center"
                className={cls.content}
            >
                {/* Success icon with rings */}
                <div className={cls.iconContainer}>
                    <div className={cls.iconRingOuter} />
                    <div className={cls.iconRing} />
                    <div className={cls.iconCircle}>
                        <CheckOutlined className={cls.checkIcon} />
                    </div>
                </div>

                {/* Text content */}
                <VStack gap="8" align="center" className={cls.textContainer}>
                    <Typography.Title level={4} className={cls.title}>
                        {title}
                    </Typography.Title>
                    {description && (
                        <Typography.Text className={cls.subtitle}>
                            {description}
                        </Typography.Text>
                    )}
                </VStack>
            </VStack>

            {/* Close button */}
            <div className={cls.buttonContainer}>
                <Button
                    block
                    type="primary"
                    onClick={onClose}
                    className={cls.closeButton}
                >
                    {t('Закрыть')}
                </Button>
            </div>
        </VStack>
    );
});

