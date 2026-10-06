import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { RotateCcw } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AnswerFeedback, AnswerFeedbackTone } from '@/shared/ui/AnswerFeedback';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';

import { ORDER_DEMO } from '../demoData';
import cls from './ModeDemos.module.scss';

const RESET_ICON_SIZE = 14;

/** «Собери фразу»: клик переносит чанк в ответ и обратно */
export const OrderDemo = memo(() => {
    const { t } = useTranslation();
    // Индексы чанков в порядке выбора
    const [picked, setPicked] = useState<number[]>([]);
    const [checked, setChecked] = useState(false);

    const isComplete = picked.length === ORDER_DEMO.chunks.length;
    const isCorrect = picked.every((chunkIndex, i) => ORDER_DEMO.chunks[chunkIndex] === ORDER_DEMO.answer[i]);

    const toggle = (chunkIndex: number) => {
        if (checked) return;
        setPicked((prev) => (prev.includes(chunkIndex)
            ? prev.filter((i) => i !== chunkIndex)
            : [...prev, chunkIndex]));
    };

    const reset = () => {
        setPicked([]);
        setChecked(false);
    };

    return (
        <div className={cls.demo}>
            <div className={cls.prompt}>
                <Kicker size={KickerSize.SM}>{t('Соберите фразу')}</Kicker>
                <span className={cls.promptText}>{ORDER_DEMO.translation}</span>
            </div>
            <div className={classNames(cls.answerLine, { [cls.answerLineEmpty]: picked.length === 0 })}>
                {picked.length === 0 && <span className={cls.placeholder}>{t('Нажимайте на слова по порядку')}</span>}
                {picked.map((chunkIndex) => (
                    <button
                        key={chunkIndex}
                        type="button"
                        className={classNames(cls.chunk, [cls.chunkPicked])}
                        onClick={() => toggle(chunkIndex)}
                    >
                        {ORDER_DEMO.chunks[chunkIndex]}
                    </button>
                ))}
            </div>
            <div className={cls.chunks}>
                {ORDER_DEMO.chunks.map((chunk, chunkIndex) => (
                    <button
                        key={chunk}
                        type="button"
                        className={classNames(cls.chunk, { [cls.chunkUsed]: picked.includes(chunkIndex) })}
                        disabled={picked.includes(chunkIndex)}
                        onClick={() => toggle(chunkIndex)}
                    >
                        {chunk}
                    </button>
                ))}
            </div>
            {checked ? (
                <AnswerFeedback
                    tone={isCorrect ? AnswerFeedbackTone.SUCCESS : AnswerFeedbackTone.ERROR}
                    title={isCorrect ? t('Верно') : t('Неверно')}
                    subtitle={isCorrect ? t('Готовая фраза — и речь становится беглее') : ORDER_DEMO.answer.join(' ')}
                    onNext={reset}
                />
            ) : (
                <div className={cls.row}>
                    <Button type="primary" className={cls.action} onClick={() => setChecked(true)} disabled={!isComplete}>
                        {t('Проверить')}
                    </Button>
                    <button type="button" className={cls.link} onClick={reset} disabled={picked.length === 0}>
                        <RotateCcw size={RESET_ICON_SIZE} aria-hidden />
                        {t('Сбросить')}
                    </button>
                </div>
            )}
        </div>
    );
});

OrderDemo.displayName = 'OrderDemo';
