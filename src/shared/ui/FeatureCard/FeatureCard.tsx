import { FC, ReactNode } from 'react';
import { Card } from 'antd';
import { classNames } from '@/shared/lib/classNames/classNames';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './FeatureCard.module.scss';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    className?: string;
}

export const FeatureCard: FC<FeatureCardProps> = (props) => {
    const { icon, title, description, className } = props;

    return (
        <Card variant="borderless" className={classNames(cls.FeatureCard, {}, [className])}>
            <HStack gap="16" align="start">
                <div className={cls.iconBox}>{icon}</div>
                <VStack gap="4">
                    <MyTypography.Large strong>{title}</MyTypography.Large>
                    <MyTypography.Small type="secondary">{description}</MyTypography.Small>
                </VStack>
            </HStack>
        </Card>
    );
};
