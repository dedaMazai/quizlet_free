import { formatDate } from './formatDate';
import { formatTime } from './formatTime';

function formatDateTime(date: string) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export { formatDateTime };
