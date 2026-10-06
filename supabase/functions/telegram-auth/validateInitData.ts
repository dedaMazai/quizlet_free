// Проверка подписи initData Telegram Mini App (без зависимостей — WebCrypto).

// initData старше суток не принимаем — защита от повторного использования перехваченных данных.
const INIT_DATA_MAX_AGE_SEC = 24 * 60 * 60;

export interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

const encoder = new TextEncoder();

const hmacSha256 = async (key: Uint8Array, data: string): Promise<Uint8Array> => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data)));
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

// Проверка подписи по https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export const validateInitData = async (
  initData: string,
  botToken: string,
  nowSec = Math.floor(Date.now() / 1000),
): Promise<TelegramUser | null> => {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');

  const secret = await hmacSha256(encoder.encode('WebAppData'), botToken);
  const expected = toHex(await hmacSha256(secret, dataCheckString));
  if (expected !== hash) return null;

  const authDate = Number(params.get('auth_date'));
  if (!authDate || nowSec - authDate > INIT_DATA_MAX_AGE_SEC) return null;

  try {
    const user = JSON.parse(params.get('user') ?? '');
    return typeof user?.id === 'number' ? user as TelegramUser : null;
  } catch {
    return null;
  }
};
