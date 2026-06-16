import dayjs from 'dayjs';

function formatTime(date: string) {
  if (!date) {
    return '';
  }

  const dayJs = dayjs(date);

  return dayJs.format('HH:mm');
}

export { formatTime };
