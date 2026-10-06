import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { AnswerGrade, checkAnswer, diffAnswer } from '@/shared/lib/text';
import { AnswerFeedback, AnswerFeedbackTone } from '@/shared/ui/AnswerFeedback';
import { AnswerInput } from '@/shared/ui/AnswerInput';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';

import { WRITE_DEMO } from '../demoData';
import cls from './ModeDemos.module.scss';

const FEEDBACK_TONES: Record<AnswerGrade, AnswerFeedbackTone> = {
    correct: AnswerFeedbackTone.SUCCESS,
    almost: AnswerFeedbackTone.WARNING,
    wrong: AnswerFeedbackTone.ERROR,
};

/** «Письмо»: ввод перевода с допуском одной опечатки — та же проверка, что в приложении */
export const WriteDemo = memo(() => {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const [grade, setGrade] = useState<AnswerGrade | null>(null);

    const submit = () => {
        if (!value.trim()) return;
        setGrade(checkAnswer(WRITE_DEMO.answer, value, true));
    };

    const reset = () => {
        setGrade(null);
        setValue('');
    };

    const titles: Record<AnswerGrade, string> = {
        correct: t('Верно'),
        almost: t('Почти — одна опечатка'),
        wrong: t('Неверно'),
    };

    return (
        <div className={cls.demo}>
            <div className={cls.prompt}>
                <Kicker size={KickerSize.SM}>{t('Переведите на английский')}</Kicker>
                <span className={cls.promptText}>{WRITE_DEMO.prompt}</span>
            </div>
            <AnswerInput
                value={value}
                onChange={setValue}
                onSubmit={submit}
                placeholder={t('Попробуйте с опечаткой: eventualy')}
                parts={grade ? diffAnswer(WRITE_DEMO.answer, value).input : undefined}
            />
            {grade ? (
                <AnswerFeedback
                    tone={FEEDBACK_TONES[grade]}
                    title={titles[grade]}
                    subtitle={grade === 'correct'
                        ? t('Интервал повторения вырастет')
                        : `${t('Правильно')}: ${WRITE_DEMO.answer}`}
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

WriteDemo.displayName = 'WriteDemo';
