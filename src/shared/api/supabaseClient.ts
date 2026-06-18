import { createClient } from '@supabase/supabase-js';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Единый клиент Supabase. Сам хранит сессию в localStorage и обновляет токены.
export const supabase = createClient(__SUPABASE_URL__, __SUPABASE_ANON_KEY__, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// id текущего пользователя из локальной сессии (без сетевого запроса).
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
};

// Оборачивает текст ошибки в формат, совместимый с baseQuery RTK Query.
export const supabaseError = (message: string): { error: FetchBaseQueryError } => ({
  error: { status: 'CUSTOM_ERROR', error: message },
});
