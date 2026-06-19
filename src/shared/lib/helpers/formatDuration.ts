/**
 * Форматирует длительность в миллисекундах в строку «Xч Yмин» / «Yмин» / «<1мин».
 * Единицы передаются локализованными (t('ч'), t('мин')), чтобы хелпер оставался без i18n.
 */
export const formatDuration = (
  ms: number,
  units: { h: string; min: string },
): string => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}${units.h} ${minutes}${units.min}`;
  if (minutes > 0) return `${minutes}${units.min}`;
  return `<1${units.min}`;
};
