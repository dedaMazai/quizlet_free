import {
  FC, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ConfigProvider, Empty, Segmented, theme,
} from 'antd';
import {
  ChevronLeft, ChevronRight, Repeat, Volume2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card, FavoriteToggle, useGetFavoritesQuery } from '@/entities/Card';
import { Blueprint } from '@/shared/ui/Blueprint';
import { SessionButton, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { SessionStage, SessionStageGap } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { useReducedMotion } from '@/shared/lib/hooks/useReducedMotion';
import { EASE, MOTION_MS } from '@/shared/const/motion';
import { buildPositionTicks, buildSessionTicks } from '@/shared/lib/session';
import { shuffle } from '@/shared/lib/utils';
import cls from './FlashcardsGame.module.scss';

type FavoriteFilter = 'all' | 'favorite' | 'notFavorite';

const NAV_ICON_SIZE = 20;
const SHUFFLE_ICON_SIZE = 16;
const MOBILE_NAV_ICON_SIZE = 22;
const MOBILE_SHUFFLE_ICON_SIZE = 18;
const TOOL_ICON_SIZE = 20;
// Мобильный сегмент — 40px
const MOBILE_FILTER_HEIGHT = 40;
const ICON_STROKE = 1.5;
const FLIPPED_ANGLE = 180;
const FLIP_TRANSITION = { duration: MOTION_MS.slow / 1000, ease: EASE.standard };

interface FlashcardsGameProps {
  cards: Card[];
  withFavoriteFilter?: boolean;
  /** Название в топбаре: «Колода · Карточки». */
  title: string;
  onExit: () => void;
  /** Заучивание того же набора — ссылка «Перейти к заучиванию →». */
  learnPath?: string;
  /** Один проход: «Далее» на последней карточке завершает сессию вместо перехода к первой. */
  onFinish?: () => void;
  /** Подпись выхода в топбаре вместо «Выйти» */
  exitLabel?: string;
}

export const FlashcardsGame: FC<FlashcardsGameProps> = (props) => {
  const {
    cards, withFavoriteFilter = true, title, onExit, learnPath, onFinish, exitLabel,
  } = props;
  const { t } = useTranslation();
  const { isMobile } = useMatchMedia();
  const reducedMotion = useReducedMotion();
  const navIconSize = isMobile ? MOBILE_NAV_ICON_SIZE : NAV_ICON_SIZE;
  const shuffleIconSize = isMobile ? MOBILE_SHUFFLE_ICON_SIZE : SHUFFLE_ICON_SIZE;

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
        ...(isMobile ? { controlHeight: MOBILE_FILTER_HEIGHT } : {}),
      },
    },
  }), [token.colorPrimary, token.colorBgLayout, token.colorPrimaryBg, isMobile]);

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
    if (onFinish && index === order.length - 1) {
      onFinish();
      return;
    }
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
      exitLabel={exitLabel}
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

  const flipHint = isMobile ? t('Коснитесь — перевернуть') : t('Нажмите или пробел — перевернуть');

  const filterControl = withFavoriteFilter && (
    <ConfigProvider theme={segmentedTheme}>
      <Segmented<FavoriteFilter>
        className={cls.filter}
        block={isMobile}
        value={filter}
        onChange={setFilter}
        options={[
          { label: t('Все'), value: 'all' },
          { label: t('Избранные'), value: 'favorite' },
          { label: isMobile ? t('Остальные') : t('Неизбранные'), value: 'notFavorite' },
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
            {/* Переворот: rotateY 180° с перспективой; при reduced motion — смена сторон через opacity */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              className={classNames(cls.scene, [], { [cls.reduced]: reducedMotion })}
              onClick={() => setFlipped((f) => !f)}
            >
              <motion.div
                // Новая карточка появляется лицом, без обратного переворота
                key={current.uuid}
                className={cls.flipper}
                initial={false}
                animate={{ rotateY: flipped && !reducedMotion ? FLIPPED_ANGLE : 0 }}
                transition={FLIP_TRANSITION}
              >
                <Blueprint
                  className={classNames(cls.card, [cls.front], { [cls.hidden]: flipped })}
                  inert={flipped}
                >
                  <span className={cls.side}>{t('EN · Слово')}</span>
                  <span className={cls.tools}>
                    <SpeakButton
                      text={current.term}
                      className={cls.tool}
                      icon={<Volume2 aria-hidden size={TOOL_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    />
                    <FavoriteToggle cardUuid={current.uuid} className={cls.tool} />
                  </span>
                  <span className={cls.word}>{current.term}</span>
                  {current.example && (
                    <span className={cls.example}>“{current.example}”</span>
                  )}
                  <span className={cls.flipHint}>{flipHint}</span>
                </Blueprint>
                <Blueprint
                  className={classNames(cls.card, [cls.back], { [cls.hidden]: !flipped })}
                  inert={!flipped}
                >
                  <span className={cls.side}>{t('RU · Перевод')}</span>
                  <span className={cls.tools}>
                    <SpeakButton
                      text={current.term}
                      className={cls.tool}
                      icon={<Volume2 aria-hidden size={TOOL_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    />
                    <FavoriteToggle cardUuid={current.uuid} className={cls.tool} />
                  </span>
                  <span className={cls.word}>{current.translation}</span>
                  <span className={cls.flipHint}>{flipHint}</span>
                </Blueprint>
              </motion.div>
            </div>

            <div className={cls.controls}>
              <SessionButton
                variant={SessionButtonVariant.SECONDARY}
                className={classNames(cls.control, [cls.navBtn])}
                onClick={goPrev}
              >
                <ChevronLeft size={navIconSize} strokeWidth={ICON_STROKE} aria-label={t('Назад')} />
              </SessionButton>
              <SessionButton
                variant={SessionButtonVariant.SECONDARY}
                className={cls.control}
                onClick={handleShuffle}
              >
                <Repeat size={shuffleIconSize} strokeWidth={ICON_STROKE} />
                {t('Перемешать')}
              </SessionButton>
              <SessionButton
                variant={SessionButtonVariant.SECONDARY}
                className={classNames(cls.control, [cls.navBtn])}
                onClick={goNext}
              >
                <ChevronRight size={navIconSize} strokeWidth={ICON_STROKE} aria-label={t('Далее')} />
              </SessionButton>
            </div>
          </>
        ) : (
          <Empty description={t('Нет карточек по выбранному фильтру')} />
        )}

        {!onFinish && (
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
        )}
      </SessionStage>
    </>
  );
};
