# Handoff: редизайн Zubrika — финальная версия

Пакет для Claude Code. Читать в таком порядке:
1. **README.md** (этот файл) — что за дизайн, токены, правила, карта экранов.
2. **PLAN.md** — итерации: что и в каком порядке делать, критерии готовности.
3. **PROMPTS.md** — готовые промпты на каждую итерацию.
4. **BACKLOG.md** — спецификации того, чего нет в макетах (тёмная тема, пустые состояния, тосты, онбординг, ⌘K, анимации).

## О файлах дизайна
`design/` — **HTML-референсы** (прототипы), а не продакшен-код. Задача — воссоздать их в существующем приложении `quizlet_free` его средствами: React 19, Ant Design v6, CSS Modules, FSD, i18n (`useTranslation`), правила из `CLAUDE.md` (без inline-стилей и magic numbers; значения — из глобальных переменных и темы AntD). URL-ы маршрутов **не меняются**.

Открыть: `design/Zubrika Redesign.dc.html` в браузере (рядом `support.js`, `_ds/`, `ds/`). Это канвас «Ход 6 · Финальный дизайн»: блок **6.0** (аудит, цвет, motion) и экраны **6.1–6.57**. Каждый экран — свой файл `*.dc.html` (разметка + класс с тестовыми данными). Inline-стили — особенность прототипа; в коде — `.module.scss`.

**Точность: high-fidelity.** Цвета, типографика, отступы, тексты — финальные.

---

## 1. Токены

### Цвет — база (светлая тема)
| Токен | Значение | Где |
|---|---|---|
| `--color-bg` | `#f2f2f3` | фон всего (карточки прозрачные) |
| `--color-surface` | `#e9e9ea` | фон полей ввода |
| `--color-text` | `#1d1f20` | текст |
| `--color-accent` | `#5980a6` | primary, активное, выбранный сегмент |
| `--color-divider` | `rgba(29,31,32,.16)` | все линии и рамки |
| accent-100/200/300/400 | `#eef6ff` / `#d6ebff` / `#b5d9fd` / `#94bce3` | hover, плашки / аватар / текст на тёмном / «изучаю» |
| accent-600/700/800/900 | `#597ea3` / `#416180` / `#2c455d` / `#1d2d3d` | hover primary / «усвоено», ссылки / текст на 100 / **тёмное поле** |
| neutral-200…800 | `#e7e7ea` `#d4d4d7` `#b7b7ba` `#98989b` `#7a7a7d` `#5d5d60` `#424244` | «новые» (300), вторичный текст (700) |

Полный набор ramp-переменных — `design/_ds/.../styles.css` (`:root`). Тени: sm `0 1px 2px rgba(43,43,45,.14)`, md `0 3px 10px …16`, lg `0 12px 32px …22` (только оверлеи).

Пропорция: **80%** бумага/графит · **15%** сталь · **5%** тёмное поле accent-900 — один главный блок на экран.

### Цвет — сигналы (только со смыслом, никогда для декора)
| Роль | Значение | Тинт | Текст на тинте | Где |
|---|---|---|---|---|
| **Верно / результат** | `oklch(0.60 0.11 170)` | `oklch(0.95 0.03 170)` | `oklch(0.42 0.08 155)` | верные ответы, освоенные (≥80%) колоды и времена, пройденные шаги, рост метрик ▲, «личный рекорд» |
| **Неверно** | `oklch(0.50 0.16 35)` + **диагональная штриховка** | `oklch(0.95 0.025 27)` | `oklch(0.45 0.11 27)` | неверные ответы, ошибки в практике |
| **Срочно** | `oklch(0.72 0.12 80)` | `oklch(0.95 0.04 80)` | `oklch(0.45 0.10 70)` | ≥15 слов к повторению в колоде, «N новых» в цикле |

**Доступность:** «верно/неверно» никогда не различаются только цветом — неверно темнее + штриховка (`repeating-linear-gradient(135deg, oklch(.5 .16 35) 0 2px, oklch(.9 .04 35) 2px 4px)`), у вариантов ответа — иконки ✓/✕. Читается при дейтеранопии.

### Серия — уровни огня (6.1, 6.17, 6.23)
| Дней | Уровень | Цвет | Подложка |
|---|---|---|---|
| 0+ | Искра | `oklch(0.62 0.02 250)` | `oklch(0.94 0.005 250)` |
| 3+ | Огонёк | `oklch(0.72 0.12 80)` | `oklch(0.95 0.04 80)` |
| 7+ | Пламя | `oklch(0.66 0.15 55)` | `oklch(0.94 0.05 55)` |
| 14+ | Жар | `oklch(0.58 0.17 35)` | `oklch(0.93 0.05 35)` |
| 30+ | Пожар | `oklch(0.50 0.17 25)` | `oklch(0.90 0.06 25)` |

Цвет уровня получают: иконка flame (на квадратной подложке 56×56), плашка-название рядом с «СЕРИЯ», ячейки недели (сегодня — пунктир), шкала из 5 делений с порогами. С «Жар» само число тоже окрашивается. Подсказка: «Ещё N дня — и огонь станет «{следующий}»». Логика — `Home.dc.html` (класс, массив `L`).

### Типографика
Barlow не поддерживает кириллицу → **Fira Sans Condensed** (заголовки 500/600/700), **Fira Sans** (текст 400/500/600), **JetBrains Mono** (метки, цифры 400/500). Локально в `src/app/styles/fonts/`.

| Роль | Шрифт | px / lh |
|---|---|---|
| H1 страницы | Condensed 600 | 44 / 1.0, ls −0.02em |
| H2 секции | Condensed 600 | 22–26, + линия справа (flex:1, 1px divider) |
| Цифры hero | Condensed 600 | 96–132 / 0.78, ls −0.04em |
| Заголовок карточки | Condensed 600 | 19–22 |
| Kicker | Mono 400 | 10–11, UPPERCASE, ls .12–.14em |
| Текст / вторичный | Fira Sans 400 | 14–15 / 12–13 (neutral-700) |

### Форма
- `border-radius: 0` везде (в AntD-теме `borderRadius: 0`).
- Рамки 1px divider, карточки без заливки.
- **Blueprint**: метки «+» 11×11 по углам (−6px), цвет `color-mix(text 55%)` — у карточек, primary-кнопок, тёмных полей. Один компонент `shared/ui/Blueprint` (см. `.blueprint/.corner` в styles.css).
- Иконки: **lucide-react**, `strokeWidth={1.5}`; пути из макета — `design/Icon.dc.html`.

### Состояния
hover карточек/строк — accent-100; primary: accent → 600 → 700; focus-visible `2px solid accent, offset 2px`; disabled opacity .45.

### Motion (детально — BACKLOG.md §6 и блок 6.0)
Длительности: instant 80 · fast 140 · base 220 · slow 360 · deliberate 600 мс. Кривые: standard `cubic-bezier(.2,0,0,1)`, enter `(0,0,0,1)`, exit `(.3,0,1,1)`. Только transform/opacity; `prefers-reduced-motion` → opacity 80 мс.

---

## 2. Информационная архитектура
Сайдбар — 5 разделов (URL-ы прежние):

| Раздел | lucide | Подсвечивается на | Вкладки |
|---|---|---|---|
| Главная | House | `/` exact | — |
| Учить (бейдж due) | GraduationCap | REVIEW, CYCLES, CYCLE, ROADMAP, GRAMMAR_TOPIC | К повторению · Циклы заучивания · Дорожная карта |
| Библиотека | Library | DECKS, DECK, ALL_WORDS, FAVORITES | Колоды · Все слова · Избранное |
| Грамматика | BookOpen | GRAMMAR_TENSES, GRAMMAR_TENSE_GROUP, GRAMMAR_PRACTICE, IRREGULAR_VERBS | Времена · Практика времён · Неправильные глаголы |
| Прогресс | ChartLine | PROGRESS | — |

Аккаунт (PROFILE, SETTINGS, USER) — через блок профиля внизу сайдбара → страница с вкладками Профиль · Настройки · Пользователи (`users_can_read`).

**Оболочка (`Shell.dc.html`)**: сайдбар 236 / rail 76 (без ресайза), карточка «К повторению» внизу (скрыта на REVIEW), профиль с Dropdown; топбар 68px: поиск 420×40 «⌘K», «+ Колода», уведомления. Хлебные крошки в шапке убрать (на детальных — строка «‹ Раздел / Подраздел» над H1). Белую `.contentPage`-карточку убрать.

**Фокус-режим (`Session.dc.html`)**: `FocusLayout` без сайдбара/шапки для LEARN, WRITE, CLOZE, ORDER, FLASHCARDS, DECK_FAVORITES_LEARN, ALL_WORDS_LEARN/FLASHCARDS, FAVORITES_LEARN/FLASHCARDS, CYCLE_STUDY и сессии REVIEW. Топбар 72px: «✕ Выйти ESC» · название + счётчик + 14-сегментный прогресс (верно — сигнал «верно», неверно — штриховка, текущий accent-400, впереди neutral-300) · озвучка/настройки.

**Мобильная**: нижний таб-бар (5 разделов) вместо Drawer; подразделы — горизонтальные вкладки; занятия fullscreen без таб-бара; модалки — bottom-sheet; цели касания ≥44px.

---

## 3. Карта экранов
| № | Экран | Файл (`design/`) | Код |
|---|---|---|---|
| 6.0 | Аудит, цвет, motion | DesignAudit | — (справочник) |
| 6.1 | Главная | Shell `screen=home` → Home | pages/MainPage (+ widgets) |
| 6.2 | Колода | Shell `deck` → DeckScreen | pages/DeckPage, widgets/CardList |
| 6.3–6.5 | Колоды · Все слова · Избранное | LibraryScreen `tab=decks/words/favorites` | DecksPage, AllWordsPage, FavoritesPage |
| 6.6 | К повторению | ReviewScreen | pages/ReviewPage |
| 6.7–6.8 | Циклы · Цикл | CyclesScreen `view=list/detail` | CyclesPage, CyclePage, widgets/CycleWordList |
| 6.9 | Дорожная карта | RoadmapScreen | pages/RoadmapPage |
| 6.10–6.12 | Заучивание: вопрос · верно · неверно | Session `mode=choice/correct/wrong` | features/LearnSession |
| 6.13 | Письмо (опечатка) | Session `write` | features/WriteSession |
| 6.14–6.16 | Карточки · Пропуски · Собери фразу | Session `cards/cloze/order` | FlashcardsGame, ClozeSession, OrderSession |
| 6.17 | Итог сессии (новый) | Session `done` | новый widget SessionResult |
| 6.18 | Грамматика · Времена | GrammarScreen | GrammarTensesPage |
| 6.19–6.22 | Группа · Практика · Неправ. глаголы · Тема | GrammarExtra `view=group/practice/irregular/topic` | TenseGroupPage, GrammarPracticePage, IrregularVerbsPage, GrammarTopicPage |
| 6.23 | Прогресс | ProgressScreen | ProgressPage + widgets |
| 6.24–6.26 | Профиль · Настройки · Пользователи | AccountScreen `tab=…` | ProfilePage + SettingPage + UsersTable/UserPage → одна страница |
| 6.27–6.30 | Добавить слова · ИИ-проверка · ИИ-фразы · Доступ | Modals `kind=add/aicheck/chunks/share` | CardEditor, CheckTranslationsModal, GenerateChunksModal, ShareDeckModal |
| 6.31–6.34 | Вход · Регистрация · 404/403 · О сервисе | Public `view=…` | LoginPage, NotFound/Forbidden, About+Features+FAQ → одна |
| 6.35–6.57 | Мобильные (23) | Mobile `screen=…` | те же страницы, адаптив |

Мобильные: 35 главная, 36 колода, 37 шторка «добавить слова», 38 библиотека, 39 к повторению, 40 циклы, 41 цикл, 42 дорожная карта, 43–45 заучивание/верно/неверно, 46 письмо, 47 карточки, 48 пропуски, 49 собери фразу, 50 итог, 51 грамматика, 52 группа, 53 практика, 54 неправ. глаголы, 55 прогресс, 56 аккаунт, 57 вход.

## 4. Данные
Новых таблиц не нужно. Хуки: `useGetDueCountQuery`, `useGetDecksQuery`, `useGetCardsQuery`, `useGetCardReviewsQuery` (статус, дата показа), `useGetStudyOverviewQuery` (серия, точность, время, heatmap). Новое клиентское: исключённые из повторения колоды, фильтр выборки «Все слова» → сессия, цель дня (localStorage/настройки). Прогноз нагрузки на 7/14 дней — по `due_at` (или RPC в Supabase). Рекорд серии и «личный рекорд точности» — из statistics.
