import {
  useEffect, useMemo, useRef, useState,
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
import { LearnSession } from '@/features/LearnSession';
import { SessionResult } from '@/widgets/SessionResult';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { VStack } from '@/shared/ui/Stack';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { NavSectionKey } from '@/shared/const/menu';
import { ReviewLocationState } from '@/shared/const/const';
import { useSetFocusMode } from '@/shared/lib/focusMode';
import { ReviewPreview } from './ReviewPreview';

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

  // Сессия работает со снимком выборки на момент старта: flush ответов
  // инвалидирует кэш и getDueCards перезапрашивается, но карточки идущей
  // сессии от этого меняться не должны.
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  // Сессия идёт на том же URL — оболочку прячем, пока она открыта
  useSetFocusMode(snapshot !== null);

  const freshCount = useMemo(
    () => (dueCards ?? []).filter((item) => item.review === null).length,
    [dueCards],
  );
  const overdueCount = (dueCards?.length ?? 0) - freshCount;

  const byDeck = useMemo(() => {
    const groups = new Map<string, { dueCount: number; freshCount: number }>();
    (dueCards ?? []).forEach((item) => {
      const group = groups.get(item.card.deck_uuid) ?? { dueCount: 0, freshCount: 0 };
      if (item.review === null) group.freshCount += 1;
      else group.dueCount += 1;
      groups.set(item.card.deck_uuid, group);
    });
    return [...groups.entries()]
      .map(([deckUuid, group]) => ({
        deckUuid,
        deckName: decks?.find((deck) => deck.uuid === deckUuid)?.name ?? t('Без колоды'),
        ...group,
      }))
      .sort((a, b) => (b.dueCount + b.freshCount) - (a.dueCount + a.freshCount));
  }, [dueCards, decks, t]);

  const handleStart = () => {
    setSnapshot(toSnapshot(dueCards ?? []));
  };

  // С главной («Начать повторение» / Enter) — сразу в сессию, без предпросмотра.
  // State сбрасываем, чтобы выход из сессии вернул на предпросмотр, а не в новый старт.
  const autostart = (location.state as ReviewLocationState | null)?.autostart;
  const autostartedRef = useRef(false);
  useEffect(() => {
    if (!autostart || !dueCards || autostartedRef.current) return;
    autostartedRef.current = true;
    navigate(location.pathname, { replace: true, state: null });
    if (dueCards.length > 0) setSnapshot(toSnapshot(dueCards));
  }, [autostart, dueCards, navigate, location.pathname]);

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
    <VStack max fullHeight gap="24">
      <SectionPageHeader section={NavSectionKey.LEARN} />
      <ReviewPreview
        dueCount={overdueCount}
        freshCount={freshCount}
        byDeck={byDeck}
        onStart={handleStart}
      />
    </VStack>
  );
};

export default ReviewPage;
