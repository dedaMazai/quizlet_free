// Edge Function: вход администратора от имени пользователя («Войти как пользователь», Аккаунт 6.26).
//
// Поток:
//   1. определяем вызывающего по JWT и проверяем is_admin();
//   2. service role: находим email цели, выпускаем magic-link (письмо не отправляется);
//   3. пишем вход в admin_audit_log (supabase/privacy.sql);
//   4. возвращаем hashed_token — клиент обменивает его на сессию через auth.verifyOtp.
// Нельзя войти от имени себя, другого администратора или заблокированного пользователя.
//
// Деплой:  supabase functions deploy impersonate-user --profile supabase
// Секреты: SUPABASE_SERVICE_ROLE_KEY доступен в Edge Functions по умолчанию.

import { createClient } from 'jsr:@supabase/supabase-js@2';

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'NOT_AUTHENTICATED' }, 401);
  }

  const url = Deno.env.get('SUPABASE_URL') ?? '';

  // Клиент с JWT вызывающего — чтобы auth.uid() в is_admin() резолвился в него.
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: callerData, error: callerError } = await caller.auth.getUser();
  if (callerError || !callerData.user) {
    return json({ error: 'NOT_AUTHENTICATED' }, 401);
  }

  const { data: isAdmin } = await caller.rpc('is_admin');
  if (!isAdmin) {
    return json({ error: 'NOT_ADMIN' }, 403);
  }

  let userId: string;
  try {
    const body = await req.json();
    userId = typeof body?.user_id === 'string' ? body.user_id : '';
  } catch {
    return json({ error: 'BAD_REQUEST' }, 400);
  }
  if (!userId) {
    return json({ error: 'BAD_REQUEST' }, 400);
  }
  if (userId === callerData.user.id) {
    return json({ error: 'CANNOT_IMPERSONATE_SELF' }, 400);
  }

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: target, error: targetError } = await admin
    .from('profiles')
    .select('email, role, blocked')
    .eq('id', userId)
    .maybeSingle();
  if (targetError) {
    return json({ error: 'LOOKUP_FAILED' }, 500);
  }
  if (!target) {
    return json({ error: 'USER_NOT_FOUND' }, 404);
  }
  if (target.role === 'admin') {
    return json({ error: 'CANNOT_IMPERSONATE_ADMIN' }, 403);
  }
  if (target.blocked) {
    return json({ error: 'USER_BLOCKED' }, 403);
  }

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: target.email,
  });
  if (linkError || !link?.properties?.hashed_token) {
    return json({ error: 'LINK_FAILED' }, 500);
  }

  // Журнал действий администратора (supabase/privacy.sql): без записи вход не выдаём —
  // доступ к чужому аккаунту должен оставлять след.
  const { error: auditError } = await admin.from('admin_audit_log').insert({
    admin_id: callerData.user.id,
    target_user_id: userId,
    action: 'impersonate',
  });
  if (auditError) {
    return json({ error: 'AUDIT_FAILED' }, 500);
  }

  return json({ token_hash: link.properties.hashed_token });
});
