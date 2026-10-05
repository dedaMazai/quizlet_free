import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SessionButton } from '@/shared/ui/SessionButton';
import { useAutoAdvance } from '@/shared/lib/hooks/useAutoAdvance';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';

interface SessionNextButtonProps {
    onNext: () => void;
    /** Автопереход через 1,2 с — только после верного ответа */
    autoAdvance?: boolean;
    className?: string;
}

/** «Дальше ENTER» под карточкой ответа: Enter и автопереход */
export const SessionNextButton = memo(({ onNext, autoAdvance = false, className }: SessionNextButtonProps) => {
    const { t } = useTranslation();

    useAutoAdvance(autoAdvance, onNext);
    useKeyDown((e) => {
        if (e.key === 'Enter') onNext();
    });

    return (
        <SessionButton keyHint="ENTER" className={className} onClick={onNext}>
            {t('Дальше')}
        </SessionButton>
    );
});

SessionNextButton.displayName = 'SessionNextButton';
