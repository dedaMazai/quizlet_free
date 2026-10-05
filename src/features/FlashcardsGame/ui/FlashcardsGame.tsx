import {
  FC, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ConfigProvider, Empty, Segmented, theme,
} from 'antd';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { Card, FavoriteToggle, useGetFavoritesQuery } from '@/entities/Card';
import { Blueprint } from '@/shared/ui/Blueprint';
import { SessionButton, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { SessionStage, SessionStageGap } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import { buildPositionTicks, buildSessionTicks } from '@/shared/lib/session';
import { shuffle } from '@/shared/lib/utils';
import cls from './FlashcardsGame.module.scss';

type FavoriteFilter = 'all' | 'favorite' | 'notFavorite';

const NAV_ICON_SIZE = 20;
const SHUFFLE_ICON_SIZE = 16;
const ICON_STROKE = 1.5;

interface FlashcardsGameProps {
  cards: Card[];
  withFavoriteFilter?: boolean;
  /** Название в топбаре: «Колода · Карточки». */
  title: string;
  onExit: () => void;
  /** Заучивание того же набора — ссылка «Перейти к заучиванию →». */
  learnPath?: string;
}

export const FlashcardsGame: FC<FlashcardsGameProps> = (props) => {
  const {
    cards, withFavoriteFilter = true, title, onExit, learnPath,
  } = props;
  const { t } = useTranslation();

  const { token } = theme.useToken();
  // Сегмент по макету: без подложки и отступов трека, выбранный — accent с текстом цвета фона
  const segmentedTheme = useMemo(() => ({
    components: {
      Segmented: {
        trackBg: 'transparent',
        trackPadding: 0,
        itemSelectedBg: token.colorPrimary,
        itemSelectedColor: token.colorBgLayout,
        itemHoverBg: token.colorPrimaryBg,
      },
    },
  }), [token.colorPrimary, token.colorBgLayout, token.colorPrimaryBg]);

  const [filter, setFilter] = useState<FavoriteFilter>('all');
  const { data: favorites } = useGetFavoritesQuery(undefined, { skip: !withFavoriteFilter });

  const filteredCards = useMemo(() => {
    if (!withFavoriteFilter || filter === 'all') return cards;
    const favSet = new Set(favorites ?? []);
    return cards.filter((card) => (filter === 'favorite' ? favSet.has(card.uuid) : !favSet.has(card.uuid)));
  }, [cards, filter, favorites, withFavoriteFilter]);

  const [order, setOrder] = useState<Card[]>(filteredCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setOrder(filteredCards);
    setIndex(0);
    setFlipped(false);
  }, [filteredCards]);

  const current = order[index];

  const goPrev = () => {
    if (!order.length) return;
    setFlipped(false);
    setIndex((i) => (i - 1 + order.length) % order.length);
  };

  const goNext = () => {
    if (!order.length) return;
    setFlipped(false);
    setIndex((i) => (i + 1) % order.length);
  };

  const handleShuffle = () => {
    setOrder(shuffle(order));
    setIndex(0);
    setFlipped(false);
  };

  // Стрелки листают, пробел переворачивает
  useKeyDown((e) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === ' ' && current) {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  });

  const topBar = (
    <SessionTopBar
      title={title}
      counter={`${order.length ? index + 1 : 0} / ${order.length}`}
      ticks={order.length ? buildPositionTicks(index) : buildSessionTicks([], false)}
      onExit={onExit}
    />
  );

  if (!cards.length) {
    return (
      <>
        {topBar}
        <SessionStage>
          <Empty description={t('В колоде нет слов')} />
        </SessionStage>
      </>
    );
  }

  const filterControl = withFavoriteFilter && (
    <ConfigProvider theme={segmentedTheme}>
      <Segmented<FavoriteFilter>
        className={cls.filter}
        value={filter}
        onChange={setFilter}
        options={[
          { label: t('Все'), value: 'all' },
          { label: t('Избранные'), value: 'favorite' },
          { label: t('Неизбранные'), value: 'notFavorite' },
        ]}
      />
    </ConfigProvider>
  );

  return (
    <>
      {topBar}
      <SessionStage gap={SessionStageGap.SM}>
        {filterControl}

        {current ? (
          <>
            <Blueprint
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              className={cls.card}
              onClick={() => setFlipped((f) => !f)}
            >
              <span className={cls.side}>
                {flipped ? t('RU · Перевод') : t('EN · Слово')}
              </span>
              <span className={cls.tools}>
                <SpeakButton text={current.term} className={cls.tool} />
                <FavoriteToggle cardUuid={current.uuid} className={cls.tool} />
              </span>
              <span className={cls.word}>{flipped ? current.translation : current.term}</span>
              {!flipped && current.example && (
                <span className={cls.example}>“{current.example}”</span>
              )}
              <span className={cls.flipHint}>{t('Нажмите или пробел — перевернуть')}</span>
            </Blueprint>

            <div className={cls.controls}>
              <SessionButton
                variant={SessionButtonVariant.SECONDARY}
                className={cls.navBtn}
                onClick={goPrev}
              >
                <ChevronLeft size={NAV_ICON_SIZE} strokeWidth={ICON_STROKE} aria-label={t('Назад')} />
              </SessionButton>
              <SessionButton variant={SessionButtonVariant.SECONDARY} onClick={handleShuffle}>
                <Repeat size={SHUFFLE_ICON_SIZE} strokeWidth={ICON_STROKE} />
                {t('Перемешать')}
              </SessionButton>
              <SessionButton
                variant={SessionButtonVariant.SECONDARY}
                className={cls.navBtn}
                onClick={goNext}
              >
                <ChevronRight size={NAV_ICON_SIZE} strokeWidth={ICON_STROKE} aria-label={t('Далее')} />
              </SessionButton>
            </div>
          </>
        ) : (
          <Empty description={t('Нет карточек по выбранному фильтру')} />
        )}

        <span className={cls.note}>
          {t('Ознакомительный режим — прогресс не записывается.')}
          {learnPath && (
            <>
              {' '}
              {t('Готовы?')}
              {' '}
              <Link to={learnPath} className={cls.learnLink}>{t('Перейти к заучиванию →')}</Link>
            </>
          )}
        </span>
      </SessionStage>
    </>
  );
};
