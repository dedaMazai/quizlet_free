import { KeyboardEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnswerFeedback, AnswerFeedbackTone } from '@/shared/ui/AnswerFeedback';
import { AnswerOption, AnswerOptionState } from '@/shared/ui/AnswerOption';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';

import { LEARN_DEMO } from '../demoData';
import cls from './ModeDemos.module.scss';

const optionState = (i: number, active: number, picked: number | null): AnswerOptionState => {
    if (picked === null) return i === active ? AnswerOptionState.ACTIVE : AnswerOptionState.IDLE;
    if (i === LEARN_DEMO.answerIndex) return AnswerOptionState.CORRECT;
    if (i === picked) return AnswerOptionState.WRONG;
    return AnswerOptionState.DIM;
};

/** «Заучивание»: выбор из 4 — цифры 1–4, стрелки и Enter, пока демо в фокусе */
export const LearnDemo = memo(() => {
    const { t } = useTranslation();
    const [active, setActive] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const total = LEARN_DEMO.options.length;
    const isCorrect = picked === LEARN_DEMO.answerIndex;

    const reset = () => {
        setPicked(null);
        setActive(0);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        // После ответа Enter обслуживает полоса результата
        if (picked !== null) return;
        const digit = Number(e.key);
        if (digit >= 1 && digit <= total) {
            setPicked(digit - 1);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            setActive((prev) => (prev + 1) % total);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setActive((prev) => (prev - 1 + total) % total);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            setPicked(active);
        }
    };

    return (
        <div className={cls.demo} tabIndex={0} onKeyDown={handleKeyDown} aria-label={t('Демо режима «Заучивание»')}>
            <div className={cls.prompt}>
                <Kicker size={KickerSize.SM}>{t('Выберите перевод')}</Kicker>
                <span className={cls.promptText}>{LEARN_DEMO.prompt}</span>
            </div>
            <div className={cls.options}>
                {LEARN_DEMO.options.map((option, i) => (
                    <AnswerOption
                        key={option}
                        index={i + 1}
                        label={option}
                        state={optionState(i, active, picked)}
                        disabled={picked !== null}
                        onClick={() => setPicked(i)}
                    />
                ))}
            </div>
            {picked !== null && (
                <AnswerFeedback
                    tone={isCorrect ? AnswerFeedbackTone.SUCCESS : AnswerFeedbackTone.ERROR}
                    title={isCorrect ? t('Верно') : t('Неверно')}
                    subtitle={isCorrect
                        ? t('Следующий шаг для этого слова — ввод с клавиатуры')
                        : t('Слово вернётся в этой же сессии')}
                    onNext={reset}
                />
            )}
        </div>
    );
});

LearnDemo.displayName = 'LearnDemo';
