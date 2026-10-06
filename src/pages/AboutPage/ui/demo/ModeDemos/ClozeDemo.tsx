import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { AnswerGrade, checkAnswerVariants } from '@/shared/lib/text';
import { AnswerFeedback, AnswerFeedbackTone } from '@/shared/ui/AnswerFeedback';
import { AnswerInput } from '@/shared/ui/AnswerInput';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';

import { CLOZE_DEMO } from '../demoData';
import cls from './ModeDemos.module.scss';

const FEEDBACK_TONES: Record<AnswerGrade, AnswerFeedbackTone> = {
    correct: AnswerFeedbackTone.SUCCESS,
    almost: AnswerFeedbackTone.WARNING,
    wrong: AnswerFeedbackTone.ERROR,
};

/** «Пропуски»: слово скрыто в своём примере, перевод — подсказка по кнопке */
export const ClozeDemo = memo(() => {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const [grade, setGrade] = useState<AnswerGrade | null>(null);
    const [showHint, setShowHint] = useState(false);

    const submit = () => {
        if (!value.trim()) return;
        setGrade(checkAnswerVariants(CLOZE_DEMO.answer, value, true));
    };

    const reset = () => {
        setGrade(null);
        setValue('');
        setShowHint(false);
    };

    const titles: Record<AnswerGrade, string> = {
        correct: t('Верно'),
        almost: t('Почти — одна опечатка'),
        wrong: t('Неверно'),
    };

    return (
        <div className={cls.demo}>
            <div className={cls.prompt}>
                <Kicker size={KickerSize.SM}>{t('Вставьте слово')}</Kicker>
                <span className={cls.sentence}>
                    {`${CLOZE_DEMO.before} `}
                    <span className={cls.gap}>{grade ? CLOZE_DEMO.answer : '_____'}</span>
                    {` ${CLOZE_DEMO.after}`}
                </span>
                {showHint ? (
                    <span className={cls.hintText}>{CLOZE_DEMO.hint}</span>
                ) : (
                    <button type="button" className={cls.link} onClick={() => setShowHint(true)}>
                        {t('Показать перевод')}
                    </button>
                )}
            </div>
            <AnswerInput value={value} onChange={setValue} onSubmit={submit} />
            {grade ? (
                <AnswerFeedback
                    tone={FEEDBACK_TONES[grade]}
                    title={titles[grade]}
                    subtitle={t('Слово в своём предложении запоминается крепче, чем в списке')}
                    onNext={reset}
                />
            ) : (
                <Button type="primary" className={cls.action} onClick={submit} disabled={!value.trim()}>
                    {t('Проверить · ENTER')}
                </Button>
            )}
        </div>
    );
});

ClozeDemo.displayName = 'ClozeDemo';
