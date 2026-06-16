import { FC, ReactNode } from 'react';
import { Typography, Button } from 'antd';
import {
    FileTextOutlined,
    CommentOutlined,
    HistoryOutlined,
    InboxOutlined,
    FileAddOutlined,
    FolderOutlined,
    StarOutlined,
    ClockCircleOutlined,
    FileSearchOutlined,
} from '@ant-design/icons';
import { classNames } from '@/shared/lib/classNames/classNames';
import { VStack } from '@/shared/ui/Stack';

import cls from './EmptyState.module.scss';

type EmptyStateType = 
    | 'documents'
    | 'search'
    | 'comments'
    | 'history'
    | 'general'
    | 'drafts'
    | 'templates'
    | 'collections'
    | 'starred'
    | 'recent';

interface EmptyStateProps {
    className?: string;
    type?: EmptyStateType;
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    size?: 'small' | 'medium' | 'large';
}

const DEFAULT_ICONS: Record<EmptyStateType, ReactNode> = {
    documents: <FileTextOutlined />,
    search: <FileSearchOutlined />,
    comments: <CommentOutlined />,
    history: <HistoryOutlined />,
    general: <InboxOutlined />,
    drafts: <FileAddOutlined />,
    templates: <FileTextOutlined />,
    collections: <FolderOutlined />,
    starred: <StarOutlined />,
    recent: <ClockCircleOutlined />,
};

/**
 * EmptyState - A component for displaying empty state feedback
 * with consistent visual design across the application
 */
export const EmptyState: FC<EmptyStateProps> = ({
    className,
    type = 'general',
    title,
    description,
    icon,
    action,
    size = 'medium',
}) => {
    const iconContent = icon || DEFAULT_ICONS[type];

    return (
        <VStack
            align="center"
            justify="center"
            gap={size === 'small' ? '8' : size === 'medium' ? '12' : '16'}
            className={classNames(cls.EmptyState, [className, cls[size]])}
        >
            <div className={cls.iconWrapper}>
                <div className={cls.iconBg}>
                    {iconContent}
                </div>
            </div>

            <VStack align="center" gap="4">
                <Typography.Text strong className={cls.title}>
                    {title}
                </Typography.Text>
                {description && (
                    <Typography.Text type="secondary" className={cls.description}>
                        {description}
                    </Typography.Text>
                )}
            </VStack>

            {action && (
                <Button
                    type="primary"
                    onClick={action.onClick}
                    className={cls.actionButton}
                >
                    {action.label}
                </Button>
            )}
        </VStack>
    );
};
