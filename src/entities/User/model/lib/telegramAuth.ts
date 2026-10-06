import { supabase } from '@/shared/api/supabaseClient';
import { getTelegramInitData } from '@/shared/lib/telegram';
import { getFunctionErrorCode } from './getFunctionErrorCode';

export type TelegramAuthAction = 'login' | 'create' | 'link';

interface TelegramAuthResult {
  /** Сессия получена (login/create с привязанным аккаунтом). */
  signedIn: boolean
  error?: string
}

// Вызов Edge Function telegram-auth с подписанными данными запуска Mini App.
// login/create при успехе отдают одноразовый токен и сразу обмениваются на сессию.
export const invokeTelegramAuth = async (action: TelegramAuthAction): Promise<TelegramAuthResult> => {
  const { data, error } = await supabase.functions.invoke('telegram-auth', {
    body: { init_data: getTelegramInitData(), action },
  });
  if (error) return { signedIn: false, error: await getFunctionErrorCode(error) };

  const tokenHash = (data as { token_hash?: string } | null)?.token_hash;
  if (!tokenHash) return { signedIn: false };

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink',
  });
  if (verifyError) return { signedIn: false, error: verifyError.message };
  return { signedIn: true };
};
