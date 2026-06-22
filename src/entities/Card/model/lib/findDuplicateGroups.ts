import { Card } from '../types/card';

const norm = (s: string): string => s.trim().toLowerCase();

/**
 * Находит группы карточек-дублей внутри списка.
 * Карточки попадают в одну группу, если совпадает нормализованное
 * слово (term) ИЛИ перевод (translation). За счёт «ИЛИ» дубли образуют
 * связные компоненты (A↔B по слову, B↔C по переводу ⇒ {A,B,C}),
 * поэтому используется union-find по индексам карточек.
 *
 * Возвращает группы размера ≥ 2 в порядке первого появления.
 */
export function findDuplicateGroups(cards: Card[]): Card[][] {
  const parent = cards.map((_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) {
      root = parent[root];
    }
    let node = i;
    while (parent[node] !== root) {
      const next = parent[node];
      parent[node] = root;
      node = next;
    }
    return root;
  };

  const union = (a: number, b: number): void => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent[rootB] = rootA;
    }
  };

  const termFirst: Record<string, number> = {};
  const translationFirst: Record<string, number> = {};

  cards.forEach((card, i) => {
    const termKey = norm(card.term);
    if (termKey) {
      if (termFirst[termKey] !== undefined) {
        union(termFirst[termKey], i);
      } else {
        termFirst[termKey] = i;
      }
    }

    const translationKey = norm(card.translation);
    if (translationKey) {
      if (translationFirst[translationKey] !== undefined) {
        union(translationFirst[translationKey], i);
      } else {
        translationFirst[translationKey] = i;
      }
    }
  });

  const groupsByRoot = new Map<number, Card[]>();
  cards.forEach((card, i) => {
    const root = find(i);
    const group = groupsByRoot.get(root);
    if (group) {
      group.push(card);
    } else {
      groupsByRoot.set(root, [card]);
    }
  });

  return Array.from(groupsByRoot.values()).filter((group) => group.length >= 2);
}
