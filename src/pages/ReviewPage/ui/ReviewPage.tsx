import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Result } from 'antd';
import dayjs from 'dayjs';
import {
  Card,
  CardReview,
  DueCard,
  REVIEW_EVENTS_KEY,
  useGetDueCardsQuery,
  useGetDueCountQuery,
} from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { useGetDueSummaryQuery, useGetMasteryQuery } from '@/entities/Statistics';
import { useUserInfo } from '@/entities/User';
import { LearnSession } from '@/features/LearnSession';
import { SessionResult } from '@/widgets/SessionResult';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { VStack } from '@/shared/ui/Stack';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { NavSectionKey } from '@/shared/const/menu';
import { ReviewLocationState } from '@/shared/const/const';
import { useSetFocusMode } from '@/shared/lib/focusMode';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { LOCAL_STORAGE_REVIEW_EXCLUDED_DECKS_KEY } from '@/shared/const/localstorage';
import { ReviewPreview, ReviewDeckRow } from './ReviewPreview';
import cls from './ReviewPage.module.scss';

/** Дней в графике нагрузки */
const FORECAST_DAYS = 14;
const PERCENT = 100;
const NO_DECKS: string[] = [];

const toPercent = (part: number, total: number): number => (
  total > 0 ? Math.round((part / total) * PERCENT) : 0
);

interface SessionSnapshot {
  /** Новый запуск (в том числе «Повторить трудные») пересоздаёт сессию */
  id: number;
  cards: Card[];
  reviews: CardReview[];
}

const toSnapshot = (items: DueCard[]): SessionSnapshot => ({
  id: Date.now(),
  cards: items.map((item) => item.card),
  reviews: items.flatMap((item) => (item.review ? [item.review] : [])),
});

const ReviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: dueCards, isLoading } = useGetDueCardsQuery(undefined);
  const { data: dueCount } = useGetDueCountQuery(undefined);
  const { data: decks } = useGetDecksQuery();
  const { data: mastery } = useGetMasteryQuery();
  const userInfo = useUserInfo();
  const tz = userInfo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const { data: dueSummary } = useGetDueSummaryQuery({ tz, days: FORECAST_DAYS });

  // Колоды, исключённые из сессии, — только на этом устройстве
  const [excludedDecks, setExcludedDecks] = useLocalStorage<string[]>(
    LOCAL_STORAGE_REVIEW_EXCLUDED_DECKS_KEY,
    NO_DECKS,
  );
  const sessionCards = useMemo(
    () => (dueCards ?? []).filter((item) => !excludedDecks.includes(item.card.deck_uuid)),
    [dueCards, excludedDecks],
  );

  // Сессия работает со снимком выборки на момент старта: flush ответов
  // инвалидирует кэш и getDueCards перезапрашивается, но карточки идущей
  // сессии от этого меняться не должны.
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  // Сессия идёт на том же URL — оболочку прячем, пока она открыта
  useSetFocusMode(snapshot !== null);

  const freshCount = useMemo(
    () => sessionCards.filter((item) => item.review === null).length,
    [sessionCards],
  );
  const overdueCount = sessionCards.length - freshCount;

  const deckRows = useMemo<ReviewDeckRow[]>(() => {
    const groups = new Map<string, { dueCount: number; freshCount: number }>();
    (dueCards ?? []).forEach((item) => {
      const group = groups.get(item.card.deck_uuid) ?? { dueCount: 0, freshCount: 0 };
      if (item.review === null) group.freshCount += 1;
      else group.dueCount += 1;
      groups.set(item.card.deck_uuid, group);
    });
    return [...groups.entries()]
      .map(([deckUuid, group]) => {
        const deck = decks?.find((item) => item.uuid === deckUuid);
        const deckMastery = mastery?.perDeck.find((item) => item.deckKey === deckUuid);
        return {
          deckUuid,
          deckName: deck?.name ?? t('Без колоды'),
          ...group,
          mastered: toPercent(deckMastery?.mastered ?? 0, deck?.cards_count ?? 0),
          learning: toPercent(deckMastery?.learning ?? 0, deck?.cards_count ?? 0),
          included: !excludedDecks.includes(deckUuid),
        };
      })
      .sort((a, b) => (b.dueCount + b.freshCount) - (a.dueCount + a.freshCount));
  }, [dueCards, decks, mastery, excludedDecks, t]);

  const handleToggleDeck = useCallback((deckUuid: string, included: boolean) => {
    setExcludedDecks((prev) => (
      included ? prev.filter((uuid) => uuid !== deckUuid) : [...prev, deckUuid]
    ));
  }, [setExcludedDecks]);

  const handleStart = () => {
    setSnapshot(toSnapshot(sessionCards));
  };

  // С главной («Начать повторение» / Enter) — сразу в сессию, без предпросмотра.
  // State сбрасываем, чтобы выход из сессии вернул на предпросмотр, а не в новый старт.
  const autostart = (location.state as ReviewLocationState | null)?.autostart;
  const autostartedRef = useRef(false);
  useEffect(() => {
    if (!autostart || !dueCards || autostartedRef.current) return;
    autostartedRef.current = true;
    navigate(location.pathname, { replace: true, state: null });
    if (sessionCards.length > 0) setSnapshot(toSnapshot(sessionCards));
  }, [autostart, dueCards, sessionCards, navigate, location.pathname]);

  const handleRepeatHard = (cardUuids: string[]) => {
    if (!snapshot) return;
    const uuids = new Set(cardUuids);
    setSnapshot({
      id: Date.now(),
      cards: snapshot.cards.filter((card) => uuids.has(card.uuid)),
      reviews: snapshot.reviews.filter((review) => uuids.has(review.card_uuid)),
    });
  };

  if (snapshot) {
    return (
      <LearnSession
        key={snapshot.id}
        cards={snapshot.cards}
        reviews={snapshot.reviews}
        deckKey={REVIEW_EVENTS_KEY}
        deckName={t('К повторению')}
        allowReset={false}
        title={t('Повторение')}
        onExit={() => setSnapshot(null)}
        renderResult={(summary, restart) => (
          <SessionResult
            summary={summary}
            words={snapshot.cards}
            onRestart={restart}
            onRepeatHard={handleRepeatHard}
          />
        )}
      />
    );
  }

  if (isLoading) return <Loader />;

  if (!dueCards?.length) {
    return (
      <VStack max fullHeight gap="24">
        <SectionPageHeader section={NavSectionKey.LEARN} />
        <Result
          status="success"
          title={t('На сегодня всё!')}
          subTitle={dueCount?.nextDueAt
            ? t('Ближайший повтор: {{date}}', {
              date: dayjs(dueCount.nextDueAt).format('D MMMM, HH:mm'),
            })
            : undefined}
          extra={(
            <Button type="primary" onClick={() => navigate(RoutePath.DECKS())}>
              {t('Учить новые слова')}
            </Button>
          )}
        />
      </VStack>
    );
  }

  return (
    <div className={cls.ReviewPage}>
      <SectionPageHeader section={NavSectionKey.LEARN} />
      <ReviewPreview
        dueCount={overdueCount}
        freshCount={freshCount}
        forecast={dueSummary?.forecast ?? []}
        decks={deckRows}
        onToggleDeck={handleToggleDeck}
        onStart={handleStart}
      />
    </div>
  );
};

export default ReviewPage;
