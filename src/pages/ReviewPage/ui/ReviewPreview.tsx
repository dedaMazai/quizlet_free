import { CSSProperties, FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { ForecastDay } from '@/entities/Statistics';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { Blueprint, BlueprintCorners } from '@/shared/ui/Blueprint';
import { CheckSquare } from '@/shared/ui/CheckSquare';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { MasteryBar } from '@/shared/ui/MasteryBar';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { estimateReviewMinutes } from '@/shared/const/const';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './ReviewPreview.module.scss';

const ARROW_SIZE = 18;
/** Подписи оси графика: сегодня, через неделю, через две */
const WEEK_DAYS = 7;

export interface ReviewDeckRow {
  deckUuid: string;
  deckName: string;
  /** Просроченные карточки колоды в выборке. */
  dueCount: number;
  /** Новые (ещё не изучавшиеся) карточки колоды в выборке. */
  freshCount: number;
  /** Доли «усвоено» / «изучаю» колоды, 0–100 */
  mastered: number;
  learning: number;
  /** Колода входит в сессию */
  included: boolean;
}

interface ReviewPreviewProps {
  /** Просроченные карточки сессии (без исключённых колод) */
  dueCount: number;
  /** Новые карточки сессии */
  freshCount: number;
  /** Нагрузка по дням, день 0 — сегодня с просроченными */
  forecast: ForecastDay[];
  decks: ReviewDeckRow[];
  onToggleDeck: (deckUuid: string, included: boolean) => void;
  onStart: () => void;
}

export const ReviewPreview: FC<ReviewPreviewProps> = (props) => {
  const {
    dueCount, freshCount, forecast, decks, onToggleDeck, onStart,
  } = props;
  const { t } = useTranslation();
  const sessionCount = dueCount + freshCount;

  const load = useMemo(() => {
    const max = Math.max(0, ...forecast.map((day) => day.count));
    const average = forecast.length
      ? Math.round(forecast.reduce((sum, day) => sum + day.count, 0) / forecast.length)
      : 0;
    return {
      average,
      // Высоты — данные, а не оформление: передаём через CSS-переменные
      averageStyle: { '--ratio': max > 0 ? average / max : 0 } as CSSProperties,
      bars: forecast.map((day) => ({
        date: day.date,
        count: day.count,
        style: { '--ratio': max > 0 ? day.count / max : 0 } as CSSProperties,
      })),
    };
  }, [forecast]);

  const includedDecks = decks.filter((deck) => deck.included).length;

  return (
    <>
      <div className={cls.top}>
        <AccentPanel className={cls.session}>
          <Kicker tone={KickerTone.ON_DARK}>{t('Сессия на сегодня')}</Kicker>
          <div className={cls.counts}>
            <div className={cls.countCol}>
              <span className={cls.dueCount}>{dueCount}</span>
              <span className={cls.countLabel}>{t('к повторению')}</span>
            </div>
            {freshCount > 0 && (
              <div className={cls.countCol}>
                <span className={cls.freshCount}>{`+${freshCount}`}</span>
                <span className={cls.countLabel}>{t('новых')}</span>
              </div>
            )}
          </div>
          <p className={cls.hint}>
            {t('Верный ответ отодвигает следующий показ, ошибка — возвращает слово в эту же сессию.')}
          </p>
          <div className={cls.actions}>
            <Blueprint
              as="button"
              type="button"
              corners={BlueprintCorners.LIGHT}
              className={cls.start}
              disabled={!sessionCount}
              onClick={onStart}
            >
              {t('Начать · ≈ {{count}} мин', { count: estimateReviewMinutes(sessionCount) })}
              <ArrowRight aria-hidden size={ARROW_SIZE} />
            </Blueprint>
          </div>
        </AccentPanel>

        <Blueprint className={cls.load}>
          <div className={cls.loadHeader}>
            <span className={cls.loadTitle}>{t('Нагрузка на 2 недели')}</span>
            <span className={cls.loadAverage}>{t('≈ {{count}} / день', { count: load.average })}</span>
          </div>
          <div className={cls.chart}>
            {load.average > 0 && <div className={cls.averageLine} style={load.averageStyle} />}
            {load.bars.map((bar, i) => (
              <div key={bar.date} className={cls.barCol}>
                <span className={cls.barValue}>{bar.count}</span>
                <div
                  className={classNames(cls.bar, [], { [cls.barToday]: i === 0 })}
                  style={bar.style}
                />
              </div>
            ))}
          </div>
          <div className={cls.axis}>
            <span>{t('Сегодня')}</span>
            <span>{t('+{{count}} дн', { count: WEEK_DAYS })}</span>
            <span>{t('+{{count}} дн', { count: WEEK_DAYS * 2 })}</span>
          </div>
        </Blueprint>
      </div>

      <div className={cls.decks}>
        <SectionHeader
          title={t('Что войдёт в сессию')}
          extra={(
            <span className={cls.decksSummary}>
              {`${t('{{included}} из {{count}} колод', { included: includedDecks, count: decks.length })} · ${
                sessionCount} ${t('карточки', { count: sessionCount })}`}
            </span>
          )}
        />
        <div className={cls.deckList}>
          {decks.map((deck) => (
            // label передаёт клик по строке чекбоксу-кнопке
            <label
              key={deck.deckUuid}
              className={classNames(cls.deckRow, [], { [cls.excluded]: !deck.included })}
            >
              <CheckSquare
                checked={deck.included}
                label={deck.deckName}
                onChange={(checked) => onToggleDeck(deck.deckUuid, checked)}
              />
              <span className={cls.deckName}>{deck.deckName}</span>
              <span className={cls.deckDue}>
                <b>{deck.dueCount}</b>
                {` ${t('к повторению')}`}
              </span>
              <span className={cls.deckFresh}>{t('{{count}} новых', { count: deck.freshCount })}</span>
              <MasteryBar mastered={deck.mastered} learning={deck.learning} />
            </label>
          ))}
        </div>
      </div>
    </>
  );
};
