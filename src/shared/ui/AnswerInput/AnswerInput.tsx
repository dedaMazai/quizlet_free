import { memo, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, InputRef } from 'antd';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { classNames } from '@/shared/lib/classNames/classNames';
import { DiffPart } from '@/shared/lib/text';
import cls from './AnswerInput.module.scss';

interface AnswerInputProps {
    value: string;
    onChange?: (value: string) => void;
    onSubmit?: () => void;
    inputRef?: Ref<InputRef>;
    placeholder?: string;
    /** После проверки: ответ без поля ввода, ошибочные символы зачёркнуты */
    parts?: DiffPart[];
    className?: string;
}

/** Поле «ВАШ ОТВЕТ» для режимов с вводом */
export const AnswerInput = memo((props: AnswerInputProps) => {
    const {
        value, onChange, onSubmit, inputRef, placeholder, parts, className,
    } = props;
    const { t } = useTranslation();

    return (
        <label className={classNames(cls.AnswerInput, [className])}>
            <Kicker size={KickerSize.SM}>{t('Ваш ответ')}</Kicker>
            {parts ? (
                <div className={cls.field}>
                    {parts.map((part, i) => (
                        // Части ответа не переупорядочиваются — индекс стабилен
                        <span key={i} className={classNames({ [cls.typo]: part.changed })}>
                            {part.text}
                        </span>
                    ))}
                </div>
            ) : (
                <Input
                    ref={inputRef}
                    className={cls.field}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange?.(e.target.value)}
                    onPressEnter={(e) => {
                        // Тот же Enter не должен сразу пролистать фидбэк
                        e.preventDefault();
                        onSubmit?.();
                    }}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />
            )}
        </label>
    );
});

AnswerInput.displayName = 'AnswerInput';
