import { memo, ReactNode } from 'react';
import { Volume2 } from 'lucide-react';
import { Blueprint } from '@/shared/ui/Blueprint';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AnswerGrade, diffAnswer, DiffPart } from '@/shared/lib/text';
import cls from './AnswerReveal.module.scss';

export enum AnswerRevealTone {
    CORRECT = 'correct',
    ALMOST = 'almost',
    WRONG = 'wrong',
}

const SPEAK_ICON_SIZE = 20;
const SPEAK_ICON_STROKE = 1.5;

/** Делит пример на части, чтобы выделить в нём изучаемое слово */
const splitExample = (example: string, term: string) => {
    const index = example.toLowerCase().indexOf(term.trim().toLowerCase());
    if (!term.trim() || index < 0) return null;
    const end = index + term.trim().length;
    return [example.slice(0, index), example.slice(index, end), example.slice(end)] as const;
};

interface AnswerRevealProps {
    tone: AnswerRevealTone;
    label: ReactNode;
    /** Справа от метки: «засчитано как «трудно»» */
    note?: ReactNode;
    /** Правильный ответ; отличающиеся от ввода символы подсвечены */
    answer: DiffPart[];
    /** Что озвучить (английское слово) */
    speakText?: string;
    example?: string;
    /** Слово, выделяемое в примере */
    term?: string;
    className?: string;
}

/** Карточка с правильным ответом после проверки ввода */
export const AnswerReveal = memo((props: AnswerRevealProps) => {
    const {
        tone, label, note, answer, speakText, example, term = '', className,
    } = props;
    const exampleParts = example ? splitExample(example, term) : null;

    return (
        <Blueprint className={classNames(cls.AnswerReveal, [className, cls[tone]])}>
            <div className={cls.head}>
                <span className={cls.label}>{label}</span>
                {note && <span className={cls.note}>{note}</span>}
            </div>
            <div className={cls.answerRow}>
                <span className={cls.answer}>
                    {answer.map((part, i) => (
                        // Части ответа не переупорядочиваются — индекс стабилен
                        <span key={i} className={classNames({ [cls.diff]: part.changed })}>
                            {part.text}
                        </span>
                    ))}
                </span>
                {speakText && (
                    <SpeakButton
                        className={cls.speak}
                        text={speakText}
                        icon={<Volume2 size={SPEAK_ICON_SIZE} strokeWidth={SPEAK_ICON_STROKE} />}
                    />
                )}
            </div>
            {example && (
                <div className={cls.example}>
                    “
                    {exampleParts ? (
                        <>
                            {exampleParts[0]}
                            <b className={cls.term}>{exampleParts[1]}</b>
                            {exampleParts[2]}
                        </>
                    ) : example}
                    ”
                </div>
            )}
        </Blueprint>
    );
});

AnswerReveal.displayName = 'AnswerReveal';

export interface RevealParts {
    tone: AnswerRevealTone;
    /** Правильный ответ */
    answer: DiffPart[];
    /** Ввод пользователя */
    input: DiffPart[];
}

/** Подсветка по оценке: опечатка — посимвольно, ошибка — весь ввод зачёркнут */
export const getRevealParts = (expected: string, input: string, grade: AnswerGrade): RevealParts => {
    if (grade === 'almost') {
        const diff = diffAnswer(expected, input);
        return { tone: AnswerRevealTone.ALMOST, answer: diff.expected, input: diff.input };
    }
    return {
        tone: grade === 'correct' ? AnswerRevealTone.CORRECT : AnswerRevealTone.WRONG,
        answer: [{ text: expected, changed: false }],
        input: [{ text: input.trim(), changed: grade === 'wrong' }],
    };
};
