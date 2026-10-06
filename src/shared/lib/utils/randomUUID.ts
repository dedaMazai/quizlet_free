const UUID_BYTES = 16;
const HEX = 16;
// RFC 4122 v4: версия в 7-м байте, вариант в 9-м
const VERSION_BYTE = 6;
const VARIANT_BYTE = 8;

/**
 * crypto.randomUUID с фолбэком: его нет в WebView iOS < 15.4 и Android < 92
 * (в т.ч. в Telegram Mini App на старых устройствах)
 */
export const randomUUID = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(UUID_BYTES));
  bytes[VERSION_BYTE] = (bytes[VERSION_BYTE] & 0x0f) | 0x40;
  bytes[VARIANT_BYTE] = (bytes[VARIANT_BYTE] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(HEX).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
