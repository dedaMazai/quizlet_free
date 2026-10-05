/** Цвет плитки аватара — из рамп темы (Аккаунт 6.24) */
export enum AvatarTone {
  ACCENT_700 = 'accent700',
  NEUTRAL_200 = 'neutral200',
  ACCENT_400 = 'accent400',
  NEUTRAL_800 = 'neutral800',
  ACCENT_100 = 'accent100',
  FIELD = 'field',
  NEUTRAL_400 = 'neutral400',
}

export interface AvatarPreset {
  key: string;
  letter: string;
  tone: AvatarTone;
}

// Пресеты-буквы на цветах рамп; в БД хранится только ключ (`profiles.avatar`), ключи прежние.
export const AVATARS: AvatarPreset[] = [
  { key: 'avatar-1', letter: 'A', tone: AvatarTone.ACCENT_700 },
  { key: 'avatar-2', letter: 'Z', tone: AvatarTone.NEUTRAL_200 },
  { key: 'avatar-3', letter: 'B', tone: AvatarTone.ACCENT_400 },
  { key: 'avatar-4', letter: 'K', tone: AvatarTone.NEUTRAL_800 },
  { key: 'avatar-5', letter: 'M', tone: AvatarTone.ACCENT_100 },
  { key: 'avatar-6', letter: 'S', tone: AvatarTone.FIELD },
  { key: 'avatar-7', letter: 'R', tone: AvatarTone.NEUTRAL_400 },
];

// Пресет по ключу. undefined — ключ не задан или неизвестен (рендерим инициалы).
export const getAvatarPreset = (key?: string): AvatarPreset | undefined =>
  AVATARS.find((a) => a.key === key);
