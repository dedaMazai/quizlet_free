// Edge Function: подбор частотных коллокаций (чанков) к словам через OpenAI (gpt-4o).
//
// Зачем: учить фразами эффективнее, чем отдельными словами. Функция превращает
// слово в 2-3 готовые к заучиванию фразы с переводом и примером употребления.
//
// Поток (тот же, что у check-translations):
//   1. определяем пользователя по JWT (Authorization прокидывает supabase.functions.invoke);
//   2. consume_ai_credit() — атомарно резервируем 1 запрос (429 при превышении лимита);
//   3. вызываем OpenAI; при ошибке откатываем кредит refund_ai_credit();
//   4. возвращаем массив { uuid, chunks: [{ term, translation, example }] }.
//
// Деплой:  supabase functions deploy generate-chunks
// Секрет:  OPENAI_API_KEY (общий с check-translations, отдельно задавать не нужно)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Серверный кап: иначе один кредит уходил бы на всю колоду и упирался в лимит токенов. */
const MAX_CARDS = 10;

interface InputCard {
  uuid: string;
  term: string;
  translation: string;
}

interface AiChunk {
  term: string;
  translation: string;
  example: string;
}

interface AiChunksResult {
  uuid: string;
  chunks: AiChunk[];
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const SYSTEM_PROMPT =
  'Ты — преподаватель английского. На вход даётся список карточек: английское слово (term) ' +
  'и его русский перевод (translation). Для КАЖДОЙ карточки подбери 2-3 ЧАСТОТНЫЕ коллокации ' +
  '(устойчивые сочетания, фразовые глаголы, типовые словосочетания), содержащие это слово. ' +
  'Для каждой коллокации верни: term — сама английская фраза (2-5 слов, в словарной форме); ' +
  'translation — её естественный русский перевод; ' +
  'example — короткое английское предложение с этой фразой, а в скобках его русский перевод. ' +
  'Бери только то, что реально употребляется носителями; не выдумывай редкие сочетания. ' +
  'Верни СТРОГО JSON вида {"results":[{"uuid":string,"chunks":[{"term":string,' +
  '"translation":string,"example":string}]}]}. ' +
  'Поле uuid возвращай без изменений — оно нужно для сопоставления. Ничего, кроме JSON, не пиши.';

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

  let cards: InputCard[];
  try {
    const body = await req.json();
    cards = Array.isArray(body?.cards) ? body.cards.slice(0, MAX_CARDS) : [];
  } catch {
    return json({ error: 'BAD_REQUEST' }, 400);
  }
  if (cards.length === 0) {
    return json({ error: 'NO_CARDS' }, 400);
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
    const payload = cards.map((c) => ({ uuid: c.uuid, term: c.term, translation: c.translation }));
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify({ cards: payload }) },
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
    const results: AiChunksResult[] = Array.isArray(parsed?.results) ? parsed.results : [];

    return json({ results });
  } catch (err) {
    await supabase.rpc('refund_ai_credit');
    return json({ error: (err as Error).message ?? 'OPENAI_ERROR' }, 500);
  }
});
