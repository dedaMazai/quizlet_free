import { memo, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { Checkbox } from 'antd';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { MIN_USER_AGE } from '@/shared/const/legal';

import cls from './LegalConsentChecks.module.scss';

export interface LegalConsentValue {
    terms: boolean;
    consent: boolean;
}

interface LegalConsentChecksProps {
    value: LegalConsentValue;
    onChange: (value: LegalConsentValue) => void;
    /** Подсветить неотмеченные галочки после попытки отправки */
    showErrors?: boolean;
    className?: string;
}

// Документы открываются в новой вкладке: форма регистрации не теряет введённое
const DocLink = ({ to, children }: { to: string; children?: ReactNode }) => (
    <a href={to} target="_blank" rel="noopener noreferrer" className={cls.link}>{children}</a>
);

export const isLegalConsentComplete = (value: LegalConsentValue) => value.terms && value.consent;

/**
 * Две отдельные галочки: принятие соглашения и согласие на обработку ПДн.
 * Согласие по 152-ФЗ (ред. с 01.09.2025) оформляется отдельно от других документов и не ставится заранее.
 */
export const LegalConsentChecks = memo((props: LegalConsentChecksProps) => {
    const {
        value, onChange, showErrors = false, className,
    } = props;

    return (
        <div className={classNames(cls.LegalConsentChecks, [className])}>
            <Checkbox
                checked={value.terms}
                onChange={(e) => onChange({ ...value, terms: e.target.checked })}
                className={classNames(cls.check, { [cls.error]: showErrors && !value.terms })}
            >
                <Trans
                    i18nKey="Принимаю <terms>Пользовательское соглашение</terms> и подтверждаю, что мне исполнилось {{age}} лет"
                    values={{ age: MIN_USER_AGE }}
                    components={{ terms: <DocLink to={RoutePath.TERMS()} /> }}
                />
            </Checkbox>
            <Checkbox
                checked={value.consent}
                onChange={(e) => onChange({ ...value, consent: e.target.checked })}
                className={classNames(cls.check, { [cls.error]: showErrors && !value.consent })}
            >
                <Trans
                    i18nKey="Даю <consent>согласие на обработку персональных данных</consent>, в том числе на их передачу за рубеж, на условиях <privacy>Политики</privacy>"
                    components={{
                        consent: <DocLink to={RoutePath.PD_CONSENT()} />,
                        privacy: <DocLink to={RoutePath.PRIVACY()} />,
                    }}
                />
            </Checkbox>
        </div>
    );
});

LegalConsentChecks.displayName = 'LegalConsentChecks';
