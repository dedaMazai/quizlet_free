import {
    memo, ReactNode, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery } from '@/entities/Card';
import { useGetDeckQuery } from '@/entities/Deck';
import { StudyEventDraft, useLogStudyEventsMutation } from '@/entities/Statistics';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { SessionResult } from '@/widgets/SessionResult';
import { PageLoader } from '@/widgets/PageLoader';
import {
    buildSessionTicks, SessionAnswer, SessionSummary, summarizeSession,
} from '@/shared/lib/session';
import { useToast } from '@/shared/lib/toast';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { SessionButton } from '@/shared/ui/SessionButton';
import { SessionStage } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import { estimateFlashcardsMinutes, FIRST_SESSION_SIZE } from '../../model/onboarding';
import cls from '../OnboardingPage.module.scss';

enum SessionPhase {
    INTRO = 'intro',
    PLAYING = 'playing',
    RESULT = 'result',
}

interface SessionStepProps {
    header: ReactNode;
    deckUuid: string;
    onSkip: () => void;
    /** Колоды нет (удалена, чужая ссылка) или в ней не осталось слов — снова выбор колоды */
    onChooseDeck: (deckUuid?: string) => void;
    /** Сессия пройдена: онбординг завершён */
    onComplete: () => void;
    /** Выход с итога: на главную */
    onFinish: () => void;
}

/** Шаг 3: первая сессия «Карточки» по первым 20 словам → итог с началом серии */
export const SessionStep = memo((props: SessionStepProps) => {
    const {
        header, deckUuid, onSkip, onChooseDeck, onComplete, onFinish,
    } = props;
    const { t } = useTranslation();
    const toast = useToast();
    const {
        data: deck, isLoading: isDeckLoading, isSuccess: isDeckLoaded, isError: isDeckError,
    } = useGetDeckQuery(deckUuid);
    const { data: cards, isLoading: isCardsLoading, isError: isCardsError } = useGetCardsQuery(deckUuid);
    const [logStudyEvents] = useLogStudyEventsMutation();

    const [phase, setPhase] = useState(SessionPhase.INTRO);
    // Новый запуск FlashcardsGame при «Пройти заново»
    const [runKey, setRunKey] = useState(0);
    const [summary, setSummary] = useState<SessionSummary>();
    const startedAtRef = useRef(0);
    const finishingRef = useRef(false);

    const sessionCards = useMemo(() => (cards ?? []).slice(0, FIRST_SESSION_SIZE), [cards]);
    const answers = useMemo<SessionAnswer[]>(
        () => sessionCards.map((card) => ({ cardUuid: card.uuid, correct: true })),
        [sessionCards],
    );
    const deckName = deck?.name ?? '';
    const title = `${deckName} · ${t('Карточки')}`;

    const isDeckMissing = isDeckError || (isDeckLoaded && !deck);
    // Слова не загрузились — тоже к выбору колоды: там их можно добавить или выбрать заново
    const isDeckEmpty = cards?.length === 0 || isCardsError;
    // До старта: без колоды или слов сессия невозможна. Во время итога колоду могли удалить — не уводим
    const shouldChooseDeck = phase === SessionPhase.INTRO && (isDeckMissing || isDeckEmpty);
    useEffect(() => {
        if (shouldChooseDeck) onChooseDeck(isDeckMissing ? undefined : deckUuid);
    }, [shouldChooseDeck, isDeckMissing, deckUuid, onChooseDeck]);

    const start = () => {
        startedAtRef.current = Date.now();
        finishingRef.current = false;
        setRunKey((key) => key + 1);
        setPhase(SessionPhase.PLAYING);
    };

    // Просмотры пишутся с mode = 'flashcards': день идёт в серию, но не в ответы и точность
    // (это различают RPC статистики). SRS не трогаем
    const finish = async () => {
        if (finishingRef.current) return;
        finishingRef.current = true;
        const startedAt = startedAtRef.current;
        const durationPerCard = Math.round((Date.now() - startedAt) / sessionCards.length);
        const sessionId = crypto.randomUUID();
        const events: StudyEventDraft[] = sessionCards.map((card) => ({
            card_id: card.uuid,
            is_correct: true,
            level_before: 0,
            level_after: 0,
            mode: 'flashcards',
            duration_ms: durationPerCard,
            session_id: sessionId,
        }));
        try {
            await logStudyEvents({ deckKey: deckUuid, deckName, events }).unwrap();
        } catch {
            toast.error(t('Не удалось сохранить занятие'));
        }
        onComplete();
        setSummary(summarizeSession(answers, startedAt));
        setPhase(SessionPhase.RESULT);
    };

    if (isDeckLoading || isCardsLoading || shouldChooseDeck) return <PageLoader />;

    if (phase === SessionPhase.PLAYING) {
        return (
            <FlashcardsGame
                key={runKey}
                cards={sessionCards}
                withFavoriteFilter={false}
                title={title}
                onExit={onSkip}
                exitLabel={t('Пропустить')}
                onFinish={finish}
            />
        );
    }

    if (phase === SessionPhase.RESULT && summary) {
        return (
            <>
                <SessionTopBar
                    title={title}
                    counter={`${sessionCards.length} / ${sessionCards.length}`}
                    ticks={buildSessionTicks(answers, false)}
                    onExit={onFinish}
                />
                <SessionResult
                    summary={summary}
                    words={sessionCards}
                    onRestart={start}
                    deckId={deckUuid}
                    deckName={deckName}
                    trackAccuracy={false}
                />
            </>
        );
    }

    return (
        <>
            {header}
            <SessionStage>
                <div className={cls.head}>
                    <Kicker tone={KickerTone.ACCENT}>{t('Первая сессия')}</Kicker>
                    <h1 className={cls.title}>
                        {t('Колода готова — {{words}}', { words: t('{{count}} слов', { count: cards?.length ?? 0 }) })}
                    </h1>
                    <p className={cls.text}>
                        {t('≈ {{count}} мин на первое знакомство: переворачивайте карточки и запоминайте перевод.', {
                            count: estimateFlashcardsMinutes(sessionCards.length),
                        })}
                    </p>
                </div>
                <SessionButton className={cls.cta} disabled={!sessionCards.length} onClick={start}>
                    {t('Начать')}
                </SessionButton>
            </SessionStage>
        </>
    );
});

SessionStep.displayName = 'SessionStep';
