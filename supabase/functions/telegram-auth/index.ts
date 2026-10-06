// Edge Function: вход в Zubrika из Telegram Mini App.
//
// Клиент присылает initData (подписанные Telegram данные о пользователе) и действие:
//   login  — если Telegram привязан, выпускаем magic-link → { token_hash }; иначе { status: 'NOT_LINKED' };
//   create — новый аккаунт для Telegram-пользователя (синтетический email) → { token_hash };
//   link   — привязать Telegram к вызывающему (по JWT) пользователю → { ok: true }.
// token_hash клиент обменивает на сессию через auth.verifyOtp (как в impersonate-user).
//
// Деплой:  supabase functions deploy telegram-auth --profile supabase
// Секреты: TELEGRAM_BOT_TOKEN (supabase secrets set ... --profile supabase);
//          SUPABASE_SERVICE_ROLE_KEY доступен в Edge Functions по умолчанию.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { validateInitData } from './validateInitData.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const TG_EMAIL_DOMAIN = 'telegram.zubrika.ru';

// magic-link для email пользователя; заблокированным вход не выдаём.
const issueToken = async (admin: SupabaseClient, userId: string): Promise<Response> => {
  const { data: profile, error } = await admin
    .from('profiles')
    .select('email, blocked')
    .eq('id', userId)
    .maybeSingle();
  if (error) return json({ error: 'LOOKUP_FAILED' }, 500);
  if (!profile?.email) return json({ error: 'USER_NOT_FOUND' }, 404);
  if (profile.blocked) return json({ error: 'USER_BLOCKED' }, 403);

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: profile.email,
  });
  if (linkError || !link?.properties?.hashed_token) {
    return json({ error: 'LINK_FAILED' }, 500);
  }
  return json({ token_hash: link.properties.hashed_token });
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let initData: string;
  let action: string;
  try {
    const body = await req.json();
    initData = typeof body?.init_data === 'string' ? body.init_data : '';
    action = typeof body?.action === 'string' ? body.action : '';
  } catch {
    return json({ error: 'BAD_REQUEST' }, 400);
  }
  if (!initData || !['login', 'create', 'link'].includes(action)) {
    return json({ error: 'BAD_REQUEST' }, 400);
  }

  const tgUser = await validateInitData(initData, Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '');
  if (!tgUser) {
    return json({ error: 'BAD_INIT_DATA' }, 401);
  }

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: existingError } = await admin
    .from('telegram_accounts')
    .select('user_id')
    .eq('telegram_id', tgUser.id)
    .maybeSingle();
  if (existingError) {
    return json({ error: 'LOOKUP_FAILED' }, 500);
  }

  if (action === 'link') {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'NOT_AUTHENTICATED' }, 401);
    }
    const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData, error: callerError } = await caller.auth.getUser();
    if (callerError || !callerData.user) {
      return json({ error: 'NOT_AUTHENTICATED' }, 401);
    }
    if (existing && existing.user_id !== callerData.user.id) {
      return json({ error: 'TELEGRAM_ALREADY_LINKED' }, 409);
    }
    // У пользователя мог быть привязан другой Telegram — заменяем привязку.
    await admin.from('telegram_accounts').delete().eq('user_id', callerData.user.id);
    const { error: linkError } = await admin.from('telegram_accounts').insert({
      telegram_id: tgUser.id,
      user_id: callerData.user.id,
      username: tgUser.username ?? null,
    });
    if (linkError) {
      return json({ error: 'LINK_FAILED' }, 500);
    }
    return json({ ok: true });
  }

  if (existing) {
    return issueToken(admin, existing.user_id);
  }
  if (action === 'login') {
    return json({ status: 'NOT_LINKED' });
  }

  // create: новый пользователь. Email синтетический — на него ничего не отправляется.
  const email = `tg${tgUser.id}@${TG_EMAIL_DOMAIN}`;
  const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'Telegram';
  let userId: string | undefined;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name },
  });
  if (created?.user) {
    userId = created.user.id;
  } else {
    // Пользователь уже создан прошлой попыткой, но привязка не записалась — находим его по email.
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    userId = profile?.id;
  }
  if (!userId) {
    console.error('createUser failed', createError);
    return json({ error: 'CREATE_FAILED' }, 500);
  }

  const { error: insertError } = await admin.from('telegram_accounts').insert({
    telegram_id: tgUser.id,
    user_id: userId,
    username: tgUser.username ?? null,
  });
  if (insertError) {
    return json({ error: 'LINK_FAILED' }, 500);
  }

  return issueToken(admin, userId);
});
