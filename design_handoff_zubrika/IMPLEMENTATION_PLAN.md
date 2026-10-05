# Zubrika — план внедрения редизайна (итерация 0)

> Этот документ — результат итерации 0 из `PLAN.md`. Код не менялся. После одобрения он сохраняется как `design_handoff_zubrika/IMPLEMENTATION_PLAN.md`.
> Источники: README/PLAN/BACKLOG/PROMPTS, `CLAUDE.md` проекта, макеты `design/*.dc.html` и аудит кода (`src/`, `supabase/`).
> Обозначения: **+** — создать, **~** — изменить, **−** — удалить. ⚠ — расхождение макета с данными или логикой. ❓ — вопрос (сводный список в конце).

---

## Контекст

Нужно перевести приложение на финальный дизайн «Ход 6»: новые токены и шрифты, 5 разделов вместо 16 пунктов меню, фокус-режим для занятий, новые экраны 6.1–6.57, а также бэклог (тёмная тема, ⌘K, онбординг, тосты, анимации). URL-ы не меняются. Логику сессий и API трогаем только там, где этого требует макет; такие места отмечены ниже.

## Сводка аудита: что отличается от предположений handoff

| Тема | В handoff | В коде |
|---|---|---|
| Маршруты | «40 маршрутов» | **37** (`src/shared/config/router/routerNames.ts`). Группы: 29 с сайдбаром, 2 auth без сайдбара (FORBIDDEN, 404), 3 публичных (ABOUT, FEATURES, FAQ), 3 «голых» (LOGIN, CHANGE_PASSWORD, PRIVACY) |
| Шрифты | Fira Sans, Fira Sans Condensed и JetBrains Mono лежат в `src/app/styles/fonts/` | Там только OpenSans (5 ttf). Fira/JetBrains нужно добавить (OFL, woff2) |
| Переменные | `global.scss` + `globalCssVariables[Theme.LIGHT]` | `src/app/styles/variables/global.scss` (`:root`, по умолчанию — тёмные значения). Имена другие: `--text`, `--bg-color`, `--card-bg`… Есть `src/app/styles/themes/index.tsx` (984 строки: токены AntD пишутся в CSS-переменные, 36 оверрайдов компонентов на каждую тему) |
| Тёмная тема | делается в итерации 16 | **Уже есть** (старая палитра, primary `#5B6BFF`). После итерации 1 она визуально «отвалится» от светлой |
| Иконки | lucide-react | Не установлен. `@ant-design/icons` — в 73 файлах, но его нет в `package.json` (приходит транзитивно) |
| Анимации | `motion` (framer-motion) | Не установлен. Есть `@react-spring/web` + `@use-gesture/react` (на них собран `shared/ui/Drawer`) |
| Настройки пользователя | «цель дня и `onboarding_done` — в user settings» | `UserSettings` ходит в **старый REST** `/api/user-settings/me`, а не в Supabase. Полей goal/onboarding/language нет. Тема — только `'light' \| 'dark'` |
| Уведомления (колокольчик) | в топбаре | REST + websocket `/api/ws/notifications/` от прошлого продукта (события комментариев и групп); в Supabase таблицы нет |
| Квота ИИ | «Лимит обновится 1-го числа», «ОКТЯБРЬ · 18 из 30» | Счётчик **за всё время**: `ai_usage.count` против `profiles.ai_limit` (0–25, по умолчанию 5). Сброса нет |
| «Все слова» → сессия по фильтру | есть | `AllWordsLearnPage` учит **все** карточки; фильтр не передаётся |
| Автопереход 1.2 с | «логику не трогать» | Таймера нет нигде. Его добавление — изменение логики (минимальное) |
| Итог сессии | новый `SessionResult` | Сейчас AntD `<Result>` в 5 сессиях; у FlashcardsGame итога нет совсем (зацикливается) |
| Хуки данных | `useGetDueCountQuery`, `useGetDecksQuery`, `useGetCardsQuery`, `useGetCardReviewsQuery`, `useGetStudyOverviewQuery`, `useGetCardsPageQuery` | Все существуют. Но `getCardReviews` **не пагинирует** (обрезает на 1000 строк), а `get_mastery` не считает карточки без review в «новых» |
| Тесты | — | Нет ни одного; `npm test` сломан (нет `config/jest`). Проверка: typecheck, lint, ручная сверка в браузере |
| Адаптив | `useMatchMedia` | Два механизма: `useMatchMedia` (≤650 / 650–1200 / ≥1200; переподписывается на каждый рендер) и `react-device-detect` (`BrowserView`/`MobileView` в Sidebar и Navbar) |

---

## Итерация 1 — токены, тема AntD, шрифты, иконки

**Файлы**
- **+** `src/app/styles/fonts/` — `FiraSans-{400,500,600}.woff2`, `FiraSansCondensed-{500,600,700}.woff2`, `JetBrainsMono-{400,500}.woff2` (кириллица и латиница).
- **~** `src/app/styles/index.scss` — `@font-face` для новых шрифтов; `.contentPage` пока оставляем (удаляется в итерации 3).
- **~** `src/app/styles/variables/global.scss` — новые токены рядом со старыми:
  - база: `--color-bg/surface/text/accent/divider`;
  - рампы: `--color-accent-100…900`, `--color-neutral-100…900`;
  - сигналы: `--color-success`, `--color-success-tint`, `--color-success-ink` (и так же для `error`, `warning`), `--pattern-error-hatch`;
  - серия: `--streak-0…4`, `--streak-0…4-tint`;
  - тени: `--shadow-sm/md/lg`;
  - шрифты: `--font-heading/body/mono`;
  - motion: `--motion-*`, `--ease-*`;
  - размеры: `--sidebar-width: 236px`, `--sidebar-width-collapsed: 76px`, `--topbar-height: 68px`, `--focus-topbar-height: 72px`;
  - отступы и размеры шрифтов как токены (`--space-*`, `--fs-*`) — чтобы в SCSS не было magic numbers.
- **~** `src/app/styles/themes/index.tsx` — `globalCssVariables[Theme.LIGHT]`: те же ключи. Старые ключи (`--text`, `--bg-color`…) **переназначаем на новые значения**, чтобы существующие страницы сразу получили новую палитру и не сломались.
- **~** `src/app/styles/themes/light/index.ts` — `borderRadius: 0`, `colorPrimary #5980a6`, `colorBgLayout/colorBgContainer #f2f2f3`, `fontFamily` Fira Sans, `controlHeight 38`, сигнальные `colorSuccess/Error/Warning`.
- **~** `getLightComponentOverrides()` — оверрайды Tabs, Segmented, Table, Button, Input, Modal, Dropdown, Tag (квадратные, рамка divider, hover accent-100, primary accent → 600 → 700).
- **~** `package.json` — добавить `lucide-react`; явно добавить `@ant-design/icons` (уже используется).
- **~** `src/app/styles/reset.scss` — `:focus-visible` 2px accent, offset 2px; disabled opacity .45.

**Компоненты:** нет.
**Хуки:** `useUserSettingsTheme`, `useTheme` — не меняются.

**Риски**
- В `index.scss` много `!important` для `.ant-btn-*`, `.ant-select`, `.ant-table` — могут перебить тему. Чистим только то, что конфликтует.
- `oklch()` и `color-mix()` нужны для сигналов и blueprint-меток. В Safari < 15.4 их нет. Делаем hex-fallback или фиксируем требование к браузерам ❓1.
- AntD `ConfigProvider` не принимает `oklch` в токенах (парсер цвета) → для токенов AntD нужны hex-эквиваленты сигналов.
- Тёмная тема до итерации 16 будет со старой палитрой ❓2.

## Итерация 2 — примитивы `shared/ui`

**Файлы (+)** — каждый компонент: `X.tsx`, `X.module.scss`, `index.ts`
- `shared/ui/Blueprint`: обёртка с 4 угловыми метками «+». Пропсы `as`, `tone: 'default' | 'dark' | 'primary'`, `className`.
- `shared/ui/Kicker`: Mono 10–11, uppercase. Пропс `tone`.
- `shared/ui/SectionHeader`: H2 + линия справа + слот `extra`.
- `shared/ui/MasteryBar`: 3 сегмента (усвоено, изучаю, новые). При ≥80% цвет «результат». Пропс `size`.
- `shared/ui/TickProgress`: N делений, состояния `done | correct | wrong | current | todo`, у wrong — штриховка.
- `shared/ui/AccentPanel`: тёмное поле accent-900 + Blueprint.
- `shared/ui/SectionTabs`: вкладки раздела на `NavLink` (подчёркивание accent, опциональный счётчик).
- `shared/ui/StatCell`: метка, значение, единица, дельта. Пропс `tone` для дельты.
- `shared/ui/DueBadge`: обычный / срочный (≥15) / «Всё повторено».
- `shared/ui/StreakFlame`: иконка на подложке 56×56. Пропсы `days`, `size`.
- `shared/lib/streak/streakLevel.ts`: `getStreakLevel(days)` → `{ index, key, nextMin, daysToNext }`. Пороги 0/3/7/14/30 из `Home.dc.html` (массив `L`). Нужен главной, итогу сессии и прогрессу.
- `shared/lib/pluralize` (или хелпер i18n): склонения «дня/дней», «слов» — сейчас в i18n стоит `intervalPlural`, проверить.
- `pages/DevUiPage` (+ `.async.tsx`) и маршрут `DEV_UI` `/dev/ui` в `routerNames`, `routePath`, `routeConfig` — только при `__IS_DEV__` (флаг: условное добавление в routeConfig).

**Хуки:** нет.

**Риски**
- `SectionTabs` на `NavLink` против AntD `Tabs`. Беру `NavLink`: вкладки = маршруты (README §2), а AntD Tabs плохо дружат с роутингом.
- Существующий `shared/ui/EmptyState` (2 использования) **не трогаем** до итерации 13.

## Итерация 3 — оболочка

**Файлы**
- **~** `src/shared/const/menu.tsx` — `getNavSections` → 5 разделов `{ key, icon (lucide), label, path, match: AppRoutes[], tabs? }`. Подсветка — по `match` через `matchPath` (README §2). `getMenuItems` пригодится для мобильного таб-бара (итерация 12).
- **~** `src/widgets/Sidebar/ui/Sidebar/Sidebar.tsx` и `.module.scss` — переписать:
  - 236 / 76, без ресайза;
  - логотип и кнопка сворачивания;
  - 5 пунктов с бейджем due;
  - карточка «К повторению» (`AccentPanel`, скрыта на REVIEW);
  - профиль с `Dropdown` (Профиль, Настройки, Выход).
- **−** из Sidebar: последние колоды, `useResizable`, ключ `SidebarWidth`, `__APP_VERSION__` ❓3.
- **+** `src/widgets/Topbar/` (`Topbar.tsx`, scss, index): кнопка-поиск 420×40 «⌘K» (до итерации 14 ведёт на главную с фокусом в поиск), «+ Колода» (открывает `DeckForm`), `UserNotification` ❓4.
- **~** `src/app/providers/router/ui/AuthLayout.tsx` — Sidebar + Topbar + `<main>`. Убрать `.contentPageWrapper/.contentPage` и inline `overflow`.
- **~** `src/app/styles/index.scss` — **−** `.contentPage`, `.contentPageWrapper`.
- **−** `src/widgets/Navbar/ui/BreadcrumbsCustom.tsx` и крошки в Navbar. `handle.crumbs` в `routeConfig.tsx` остаются для строки «‹ Раздел / Подраздел».
- **~** `src/widgets/Navbar` — десктопная часть уходит в Topbar. Мобильная (`NavbarMenu` + Drawer) живёт до итерации 12.
- **+** `shared/ui/BackLink`: строка «‹ Библиотека / Колоды» над H1 на детальных страницах.
- **~** Страницы разделов получают `SectionTabs`. Создаём **виджеты-шапки разделов**, чтобы не дублировать:
  - `widgets/LearnHeader` (REVIEW, CYCLES, ROADMAP);
  - `widgets/LibraryHeader` (DECKS, ALL_WORDS, FAVORITES);
  - `widgets/GrammarHeader` (GRAMMAR_TENSES, GRAMMAR_PRACTICE, IRREGULAR_VERBS).
- **+** `pages/AccountPage`: H1 «Аккаунт» + вкладки Профиль · Настройки · Пользователи (последняя только при `users_can_read`).
  - **~** `routeConfig` — PROFILE и SETTINGS рендерят `AccountPage` с нужной вкладкой. `SETTINGS?activeTab=Users` → вкладка «Пользователи».
  - USER (`/users/:id`) пока остаётся отдельной страницей (решается в итерации 10).
  - Содержимое вкладок — текущие `ProfilePage`/`SettingPage` без изменений (до итерации 10).
- **~** `src/widgets/Navbar/ui/Navbar.tsx` и `PublicHeader` — `ThemeSwitcher`/`LangSwitcher` остаются только в публичной шапке; в приложении они переезжают в Настройки.

**Хуки:** `useGetDueCountQuery` (бейдж и карточка), `useUserInfo`, `useUserAccesses`.

**Риски**
- `BrowserView` скрывает Sidebar на мобильном — сохраняем поведение до итерации 12.
- Удаление «Последних колод» из сайдбара — потеря функции ❓3.
- «≈ 8 мин» — нужна формула оценки времени. Предлагаю `ceil(count × 11 с / 60)`, константой в `shared/const` ❓5.
- Грамматика: сейчас в меню 7 пунктов (Simple, Continuous…). Они исчезают — группы открываются из матрицы времён.

## Итерация 4 — фокус-режим и занятия (6.10–6.17)

**Файлы**
- **~** `src/shared/types/router.ts` — флаг `focusLayout?: boolean`.
- **~** `routeConfig.tsx` — `focusLayout: true` для LEARN, WRITE, CLOZE, ORDER, FLASHCARDS, DECK_FAVORITES_LEARN, ALL_WORDS_LEARN/FLASHCARDS, FAVORITES_LEARN/FLASHCARDS, CYCLE_STUDY.
- **~** `AppRouter.tsx` — новая группа маршрутов под `FocusLayout`.
- **+** `src/app/providers/router/ui/FocusLayout.tsx` — без сайдбара и топбара, Esc → выход (`navigate(-1)` или в родительский раздел).
- **+** `src/widgets/SessionTopBar/`:
  - «✕ Выйти ESC»;
  - название · счётчик;
  - `TickProgress` на 14 делений;
  - озвучка (вкл/выкл автопроизношения) и настройки (Popover: «Сбросить прогресс», направление и т. п.).
- **+** `src/widgets/SessionResult/` (6.17): заголовок, блок серии (`StreakFlame` + неделя), 4 `StatCell`, «Трудные слова», 3 CTA.
- **+** `src/shared/ui/AnswerOption` — вариант ответа с номером и иконкой ✓/✕; **+** `src/shared/ui/AnswerFeedback` — полоса «Верно / Неверно / Почти» + «Дальше · ENTER» + линия автоперехода.
- **~** `features/LearnSession/ui/*` (`LearnSession`, `ChoiceQuestion`, `WriteQuestion`, `AnswerFeedback`) — новая разметка.
  - Автопереход 1.2 с при «верно» — единственная правка логики: `useEffect` + таймер в UI, dispatch `NEXT`.
  - Легенду и «Сбросить прогресс» переносим в настройки топбара.
- **~** `features/WriteSession/ui/*`:
  - подсветка опечатки посимвольно (нужен diff из `shared/lib/text/answerGrading.ts` — функция есть, проверить, отдаёт ли позицию);
  - «Я ответил верно» ❓6;
  - setup-экран (направление, опечатки) остаётся, в новом стиле.
- **~** `features/ClozeSession/ui/*` — инлайн-поле в предложении, «Подсказка: перевод» видна сразу, «Не помню» вместо «Пропустить» ❓7.
- **~** `features/OrderSession/ui/*` — чипы `Blueprint`; на месте выбранного слова — пунктир.
- **~** `features/FlashcardsGame/ui/FlashcardsGame.tsx` — пробел переворачивает; сегмент «Все / Избранные / Неизбранные»; плашка «Ознакомительный режим… Перейти к заучиванию →».
- **~** `features/CycleSession/ui/*` — тот же вид (тоже в фокус-режиме).
- **~** Страницы-обёртки (11 шт.: `LearnPage`, `WritePage`…) — убрать back-кнопку и заголовок, передавать `title` в `SessionTopBar`.
- **~** `pages/ReviewPage` — сессия запускается внутри страницы (не по маршруту) ❓8.

**Хуки:**
- **+** `useSessionHotkeys` (Esc, Enter, 1–4, стрелки) в `shared/lib/hooks` — сейчас есть только `useArrowPressed`/`useCtrlPressed`;
- `useSpeech`, `useLogStudyEventsMutation`, `useSaveCardReviewsMutation`;
- `useGetStudyOverviewQuery` (серия в итоге).

**⚠ Расхождения**
- **14 делений** при сессиях на 44–128 карточек. Нужна агрегация (одно деление = ⌈N/14⌉ ответов, цвет по худшему) или окно последних 14 ❓9.
- «Интервал вырос: слово вернётся через 3 дня» — интервал считается в `srs.ts`, но в UI не прокидывается. Нужно вернуть `interval_days` из reducer/хука. Для режима без SRS (избранное, все слова?) текст скрыть.
- «Неверно — правильно «put off» / «put up with» — терпеть»: перевод выбранного варианта есть (варианты — это карточки).
- Итог (6.17):
  - «ЛИЧНЫЙ РЕКОРД» точности — **нет данных**;
  - «до рекорда 18» — есть (`longestStreak`);
  - «+9 усвоено» — считаем локально по `level_after = 2` в событиях сессии;
  - «Долг закрыт. День засчитан.» — день засчитывается при каком условии? ❓10;
  - «Ещё 7 новых из «Travel»» и «Повторить трудные» — нужны правила и маршрут для «трудных» (передавать `uuids` через `location.state`?) ❓11.
- В макете нет «Раунд N / Усвоено x/total / легенды» — счётчик «РАУНД 2 · 5 / 14» заменяет их.
- **Hard Enter / repeat**: в Order защиты нет — добавить вместе с hotkeys.

**Риски:** `LearnSession` (~870 строк) — самая хрупкая часть. Правки строго в `ui/`, reducer не трогаем, кроме экспорта интервала.

## Итерация 5 — главная (6.1)

**Файлы**
- **~** `pages/MainPage/ui/MainPage.tsx`: kicker с датой, приветствие, «ЦЕЛЬ ДНЯ 14 / 20», hero, блок серии, «Следующий шаг», колоды.
- **−** `StatsStrip.tsx`, `QuickActions.tsx`, `RecentWords.tsx` (на макете их нет) ❓12.
- **~** `GlobalSearchResults.tsx` — пока остаётся (под топбаром, PLAN §5), в итерации 14 переезжает в ⌘K.
- **+** `widgets/DueHero/`: `AccentPanel`, число, «из N колод · ≈ M минут», прогноз на 7 дней, «Начать повторение», «Выбрать колоды», Enter.
- **+** `widgets/StreakCard/`: уровень, рекорд, неделя (7 ячеек; сегодня — пунктир), шкала из 5 делений, подсказка, цель дня.
- **+** `widgets/NextSteps/` + `model/selectNextSteps.ts` — правила BACKLOG §7.
- **~** `widgets/DeckList` — новый вид карточки (`DueBadge`, `MasteryBar`) или **+** `entities/Deck/ui/DeckCard` для повторного использования на главной и в библиотеке.
- **+** `entities/Statistics/model/lib/forecast.ts` — группировка `due_at` по дням.

**Хуки:**
- `useGetDueCountQuery`, `useGetDueCardsQuery` (число колод в долге);
- `useGetStudyOverviewQuery`, `useGetStudyHeatmapQuery` (неделя);
- `useGetMasteryQuery` (perDeck), `useGetDecksQuery`, `useGetCyclesQuery`;
- **+** `useGetDueForecastQuery` (RPC, ❓13);
- **+** `useDailyGoal`.

**⚠ Расхождения**
- **Цель дня** — нигде не хранится. Нужен источник (Supabase или localStorage) ❓14. Прогресс за сегодня — `heatmap[today].count` (ответы, а не уникальные карточки) ❓15.
- **Прогноз**: из `useGetCardReviewsQuery` можно, но там обрезка на 1000 строк → предлагаю RPC `get_due_forecast(p_days, p_tz)` ❓13.
- **Следующий шаг**:
  - правило 1 — «раунд 2 из 3»: **у циклов нет раундов**. Есть только порция дня и сессии new/review. Предлагаю текст «Новые слова · 3 из 7» ❓16;
  - правило 2 — «≥3 дня без Пропусков»: нужен `max(created_at)` по `study_events where mode='cloze'` на колоду, а такого RPC нет;
  - правило 3 — «Тема пройдена на 70%» для грамматики: результаты практики не сохраняются (см. итерацию 8).
- «Недавние / Мои / Общие» — есть в `DeckList` (`filter`). «Все 14 колод» — `decks.length`.
- MasteryBar колод: в `get_mastery.perDeck` «новые» — без карточек, у которых нет review. Считаем new = `cards_count − mastered − learning`.

## Итерация 6 — библиотека и колода (6.2–6.5, 6.27–6.30)

**Файлы**
- **~** `pages/DeckPage/ui/DeckPage.tsx`:
  - `BackLink`, kicker «КОЛОДА · N СЛОВ · M ФРАЗ», H1, описание;
  - «Поделиться», «+ Слова», «…» (меню: экспорт, дублировать / убрать из своих, дубли, **+ редактировать / удалить** ❓17);
  - `MasteryBar` с легендой и «N К ПОВТОРЕНИЮ»;
  - сетка «Как учить» (рекомендованный режим + 4 режима);
  - тулбар слов: поиск, Все/Слова/Фразы, «Избранные», «ИИ: проверить и подобрать фразы» ❓18.
- **+** `pages/DeckPage/model/recommendMode.ts` — какой режим «РЕКОМЕНДУЕМ».
- **~** `widgets/CardList/ui/CardList.tsx` — колонки ★, Слово (+ФРАЗА), Перевод, Пример, Статус, 🔊; для «Все слова» — Колода и **Показ**. Статус берём из `useGetCardReviewsQuery(deckUuid)`.
- **~** `pages/DecksPage`, `AllWordsPage`, `FavoritesPage` — общий `LibraryHeader` (вкладки со счётчиками, «Импорт из Excel», «Найти дубли», «Создать колоду»).
- **~** `DecksPage`: поиск по названию, «Все / Мои / Доступные мне», сортировка.
- **~** `AllWordsPage`: поиск, фильтр колоды, **статус**, тип; тёмная полоса выборки «418 слов в фильтре · из 9 колод» → «Карточки» / «Заучивать выборку».
- **+** `widgets/SelectionStrip/`.
- **~** `AllWordsLearnPage`, `AllWordsFlashcardsPage` — читать фильтр из query-параметров (`?q=&deck=&status=&type=`).
- **~** Модалки 6.27–6.30 — только вид, логика та же:
  - `features/CardEditor/ui/CardEditor.tsx` (920px, «+2» вариантов, «Строка · Enter»);
  - `CheckTranslationsModal` (одношаговый вид с итоговой фразой и «ОСТАЛОСЬ N» в шапке);
  - `GenerateChunksModal` (чипы выбранных слов, группировка по слову);
  - `ShareDeckModal` (520px).
- **+** `shared/ui/ModalHeader` (kicker колоды, заголовок, бейдж квоты) — общий для 4 модалок.

**Хуки:**
- `useGetDeckQuery`, `useGetCardsQuery`, `useGetCardReviewsQuery`, `useGetFavoritesQuery`;
- `useGetCardsPageQuery`, `useGetAiUsageQuery`, `useGetMasteryQuery`;
- **+** RPC `get_cards_page` с join на `card_reviews` (статус, `due_at`, фильтр статуса) ❓19.

**⚠ Расхождения**
- «Импорт из Excel» и «Найти дубли» на уровне **библиотеки** — сейчас они живут внутри колоды (CardEditor / меню колоды). Импорт без выбранной колоды → нужен шаг выбора колоды; дубли **между колодами** — новая логика ❓20.
- Колонка «Показ» и фильтр статуса на серверной пагинации — `useGetCardsPageQuery` не знает о reviews ❓19.
- «ИИ: проверить и подобрать фразы» — одна кнопка на две разные модалки ❓18.
- Статус «Повторить» (`due_at ≤ now`) — 4-е состояние, которого нет в `MasteryBar`.
- Карточка «Избранное» в начале сетки DeckList на макете отсутствует (есть вкладка) — убираем.

## Итерация 7 — Учить: повторение, циклы, дорожная карта (6.6–6.9)

**Файлы**
- **~** `pages/ReviewPage/ui/ReviewPage.tsx`, `ReviewPreview.tsx`:
  - `AccentPanel` «СЕССИЯ НА СЕГОДНЯ» (к повторению + новых, «Начать · ≈ N мин»);
  - «Нагрузка на 2 недели» (14 столбиков, «≈ N / ДЕНЬ»);
  - «Что войдёт в сессию» — чекбоксы колод + `MasteryBar`.
- **+** `features/ReviewDeckFilter/model` — исключённые колоды (`useLocalStorage('ReviewExcludedDecks')`, ❓21); фильтр `DueCard[]` на клиенте.
- **~** `pages/CyclesPage` — kicker «ДЕНЬ N» + «N НОВЫХ» (сигнал «срочно»), 30 ячеек, «N слов · M новых в день».
- **~** `pages/CyclePage` — панели «СЕГОДНЯ» и «Структура цикла»; кнопки «Учить новые · N», «Повторить N», «Новый день →».
- **~** `widgets/CycleWordList` — новый вид строки (ручка, №, слово, перевод, тег статуса, ★, ▶). Inline-редактирование и флаг стартовой точки **сохраняем** ❓22.
- **~** `pages/RoadmapPage/ui/RoadmapPage.tsx` — `AccentPanel` «7 / 20 шагов» + 20-сегментная дорожка + «Продолжить: …»; 4 колонки этапов (пройденное — сигнал «результат», «ВЫ ЗДЕСЬ» — пунктир).

**Хуки:** `useGetDueCardsQuery`, `useGetDueCountQuery`, `useGetDecksQuery`, `useGetMasteryQuery`, `useGetDueForecastQuery`, `useGetCyclesQuery`, `useGetCycleWordsQuery`, `useCyclePortionSync`, `useLocalStorage('RoadmapDoneSteps')`.

**⚠ Расхождения**
- **«+6 новых»**: RPC `get_due_cards` берёт по умолчанию 10 новых; это число нужно показывать честно (из ответа RPC).
- **Список циклов**:
  - «ДЕНЬ 6» = `current_portion`, это ок;
  - «3 НОВЫХ» (осталось сегодня) требует слов каждого цикла → N+1 запрос. Нужен RPC/поле в `get_cycles` ❓23;
  - 30 ячеек — что означает ячейка (день? 1/30 слов?) ❓23.
- **Деталь цикла**: «4/7 новых выучено» — «выучено сегодня» не хранится (только порция; прогресс сессии лежит в localStorage `cycle_session:*`) ❓23.
- **Дорожная карта**: «7 / 20», но шагов **19** и в коде (5+4+4+6), и в самом макете → пишем фактическое число. Прохождение ручное (галочки), макет этому не противоречит.

## Итерация 8 — грамматика (6.18–6.22)

**Файлы**
- **~** `pages/GrammarTensesPage` — матрица 4×3: колонки-аспекты с идеей и «СЕЙЧАС», ячейки с формулой, примером и 5 тиками освоенности; подсветка текущей группы; «План изучения» (5 шагов: done/now/next); «Как выбрать время»; CTA «Практика {группа}».
- **~** `pages/TenseGroupPage` — `BackLink`, kicker «ГРУППА 3 ИЗ 4 · …», H1 + формула, 3 карточки времени (КОГДА, МАРКЕРЫ, ПРИМЕРЫ, ТИПИЧНАЯ ОШИБКА), блок «Сравнение».
- **~** `pages/GrammarPracticePage` — 2 колонки: слева настройки (группы, источник «Шаблоны / ИИ», квота, «Новый набор»), справа задания с разбором в строке, `TickProgress`, «Совет ИИ», «Ещё раз / Только ошибки».
- **~** `pages/IrregularVerbsPage` — поиск, 3 полосы-аккордеона с % освоения и CTA.
- **~** `pages/GrammarTopicPage` — `BackLink` (Учить / Дорожная карта / Этап N), kicker «ТЕМА · A1 · ШАГ N ИЗ M», «Отметить пройденным», правила, ошибки, prev/next.
- **+** `entities/GrammarPractice/model/` — хранилище результатов практики по временам (для тиков в матрице и «Следующего шага») ❓24.

**Хуки:** `useGetAiUsageQuery`, `useGenerateGrammarExercisesMutation`, `useCheckGrammarAnswersMutation`, `useGetDecksQuery` + `useGetMasteryQuery` (освоение полос неправильных глаголов — по колоде с тем же именем), `useLocalStorage('RoadmapDoneSteps')`.

**⚠ Расхождения**
- Тики освоения времён и состояния плана (done/now) — **данных нет** ❓24.
- В макете 6 заданий в наборе, в коде 5 ❓25.
- «Только ошибки» — новая функция (повтор заданий с ошибками).
- «120 глаголов · группы 1–40 / 41–80 / 81–120»: в `irregularVerbs.ts` их **105** и группы другие → либо дополнить список, либо подписи по факту ❓26.
- «2 запроса · осталось 18» — квота пожизненная, не месячная (см. ❓27).

## Итерация 9 — прогресс (6.23)

**Файлы**
- **~** `pages/ProgressPage` — H1 + сегмент «Неделя / Месяц / Год», KPI-полоса, heatmap, «Освоение слов», «По колодам».
- **~** `widgets/AccuracyTimeCards` → KPI-полоса из 4 `StatCell` (точность, ответов, время, серия с уровнем). Сейчас там 5 карточек с иконками.
- **~** `widgets/StreakHeatmap` → 52×7 по неделям, 5 ступеней accent, месяцы снизу, «N дней с занятиями».
- **~** `widgets/MasteryChart` → `MasteryBar` + легенда с числами, «1 240 ВСЕГО».
- **~** `widgets/DeckProgressList` → строки с полосой; ≥80% — сигнал; «Все 14».

**Хуки:** `useGetStudyOverviewQuery`, `useGetStudyHeatmapQuery`, `useGetMasteryQuery`, `useGetDeckProgressQuery`, `useGetCardsCountQuery`; **+** `useGetStudyPeriodStatsQuery` ❓28.

**⚠ Расхождения**
- Переключатель периода: все RPC принимают только `tz`, периода нет.
- Дельты «▲ 4% к прошлому году», «▲ 12% за месяц» и «7 мин в среднем за сессию» — нужен RPC по `study_events` с границами периода ❓28. Понятия «сессия» в данных нет (только события).
- «По колодам»: в макете — % освоения, сейчас — точность ответов + m/t. Берём `mastered / cards_count`.

## Итерация 10 — аккаунт (6.24–6.26)

**Файлы**
- **~** `pages/AccountPage` — вкладки (из итерации 3) получают свой контент.
- **Профиль**:
  - **+** `features/EditProfile/ui/ProfileForm.tsx` — инлайн-форма вместо модалки: аватар-сетка, Имя, Фамилия, Почта (read-only?), Часовой пояс, «Сохранить», «Сменить пароль»;
  - **+** `widgets/AiQuotaCard` (30 делений);
  - **+** блок «Роль / С нами с / Выйти».
- **Настройки** — **~** `pages/SettingPage` → сегменты: Тема (Светлая/Тёмная/Как в системе), Язык (Русский/English), Голос (сегменты + ▶).
  - **~** `features/ThemeSwitcher` (сегмент вместо иконки), `LangSwitcher`, `VoiceSwitcher`.
- **Пользователи** — **~** `widgets/UsersTable`: таблица (пользователь, роль, статус, ИИ «27/30») + **+** `widgets/UserDetailsPanel` (колод, слов, серия, роль, лимит ИИ, «Заблокирован», «Сохранить», «Войти как пользователь»).
- **?** `pages/UserPage` и маршрут USER — оставить или заменить на панель ❓29.
- **−** `features/EditProfile/ui/EditProfileModal.tsx`, если форма становится инлайн.

**Хуки:** `useUserInfo`, `useUpdateMeInfoMutation`, `useGetAiUsageQuery`, `useGetUsersQuery`, `useUpdateUserRoleMutation`, `useSetUserBlockedMutation`, `useSetUserAiLimitMutation`, `useUserSettingsTheme`.

**⚠ Расхождения**
- **Квота ИИ**: «ОКТЯБРЬ · 18 из 30» и «лимит 30/50» против лимита 0–25 (по умолчанию 5) без помесячного сброса ❓27.
- Часового пояса нет в `profiles` (берётся из `Intl`). Отчество, телефон, описание и пол на макете отсутствуют — потерять или спрятать? ❓30
- «Сменить пароль» — `ChangePasswordPage` работает через **старый REST** (`usePasswordRecoveryMutation`). Для Supabase нужен `supabase.auth.updateUser` ❓30.
- Тема «Как в системе» — в `UserSettings` только `'light' | 'dark'`, и настройки лежат в REST ❓14.
- Голоса: макет показывает 3 фиксированных голоса, а реально список зависит от браузера → сегменты из первых 3 английских голосов + «ещё…»? ❓31
- Панель пользователя: «Колод / Слов / Серия» по чужому пользователю — нужен админский RPC; «Войти как пользователь» — impersonation через старый REST (мёртв) ❓29.
- Убираем Email/SMS/Web-уведомления из настроек (на макете их нет).

## Итерация 11 — публичные (6.31–6.34)

**Файлы**
- **~** `pages/LoginPage/ui/LoginPage.tsx` — сплит: слева `AccentPanel` (логотип, слоган, 3 пункта), справа форма. Вход и регистрация — тот же компонент. Убрать 18 inline-стилей. Скрытый режим impersonation ❓29.
- **~** `pages/NotFoundPage`, `ForbiddenPage` → **+** `widgets/ErrorScreen` (номер в `Blueprint`, текст, «Повторить N» / «На главную»).
- **~** `pages/AboutPage` — одна страница: шапка с якорями (Возможности / Сравнение / Вопросы), hero, 6 режимов, таблица сравнения, FAQ.
- **−** `pages/FeaturesPage`, `pages/FaqPage`; **~** `routeConfig` — FEATURES и FAQ рендерят `AboutPage` и скроллят к якорю (`#features`, `#faq`).
- **~** `widgets/PublicHeader`, `PublicFooter` — новый вид.

**Хуки:** `useLoginMutation`, `useRegisterMutation`, `useGetDueCountQuery` (только для авторизованного на 404).

**⚠ Расхождения**
- FAQ: в макете 4 вопроса, в коде 11 → переносим все 11 в новом виде ❓32.
- 404 сейчас только для авторизованных (`authOnly`) — «Повторить 42» корректно; для гостя скрываем.
- `PrivacyPage` и `ChangePasswordPage` в макетах отсутствуют — только перекрашиваем токенами.

## Итерация 12 — мобильная (6.35–6.57)

**Файлы**
- **~** `shared/lib/hooks/useMatchMedia.ts` — исправить переподписку (`useSyncExternalStore`). Это единственный брейкпоинт-механизм; `react-device-detect` в Sidebar и Navbar заменить на него.
- **+** `widgets/TabBar/` — нижний таб-бар (5 разделов + бейдж), цели касания ≥44px.
- **~** `AuthLayout` — на мобильном TabBar вместо Sidebar; Topbar упрощён (без поиска 420).
- **−** `widgets/Navbar` целиком (мобильный `NavbarMenu` + Drawer больше не нужен) — уведомления и профиль переезжают в Topbar/Аккаунт.
- **~** `FocusLayout` — fullscreen без таб-бара.
- **~** `SectionTabs` — горизонтальный скролл.
- **+** `shared/ui/ResponsiveModal` — `Modal` на десктопе, bottom-sheet (`shared/ui/Drawer`, уже на react-spring) на мобильном → для CardEditor и других модалок.
- **Отличия** (PLAN §12):
  - `AccountPage` на мобильном — профиль и настройки одним экраном;
  - `RoadmapPage` — аккордеон с открытым текущим этапом, остальные «откроется после этапа N»;
  - `TenseGroupPage` — сегмент Present/Past/Future;
  - Progress — heatmap за 4 месяца (18 недель).
- **~** Все `.module.scss` из итераций 3–11 — медиазапросы через миксины (+ `src/app/styles/mixins/_breakpoints.scss`).

**Риски:** CardList на мобильном сейчас — карточки со своей пагинацией; на макете 6.36 — строки «★ слово — перевод • статус».

## Итерация 13 — пустые состояния, скелетоны, тосты (BACKLOG §1–3)

**Файлы**
- **~** `shared/ui/EmptyState` — новый API (kicker, title, description, icon 64×64, `primary`, `secondary`, `align`). Обновить 2 использования (ProgressPage, UsersTable) и добавить 7 мест из таблицы §1 + hero с долгом 0.
- **+** `shared/ui/Skeleton` (`SkeletonBlock`, тёмный вариант) + **+** `useDelayedFlag(200)`; скелетоны для hero, серии, сетки колод, таблиц.
- **+** `shared/lib/toast/` — `ToastProvider` (свой стек: снизу слева, ≤3, 4/6 с, пауза на hover, «Отменить») + `useToast`.
  - **~** 21 файл / 72 вызова `message.*` через `useAntdApp` → `useToast`.
  - **~** `NotificationProvider`/`globalAntdApi` (для `rtkApi`) → глобальный доступ к toast.
- **+** `widgets/NetworkBanner` (`navigator.onLine`).
- **+** `features/AiQuotaGuard` — плашка при ≤3, disabled + тултип при 0.

**Риски:** `rtkApi.ts` показывает ошибки через глобальный AntD API вне React — нужен такой же глобальный доступ к toast.

## Итерация 14 — палитра ⌘K (BACKLOG §4)

**Файлы**
- **+** `features/CommandPalette/` (`CommandPalette.tsx`, scss, `model/useCommandItems.ts`, `model/useCommandHotkeys.ts`): ⌘K/Ctrl+K, `/` вне инпутов; группы Действия / Колоды / Слова / Перейти; ↑↓ Enter Esc; недавние колоды (localStorage).
- **~** `widgets/Topbar` — кнопка поиска открывает палитру.
- **−** `pages/MainPage/ui/GlobalSearchResults.tsx` и поиск на главной (логику переносим).

**Хуки:** `useGetDecksQuery`, `useGetCardsPageQuery` (debounce 200), `useGetDueCountQuery`.

**Риски:** ⌘N в Chrome не перехватывается (новое окно) → подсказки должны быть реалистичными ❓33.

## Итерация 15 — онбординг (BACKLOG §5)

**Файлы**
- **+** `pages/OnboardingPage` (+ маршрут `ONBOARDING` `/welcome`, `focusLayout`), 3 шага, `TickProgress` из 3, «Пропустить».
- **~** `RequireAuth` — редирект на `/welcome`, если `onboarding_done` не установлен.
- Шаг 2 — переиспользование `CardEditor`, импорта Excel и `useImportVerbsDeck`.
- Шаг 3 — запуск `FlashcardsGame` → `SessionResult`.

**⚠** Шаг 3: «→ итог сессии с началом серии», но Flashcards **не пишет прогресс** (и не должен — «без записи прогресса»), значит серия не начнётся ❓34. Флаг и цель дня требуют хранилища ❓14.

## Итерация 16 — тёмная тема (BACKLOG §6)

**Файлы**
- **~** `themes/dark/index.tsx`, `globalCssVariables[Theme.DARK]`, `getDarkComponentOverrides()` — пересобрать из тех же рамп (значения §6).
- **~** `src/shared/const/theme.ts` + `useUserSettingsTheme` + `ThemeProvider` — режим `system` (`prefers-color-scheme` + подписка).
- **~** Все места, где в SCSS используются конкретные рампы для «тёмного поля», — проверить на `#0e141a`.

**Риски:** сигналы в `oklch` с L+0.08 — пересчитать hex для AntD; проверить контраст.

## Итерация 17 — анимации (BACKLOG §8)

**Файлы**
- **+** `shared/lib/hooks/useCountUp.ts`, `useReducedMotion.ts`, `useInViewport.ts`, `useOncePerDay.ts`.
- **~** scss всех компонентов из таблицы §8 (transitions на токенах); `AuthLayout` — анимация смены страницы по `key=pathname`.
- FLIP в «Собери фразу», переворот карточки, последовательность итога — **на `@react-spring/web` (уже в зависимостях) вместо `motion`** ❓35.

**Риски:** stagger и count-up раз в день → `localStorage`-флаг с датой.

## Итерация 18 — i18n, a11y, финальная сверка

- `node scripts/find-missing-translations.js --apply` → дозаполнить `public/locales/en/translation.json`. По памяти проекта: файлы с дублями и без сортировки — править **текстом**, не пересериализовывать JSON.
- Контраст ≥4.5:1 (особенно accent-300 на accent-900, neutral-600 на bg, сигнальные «ink»), `aria-label` у icon-кнопок, фокус с клавиатуры, `prefers-reduced-motion`.
- Таблица сверки 6.1–6.57 → исправления.
- Мёртвый код (только **список**, не удалять без согласования): 13 неиспользуемых `shared/ui`, `widgets/Footer`, REST-эндпоинты User, хуки чата.

---

## Сквозные правила для всех итераций

- Строки только через `t('Русская строка')` (ключи = русский текст), en дозаполняется в итерации 18.
- Иконки: новые компоненты — только `lucide-react` `strokeWidth={1.5}`; `@ant-design/icons` заменяется по мере перевода экранов.
- Никаких inline-стилей. Динамические цвета (уровень серии, статус) — через `data-*`/модификаторы классов, а не `style`. Динамическая ширина (MasteryBar, столбики прогноза) — через CSS custom property, например `style={{ '--w': '62%' }}`. Это формально inline-стиль ❓36.
- Проверка каждой итерации: `npm run typecheck`, `npm run lint`, `npm run lint:scss`; ручная сверка в браузере (`npm run start`) с открытым `Zubrika Redesign.dc.html`; список расхождений по номерам экранов.

## Новое на сервере (если ответы на вопросы подтвердят)

| RPC / таблица | Для чего | Итерации |
|---|---|---|
| `get_due_forecast(p_days, p_tz)` | прогноз 7/14 дней | 5, 7 |
| `get_cards_page` с join `card_reviews` | статус, «Показ», фильтр статуса | 6 |
| `get_cycles` + `today_remaining` / `learned_today` | карточки циклов | 7 |
| `get_study_period_stats(p_from, p_to, p_tz)` | период, дельты, среднее за сессию, рекорд точности | 4, 9 |
| `user_preferences` (или колонки в `profiles`): `daily_goal`, `onboarding_done`, `theme`, `language`, `review_excluded_decks` | вместо REST user-settings | 3, 5, 7, 10, 15, 16 |
| `grammar_results` | освоение времён | 5, 8 |
| `ai_usage` помесячно | «Лимит обновится 1-го» | 6, 8, 10, 13 |
| `admin_user_stats(user_id)` | панель пользователя | 10 |

Деплой SQL — вручную (миграций нет), Edge Functions — `supabase functions deploy --profile supabase`.

---

## Вопросы

**Данные и бэкенд**
1. Поддерживаемые браузеры: можно ли использовать `oklch()`/`color-mix()` в CSS (Safari ≥15.4, Chrome ≥111), или нужны hex-fallback?
2. Тёмная тема между итерациями 1 и 16 останется со старой палитрой. Скрыть переключатель до итерации 16 или временно перекрасить тёмную тему?
13. Делать RPC `get_due_forecast` (точно, без лимита 1000) или считать прогноз на клиенте из `useGetCardReviewsQuery` (тогда заодно чиним пагинацию)?
14. **Где хранить настройки** (цель дня, `onboarding_done`, тема с «Как в системе», язык, исключённые колоды)? `UserSettings` сейчас ходит в старый REST `/api`. Варианты: новая таблица Supabase `user_preferences` (рекомендую) или localStorage.
19. Колонка «Показ» и фильтр статуса во «Всех словах» — делать серверный RPC `get_cards_page` с join `card_reviews`?
23. Циклы: что означают 30 ячеек на карточке цикла? Как считать «4/7 новых выучено» — по сессии new сегодня (нужно хранить на сервере) или убрать «выучено»?
24. Освоение времён (тики в матрице, «план» done/now, «Тема пройдена на 70%») — завести таблицу `grammar_results` или хранить в localStorage? Как считать «освоено» (≥N верных подряд по времени)?
27. Квота ИИ: вводить помесячный лимит со сбросом 1-го числа и поднимать дефолт до 30 (как в макете) или оставить пожизненный лимит и поменять тексты?
28. Прогресс: делать период «Неделя / Месяц / Год» и дельты (нужен новый RPC) или убрать переключатель и дельты?

**Поведение и функции**
3. Убираем из сайдбара «Последние колоды», ресайз и номер версии — согласны?
4. Колокольчик уведомлений: бэкенд уведомлений — старый REST и websocket, события не из этого продукта. Убрать колокольчик, оставить как есть или сделать заглушку?
5. Формула «≈ N мин»: устроит ~11 с на карточку?
6. «Я ответил верно» в Письме — новая функция (меняет оценку на «верно»). Делать?
7. «Не помню» в Пропусках — это прежний «Пропустить» (без штрафа) или ответ «неверно»?
8. Повторение (REVIEW): сессия идёт на той же странице `/review`. Переключать оболочку в фокус-режим по состоянию страницы (URL не меняется) — ок?
9. 14 делений прогресса при длинной сессии (44+ карточек): агрегировать ответы в 14 делений или показывать окно последних 14?
10. Когда «день засчитан»: любой ответ (как сейчас считается серия) или выполнение цели дня («Ещё 6 карточек — и день засчитан»)? От этого зависит логика серии.
11. Итог сессии: «Ещё 7 новых из …» — из какой колоды (текущей)? «Повторить трудные» — запускать новую сессию по `uuids` трудных слов через `location.state`?
12. Главная: удаляем StatsStrip, QuickActions и «Последние слова» (их нет в макете)?
15. Цель дня считается в ответах (как heatmap) или в уникальных карточках?
16. «Следующий шаг» для цикла: «раунд 2 из 3» в данных нет. Заменить на «Новые слова · 3 из 7»?
17. На странице колоды нет «Редактировать / Удалить колоду» (сейчас они только в меню карточки в списке). Добавить в «…»?
18. «ИИ: проверить и подобрать фразы» — одна кнопка с выпадающим меню на две модалки?
20. «Импорт из Excel» и «Найти дубли» на уровне библиотеки: импорт — с выбором колоды в модалке? Дубли — по всем колодам сразу (новая логика)?
21. Исключённые из повторения колоды — хранить локально (localStorage) или на сервере (см. 14)?
22. В списке слов цикла оставить inline-редактирование и флаг «стартовая точка» (в макете их не видно)?
25. Практика времён: 6 заданий (макет) или 5 (сейчас)?
26. Неправильные глаголы: дополнить список до 120 (3×40) или подписать группы по факту (105)?
29. Админка: заменить `/users/:id` панелью справа (маршрут оставить как открытие с выбранным пользователем)? «Войти как пользователь» и скрытый impersonation на логине работают через мёртвый REST — убрать?
30. Профиль: поля «Отчество», «Телефон», «Описание», «Пол» на макете отсутствуют — убрать из формы? «Часовой пояс» — добавить колонку в `profiles`? «Сменить пароль» — переписать на Supabase (`auth.updateUser`)?
31. Голос: показывать 3 сегмента из доступных голосов браузера или оставить Select?
32. FAQ: в макете 4 вопроса, в коде 11. Переносим все 11?
33. ⌘K-палитра: какие горячие клавиши действий оставить (⌘N перехватывает браузер)?
34. Онбординг, шаг 3: карточки не пишут прогресс, поэтому серия не начнётся. Делать первую сессию «Заучиванием» или засчитывать день отдельно?
35. Анимации: использовать уже установленный `@react-spring/web` вместо добавления `motion`?
36. Динамические ширины и высоты (полосы освоения, столбики прогноза, heatmap) — разрешаем CSS custom property через `style={{'--w': …}}` как единственное исключение из запрета inline-стилей?
