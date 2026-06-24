import avatar1 from '@/shared/assets/avatars/avatar-1.svg?url';
import avatar2 from '@/shared/assets/avatars/avatar-2.svg?url';
import avatar3 from '@/shared/assets/avatars/avatar-3.svg?url';
import avatar4 from '@/shared/assets/avatars/avatar-4.svg?url';
import avatar5 from '@/shared/assets/avatars/avatar-5.svg?url';
import avatar6 from '@/shared/assets/avatars/avatar-6.svg?url';

export interface AvatarPreset {
  key: string;
  src: string;
}

// Дефолтные аватарки в бандле — пользователь выбирает одну, в БД хранится только ключ.
export const AVATARS: AvatarPreset[] = [
  { key: 'avatar-1', src: avatar1 },
  { key: 'avatar-2', src: avatar2 },
  { key: 'avatar-3', src: avatar3 },
  { key: 'avatar-4', src: avatar4 },
  { key: 'avatar-5', src: avatar5 },
  { key: 'avatar-6', src: avatar6 },
];

// URL аватарки по ключу. undefined — если ключ не задан или неизвестен (рендерим фолбэк-иконку).
export const getAvatarSrc = (key?: string): string | undefined =>
  AVATARS.find((a) => a.key === key)?.src;
