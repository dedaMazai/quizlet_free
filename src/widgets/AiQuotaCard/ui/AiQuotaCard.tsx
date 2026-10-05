import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAiUsageQuery } from '@/entities/Card';
import { useUserInfo } from '@/entities/User';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { TickProgress, TickState } from '@/shared/ui/TickProgress';
import cls from './AiQuotaCard.module.scss';

/** Не больше 30 делений, как в макете: при большом лимите одно деление — несколько запросов */
const MAX_TICKS = 30;

/** Квота ИИ на сегодня (Профиль 6.24): остаток, деления «израсходовано / осталось» */
export const AiQuotaCard = memo(() => {
    const { t } = useTranslation();
    const user = useUserInfo();
    const { data: remainingRaw, isLoading } = useGetAiUsageQuery();

    const unlimited = user?.role?.name === 'admin';
    const limit = user?.ai_limit ?? 0;
    const remaining = Math.max(0, Math.min(remainingRaw ?? limit, limit));

    const ticks = useMemo(() => {
        if (unlimited) {
            return Array<TickState>(MAX_TICKS).fill(TickState.DONE);
        }
        const count = Math.min(Math.max(limit, 1), MAX_TICKS);
        const usedTicks = limit ? Math.round(((limit - remaining) / limit) * count) : count;
        return Array.from({ length: count }, (_, i) => (i < usedTicks ? TickState.TODO : TickState.DONE));
    }, [unlimited, limit, remaining]);

    return (
        <Blueprint className={cls.AiQuotaCard}>
            <Kicker size={KickerSize.SM}>{t('Запросы к ИИ · сегодня')}</Kicker>
            <div className={cls.value}>
                <span className={cls.number}>{unlimited ? '∞' : (isLoading ? '—' : remaining)}</span>
                <span className={cls.caption}>
                    {unlimited ? t('без лимита') : t('из {{count}} осталось', { count: limit })}
                </span>
            </div>
            <TickProgress className={cls.ticks} ticks={ticks} />
            <span className={cls.note}>{t('Проверка переводов, подбор фраз и практика с ИИ')}</span>
        </Blueprint>
    );
});

AiQuotaCard.displayName = 'AiQuotaCard';
