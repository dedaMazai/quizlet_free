// Edge Function: разбор вставленного списка слов/фраз через OpenAI (gpt-4o) с серверным лимитом.
//
// Поток:
//   1. определяем пользователя по JWT (Authorization прокидывает supabase.functions.invoke);
//   2. consume_ai_credit() — атомарно резервируем 1 запрос (429 при превышении лимита);
//   3. вызываем OpenAI; при ошибке откатываем кредит refund_ai_credit();
//   4. возвращаем { results: [{ term, translation, example }], truncated }.
//
// Деплой:  supabase functions deploy parse-words
// Секрет:  supabase secrets set OPENAI_API_KEY=sk-...

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Не больше слов за один запрос — ответ укладывается в разумное время.
const MAX_ITEMS = 50;
// Защита от огромных промптов.
const MAX_TEXT_LENGTH = 4000;

interface ParsedWord {
  term: string;
  translation: string;
  example: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const SYSTEM_PROMPT =
  'Ты — преподаватель английского. На вход даётся текст, который пользователь вставил списком: ' +
  'английские слова и фразы, разделённые запятыми, точками с запятой или переносами строк. ' +
  'Разбери его на отдельные элементы (term) — слово или фразу целиком, без нумерации, маркеров и лишних пробелов. ' +
  'Пользователь часто записывает слова на слух, поэтому в английском term возможны опечатки и ошибки ' +
  'по созвучию (например, "recieve", "thru", "definately", "could of"): исправь их и верни в term ' +
  'правильное написание. Если пользователь указал свой перевод, используй его как подсказку, ' +
  'какое слово имелось в виду. Правильно написанные слова не меняй. ' +
  'Если элемент уже содержит пару «слово – перевод» (разделители -, —, :, = или табуляция), ' +
  'возьми русский перевод пользователя как есть. Иначе дай самый употребимый русский перевод (translation). ' +
  'Для каждого элемента придумай короткий пример употребления в английском предложении (поле example), ' +
  'добавив в скобках его русский перевод. ' +
  `Убери дубликаты и пустые элементы. Верни не больше ${MAX_ITEMS} элементов в исходном порядке. ` +
  'Верни СТРОГО JSON вида {"results":[{"term":string,"translation":string,"example":string}]}. ' +
  'Ничего, кроме JSON, не пиши.';

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

  // Клиент с JWT пользователя — чтобы auth.uid() в RPC резолвился в текущего пользователя.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );

  let text: string;
  try {
    const body = await req.json();
    text = typeof body?.text === 'string' ? body.text.trim().slice(0, MAX_TEXT_LENGTH) : '';
  } catch {
    return json({ error: 'BAD_REQUEST' }, 400);
  }
  if (!text) {
    return json({ error: 'NO_TEXT' }, 400);
  }

  // 1. Резервируем кредит (серверная проверка лимита).
  const { error: creditError } = await supabase.rpc('consume_ai_credit');
  if (creditError) {
    if (creditError.message.includes('AI_LIMIT_EXCEEDED')) {
      return json({ error: 'AI_LIMIT_EXCEEDED' }, 429);
    }
    return json({ error: creditError.message }, 500);
  }

  // 2. Запрос к OpenAI. При любой ошибке — откатываем кредит.
  try {
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
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
    const raw: ParsedWord[] = Array.isArray(parsed?.results) ? parsed.results : [];
    const valid = raw
      .map((w) => ({
        term: String(w?.term ?? '').trim(),
        translation: String(w?.translation ?? '').trim(),
        example: String(w?.example ?? '').trim(),
      }))
      .filter((w) => w.term && w.translation);

    // ИИ сам ограничивает список — поэтому оцениваем и размер исходного текста.
    const inputItems = text.split(/[\n,;]+/).filter((s) => s.trim()).length;
    return json({
      results: valid.slice(0, MAX_ITEMS),
      truncated: valid.length > MAX_ITEMS || inputItems > MAX_ITEMS,
    });
  } catch (err) {
    await supabase.rpc('refund_ai_credit');
    return json({ error: (err as Error).message ?? 'OPENAI_ERROR' }, 500);
  }
});
