import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'antd';
import { useAcceptLegalDocumentsMutation, useHasAcceptedLegalQuery } from '@/entities/LegalConsent';
import { useLogoutMutation, useUserInfo } from '@/entities/User';
import {
    isLegalConsentComplete, LegalConsentChecks, LegalConsentValue,
} from '@/features/LegalConsent';
import { LEGAL_VERSION, OPERATOR } from '@/shared/const/legal';
import { useToast } from '@/shared/lib/toast';

import cls from './LegalConsentGate.module.scss';

const MODAL_WIDTH = 480;

/**
 * Принятие документов текущей редакции для уже вошедших пользователей:
 * аккаунты до появления согласий, вход через Telegram, новая редакция документов.
 * Пока документы не приняты, окно не закрывается — можно только принять или выйти.
 */
export const LegalConsentGate = memo(() => {
    const { t } = useTranslation();
    const toast = useToast();
    const userInfo = useUserInfo();
    // Ошибка проверки (например, SQL ещё не выполнен) не блокирует работу — окно просто не показываем
    const { data: accepted, isError } = useHasAcceptedLegalQuery(LEGAL_VERSION, { skip: !userInfo });
    const [accept, { isLoading: isAccepting }] = useAcceptLegalDocumentsMutation();
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
    const [value, setValue] = useState<LegalConsentValue>({ terms: false, consent: false });
    const [showErrors, setShowErrors] = useState(false);

    const open = Boolean(userInfo) && !isError && accepted === false;

    const handleAccept = async () => {
        if (!isLegalConsentComplete(value)) {
            setShowErrors(true);
            return;
        }
        const result = await accept(LEGAL_VERSION);
        if ('error' in result) toast.error(t('Не удалось сохранить согласие, попробуйте ещё раз'));
    };

    return (
        <Modal
            open={open}
            width={MODAL_WIDTH}
            closable={false}
            maskClosable={false}
            keyboard={false}
            footer={null}
            title={null}
            centered
        >
            <div className={cls.LegalConsentGate}>
                <h2 className={cls.title}>{t('Обновлённые документы')}</h2>
                <p className={cls.text}>
                    {t('Мы опубликовали пользовательское соглашение и политику обработки персональных данных. Чтобы продолжить, примите их — это займёт минуту.')}
                </p>
                <LegalConsentChecks value={value} onChange={setValue} showErrors={showErrors} />
                <div className={cls.actions}>
                    <Button onClick={() => logout()} loading={isLoggingOut}>
                        {t('Выйти')}
                    </Button>
                    <Button type="primary" onClick={handleAccept} loading={isAccepting}>
                        {t('Принять и продолжить')}
                    </Button>
                </div>
                <span className={cls.note}>
                    {t('Не согласны? Выйдите из аккаунта или напишите на {{email}} — удалим аккаунт и все данные.', { email: OPERATOR.email })}
                </span>
            </div>
        </Modal>
    );
});

LegalConsentGate.displayName = 'LegalConsentGate';
