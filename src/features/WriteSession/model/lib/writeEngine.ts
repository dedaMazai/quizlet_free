import { Card } from '@/entities/Card';
import { shuffle } from '@/shared/lib/utils';

export type WriteDirection = 'ru-en' | 'en-ru';

export interface WriteSettings {
  direction: WriteDirection;
  /** Засчитывать ответ с одной опечаткой как «почти верно». */
  typoTolerance: boolean;
}

/** Что показываем пользователю в вопросе. */
export const promptFor = (card: Card, direction: WriteDirection): string =>
  (direction === 'ru-en' ? card.translation : card.term);

/** Что должен написать пользователь. */
export const expectedFor = (card: Card, direction: WriteDirection): string =>
  (direction === 'ru-en' ? card.term : card.translation);

/** Метка режима для журнала статистики. */
export const statsMode = (direction: WriteDirection): 'write_ru_en' | 'write_en_ru' =>
  (direction === 'ru-en' ? 'write_ru_en' : 'write_en_ru');

/** Очередь uuid'ов всех карточек в перемешанном порядке. */
export const buildQueue = (cards: Card[]): string[] =>
  shuffle(cards).map((c) => c.uuid);
