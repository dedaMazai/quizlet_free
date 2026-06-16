import { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Progress, Typography } from 'antd';
import zxcvbn from 'zxcvbn';
import { VStack } from '@/shared/ui/Stack';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export const MIN_PASSWORD_STRENGTH: PasswordStrength = 2;

interface PasswordStrengthIndicatorProps {
    className?: string;
    /** Пароль для оценки */
    password: string;
    /** Минимальный допустимый уровень сложности (0-4), по умолчанию 2 */
    minScore?: PasswordStrength;
    /** Показывать подсказки по улучшению пароля */
    showSuggestions?: boolean;
    /** Callback при изменении уровня сложности */
    onStrengthChange?: (score: PasswordStrength, isValid: boolean) => void;
}

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string }> = {
    0: { label: 'Очень слабый', color: 'var(--color-error)' },
    1: { label: 'Слабый', color: 'var(--color-warning)' },
    2: { label: 'Приемлемый', color: 'var(--color-star)' },
    3: { label: 'Хороший', color: 'var(--color-success)' },
    4: { label: 'Отличный', color: 'var(--color-success)' },
};

/**
 * PasswordStrengthIndicator - визуальный индикатор сложности пароля
 * Использует библиотеку zxcvbn от Dropbox для оценки реальной силы пароля
 */
export const PasswordStrengthIndicator: FC<PasswordStrengthIndicatorProps> = (props) => {
    const {
        className,
        password,
        minScore = MIN_PASSWORD_STRENGTH,
        showSuggestions = false,
        onStrengthChange,
    } = props;
    const { t } = useTranslation();

    const result = useMemo(() => {
        if (!password) {
            return null;
        }
        return zxcvbn(password);
    }, [password]);

    const score = (result?.score ?? 0) as PasswordStrength;
    const isValid = score >= minScore;

    useEffect(() => {
        if (password && onStrengthChange) {
            onStrengthChange(score, isValid);
        }
    }, [score, isValid, onStrengthChange, password]);

    if (!password) {
        return null;
    }

    const config = STRENGTH_CONFIG[score];
    const percent = ((score + 1) / 5) * 100;

    return (
        <VStack className={className} gap="4" max style={{ marginTop: 4 }}>
            <Progress
                percent={percent}
                showInfo={false}
                strokeColor={config.color}
                trailColor="var(--border-light)"
                size="small"
            />

            <Typography.Text style={{ fontSize: 12, color: config.color }}>
                {t(config.label)}
            </Typography.Text>

            {result?.feedback?.warning && (
                <Typography.Text type="warning" style={{ fontSize: 12 }}>
                    {t(result.feedback.warning)}
                </Typography.Text>
            )}

            {showSuggestions && result?.feedback?.suggestions && result.feedback.suggestions.length > 0 && (
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {result.feedback.suggestions.map((suggestion, index) => (
                            <li key={index}>{t(suggestion)}</li>
                        ))}
                    </ul>
                </Typography.Text>
            )}
        </VStack>
    );
};
