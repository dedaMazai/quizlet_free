// Edge Function: практика времён английского через OpenAI.
//
// Два действия (поле action в теле запроса):
//   generate — сгенерировать count заданий-предложений с пропуском для списка времён;
//   check    — проверить ответы ученика пакетом и дать краткие подсказки.
// Каждый вызов списывает 1 ИИ-кредит (consume_ai_credit), при ошибке OpenAI кредит
// возвращается (refund_ai_credit). Проверка — одним запросом на всю сессию,
// чтобы не расходовать лимит по каждому предложению.
//
// Деплой:  supabase functions deploy grammar-practice
// Секрет:  supabase secrets set OPENAI_API_KEY=sk-... (общий с другими функциями)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CheckItem {
  id: string;
  text: string;
  verb: string;
  tense: string;
  answer: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const GENERATE_PROMPT =
  'Ты — преподаватель английского. Сгенерируй задания для практики английских времён. ' +
  'Каждое задание: короткое английское предложение (до 12 слов) с пропуском ___ на месте ' +
  'глагольной группы в заданном времени; поле verb — глагол-подсказка в базовой форме ' +
  '(с пометками not/just/already при необходимости, например "not/like"); поле tense — ' +
  'название времени из списка пользователя; поле translation — русский перевод предложения. ' +
  'Используй разные глаголы и бытовые ситуации, времена из списка чередуй. ' +
  'Верни СТРОГО JSON вида {"exercises":[{"id":"1","text":"...","verb":"...",' +
  '"tense":"...","translation":"..."}]}. Ничего, кроме JSON, не пиши.';

const CHECK_PROMPT =
  'Ты — преподаватель английского. Даны задания на времена (text с пропуском ___, ' +
  'подсказка verb, время tense) и ответы ученика (answer). Для КАЖДОГО задания верни: ' +
  'ok — верно ли заполнен пропуск (мелкие опечатки в одной букве считай верными, но упомяни в tip); ' +
  'correct — правильное заполнение пропуска; tip — по-русски, до 15 слов: при ошибке — на что ' +
  'обратить внимание, при верном ответе — null. Дополнительно поле advice — общий совет ученику ' +
  'по итогам всех ответов, по-русски, 1–2 коротких предложения. ' +
  'Верни СТРОГО JSON вида {"results":[{"id":string,"ok":boolean,"correct":string,' +
  '"tip":string|null}],"advice":string}. Поле id возвращай без изменений. Ничего, кроме JSON, не пиши.';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'NOT_AUTHENTICATED' }, 401);
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return json({ error: 'OPENAI_KEY_MISSING' }, 500);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );

  // Обрезка строк — чтобы произвольно длинный ввод не раздувал запрос к OpenAI.
  const clip = (value: unknown, max: number): string => String(value ?? '').slice(0, max);

  let action: string;
  let tenses: string[] = [];
  let count = 5;
  let items: CheckItem[] = [];
  try {
    const body = await req.json();
    action = body?.action;
    tenses = Array.isArray(body?.tenses)
      ? body.tenses.slice(0, 12).map((tense: unknown) => clip(tense, 40))
      : [];
    count = Math.min(Math.max(Number(body?.count) || 5, 1), 10);
    items = Array.isArray(body?.items)
      ? body.items.slice(0, 10).map((item: CheckItem) => ({
        id: clip(item?.id, 40),
        text: clip(item?.text, 300),
        verb: clip(item?.verb, 50),
        tense: clip(item?.tense, 40),
        answer: clip(item?.answer, 200),
      }))
      : [];
  } catch {
    return json({ error: 'BAD_REQUEST' }, 400);
  }

  if (action === 'generate' && tenses.length === 0) {
    return json({ error: 'NO_TENSES' }, 400);
  }
  if (action === 'check' && items.length === 0) {
    return json({ error: 'NO_ITEMS' }, 400);
  }
  if (action !== 'generate' && action !== 'check') {
    return json({ error: 'BAD_ACTION' }, 400);
  }

  const { error: creditError } = await supabase.rpc('consume_ai_credit');
  if (creditError) {
    if (creditError.message.includes('AI_LIMIT_EXCEEDED')) {
      return json({ error: 'AI_LIMIT_EXCEEDED' }, 429);
    }
    return json({ error: creditError.message }, 500);
  }

  try {
    const userContent = action === 'generate'
      ? JSON.stringify({ tenses, count })
      : JSON.stringify({ items });

    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // mini: задача простая, ответы короткие — экономим токены и время.
        model: 'gpt-4o-mini',
        temperature: action === 'generate' ? 0.5 : 0.2,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: action === 'generate' ? GENERATE_PROMPT : CHECK_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!openaiResp.ok) {
      throw new Error(`OpenAI HTTP ${openaiResp.status}`);
    }

    const completion = await openaiResp.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty OpenAI response');
    }

    const parsed = JSON.parse(content);
    if (action === 'generate') {
      const exercises = Array.isArray(parsed?.exercises) ? parsed.exercises : [];
      return json({ exercises });
    }
    const results = Array.isArray(parsed?.results) ? parsed.results : [];
    return json({ results, advice: typeof parsed?.advice === 'string' ? parsed.advice : '' });
  } catch (err) {
    await supabase.rpc('refund_ai_credit');
    return json({ error: (err as Error).message ?? 'OPENAI_ERROR' }, 500);
  }
});
