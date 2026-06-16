import dayjs from 'dayjs';

function formatDate(date?: string) {
  if (!date) {
    return '';
  }

  const dayJs = dayjs(date);

  return dayJs.format('DD.MM.YYYY');
}

export { formatDate };
