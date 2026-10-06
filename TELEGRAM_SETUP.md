# Telegram Mini App — что настроить

Код готов: тот же сайт открывается внутри Telegram. Новый пользователь жмёт «Продолжить через Telegram» —
аккаунт создаётся без почты и пароля. У кого уже есть аккаунт на сайте — один раз входит по почте,
Telegram привязывается, дальше вход автоматический. Привязка видна в «Настройки → Telegram».

Порядок важен: SQL → функция → фронт → бот.

## 1. SQL

**Supabase → SQL Editor** — выполнить `supabase/telegram.sql` (таблица `telegram_accounts`).

## 2. Бот

1. Написать [@BotFather](https://t.me/BotFather) → `/newbot` → имя (например, «Zubrika») и username (`zubrika_bot`).
2. Сохранить токен вида `123456789:AA...` — он секретный, в репозиторий не коммитить.
3. `/mybots` → бот → **Mini Apps**:
   - **Main App** → включить, URL `https://www.zubrika.ru` (основное приложение: кнопка «Открыть» в профиле бота, ссылка `https://t.me/zubrika_bot?startapp`).
   - **Menu Button** → включить, URL `https://www.zubrika.ru`, текст «Открыть» (кнопка слева от поля ввода в чате с ботом).
   - **Same-Origin Restriction** — оставить включённым, приложению не мешает.
   - **Direct Links** — опционально, ссылка вида `https://t.me/zubrika_bot/<имя>` с тем же URL.

   - **Launch Screen** (экран загрузки) — отдельно для Light Mode и Dark Mode:

     | | Splash Icon | Background color | Header color |
     |---|---|---|---|
     | Light Mode | `telegram/splash-light.svg` | `#f2f2f3` | `#f2f2f3` |
     | Dark Mode | `telegram/splash-dark.svg` | `#141b23` | `#141b23` |

     Цвета — `--color-bg` тем приложения: после загрузки код ставит шапке и фону те же значения, без скачка цвета.

   URL — именно тот адрес, на котором сайт открывается без редиректа (`www.` или без него).

## 3. Edge Function

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=<токен из BotFather> --profile supabase
supabase functions deploy telegram-auth --profile supabase
```

Проверка: `POST` на функцию с пустым телом отвечает `400 BAD_REQUEST`, с фиктивным `init_data` — `401 BAD_INIT_DATA`.

## 4. Фронт

Обычный деплой. Telegram-скрипт грузится только при запуске из Telegram — на сайте ничего не меняется.

## Локальная отладка

Telegram открывает только HTTPS-адреса: поднять туннель на dev-сервер (`ngrok http <порт dev-сервера>` или `cloudflared`),
временно указать его URL в BotFather (Main App и Menu Button) и открыть бота в Telegram Desktop или Telegram Web.
После отладки вернуть прод-URL.

## Ограничения

- У аккаунтов, созданных из Telegram, почта синтетическая (`tg<id>@telegram.zubrika.ru`): на сайт по паролю
  они не войдут, поделиться с ними колодой по почте неудобно.
- Отвязать Telegram из интерфейса нельзя — только удалить строку в `telegram_accounts` в Table Editor.
