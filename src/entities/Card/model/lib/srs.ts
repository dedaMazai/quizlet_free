import { AnswerGrade } from '@/shared/lib/text';
import { CardLevel, CardReview } from '../types/cardReview';

/**
 * SM-2 lite. FSRS сознательно не берём: он требует подгонки параметров на истории
 * отзывов (нужен бэкграунд-джоб, которого в проекте нет) и шкалы Again/Hard/Good/Easy,
 * которую нечем заполнить — ответ проверяется автоматически, кнопок самооценки нет.
 */

/** Оценка ответа в терминах повторения. */
export type ReviewGrade = 'again' | 'hard' | 'good';

export const EASE_START = 2.5;
export const EASE_MIN = 1.3;
export const EASE_MAX = 2.8;
/** Интервал после выпуска из обучения. */
export const GRADUATING_INTERVAL = 1;
/** Интервал на втором успешном повторе. */
export const SECOND_INTERVAL = 3;
export const MAX_INTERVAL_DAYS = 365;
/** Порог «в долгой памяти» (аналог mature в Anki) — граница level 1 → 2. */
export const MASTERED_INTERVAL = 21;
/** Сколько верных ответов подряд нужно новой карточке внутри сессии. */
export const LEARNING_STEPS = 2;
/** Интервалы длиннее этого размываются, чтобы импортированная колода
 *  не вернулась на повтор одним днём. */
const FUZZ_MIN_INTERVAL = 3;
const FUZZ_RATIO = 0.05;

const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** ±5% разброса на длинных интервалах. */
const fuzz = (intervalDays: number): number => {
  if (intervalDays < FUZZ_MIN_INTERVAL) return intervalDays;
  const spread = intervalDays * FUZZ_RATIO;
  return intervalDays + (Math.random() * 2 - 1) * spread;
};

/** Learn отдаёт boolean, Write и Cloze — AnswerGrade. */
export const gradeFromAnswer = (grade: AnswerGrade | boolean): ReviewGrade => {
  if (typeof grade === 'boolean') return grade ? 'good' : 'again';
  if (grade === 'correct') return 'good';
  if (grade === 'almost') return 'hard';
  return 'again';
};

/**
 * Уровень освоенности — производное от состояния повторения.
 * Единственное место, где задано это правило: в БД level денормализован,
 * но вычисляется здесь и пишется клиентом.
 */
export const levelFromReview = (reps: number, intervalDays: number): CardLevel => {
  if (reps === 0) return 0;
  return intervalDays < MASTERED_INTERVAL ? 1 : 2;
};

/** Уровень карточки, у которой ещё нет состояния повторения. */
export const levelOf = (review: CardReview | null): CardLevel =>
  (review ? levelFromReview(review.reps, review.interval_days) : 0);

/** Уровень «усвоена» (см. levelFromReview) — для итога сессии. */
export const MASTERED_LEVEL: CardLevel = 2;

/** Пора ли повторять: у новой карточки состояния нет, она доступна всегда. */
export const isDue = (review: CardReview | null, now: Date = new Date()): boolean =>
  (review ? new Date(review.due_at).getTime() <= now.getTime() : true);

/** Следующий интервал при верном ответе. */
const nextInterval = (review: CardReview | null, grade: ReviewGrade): number => {
  if (grade === 'again') return 0;

  const reps = review?.reps ?? 0;
  const ease = review?.ease ?? EASE_START;
  const current = review?.interval_days ?? 0;

  if (grade === 'hard') {
    return reps === 0 ? GRADUATING_INTERVAL : Math.max(current * 1.2, GRADUATING_INTERVAL);
  }
  if (reps === 0) return GRADUATING_INTERVAL;
  if (reps === 1) return SECOND_INTERVAL;
  return current * ease;
};

/** Новое состояние повторения после ответа. now — параметр ради тестируемости. */
export const applyReview = (
  review: CardReview | null,
  cardUuid: string,
  grade: ReviewGrade,
  now: Date = new Date(),
): CardReview => {
  const prevEase = review?.ease ?? EASE_START;
  const easeDelta = grade === 'again' ? -0.2 : (grade === 'hard' ? -0.15 : 0);
  const ease = clamp(prevEase + easeDelta, EASE_MIN, EASE_MAX);

  const reps = grade === 'again' ? 0 : (review?.reps ?? 0) + 1;
  const lapses = (review?.lapses ?? 0) + (grade === 'again' ? 1 : 0);

  const raw = nextInterval(review, grade);
  const intervalDays = clamp(fuzz(raw), 0, MAX_INTERVAL_DAYS);

  return {
    card_uuid: cardUuid,
    level: levelFromReview(reps, intervalDays),
    reps,
    lapses,
    ease,
    interval_days: intervalDays,
    due_at: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    last_reviewed_at: now.toISOString(),
  };
};
