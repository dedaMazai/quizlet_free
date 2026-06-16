# English Flashcards App

Прототип веб-приложения для заучивания английских слов — наборы карточек (decks), карточки «слово ↔ перевод» и режимы тренировки. В качестве референса по продукту используется [quizlet.com](https://quizlet.com).

Это стартовый каркас (boilerplate): из проекта удалён прежний бизнес-домен, оставлены только инфраструктура и базовые сущности `User`, `UserSettings`, `Notifications`. Поверх него строится новый функционал изучения языка.

## Технологии

React 19, TypeScript 5.9+, Webpack 5, Redux Toolkit + RTK Query, SCSS + CSS Modules, Ant Design v6, React Router v7, i18next (ru/en), Jest, ESLint.

## Архитектура (FSD)

```
src/
├── app/        # Провайдеры (Store, Router, Theme, Notification, ErrorBoundary), глобальные стили
├── pages/      # Страницы (Login, Main, Profile, Settings, User, ошибки)
├── widgets/    # Композитные блоки (Navbar, Sidebar, Footer, PageLoader, ErrorPage)
├── features/   # Пользовательские фичи (LangSwitcher, ThemeSwitcher, Logout)
├── entities/   # Доменные объекты (User, UserSettings, Notifications)
└── shared/     # Переиспользуемые утилиты, хуки, UI-компоненты, конфиг API
```

Импорты только «вниз»: `app > pages > widgets > features > entities > shared`. Для кросс-слойных импортов — префикс `@/`.

## Команды

```bash
npm run start         # Dev-сервер (webpack-dev-server)
npm run build         # Production-сборка
npm run typecheck     # Проверка типов (tsc --noEmit)
npm run lint:fix      # ESLint с автофиксом
npm run lint:scss:fix # Stylelint с автофиксом
npm run test          # Jest
```

## Локализация

Все пользовательские строки — через `useTranslation` (`react-i18next`). Языки: `ru` (основной) и `en`. Файлы переводов — в `public/locales/`. Управление ключами — скриптами ниже.

---

### Скрипты для работы с переводами (`scripts/`)

В папке `scripts/` находятся три скрипта для управления i18n-переводами. Все работают в двухфазном режиме: сначала генерируют MD-отчёт для ревью, затем применяют изменения из отредактированного отчёта.

#### Полный workflow

```bash
# Шаг 1. Очистка — удалить неиспользуемые ключи из переводов
node scripts/clean-translations.js
# → Генерирует scripts/clean-translations-report.md
# → Проверить отчёт, удалить строки с ключами, которые нужно ОСТАВИТЬ
node scripts/clean-translations.js --apply
# → Применяет изменения из отчёта: удаляет из ru и en, добавляет недостающие в en

# Шаг 2. Поиск — найти ключи в коде, которых нет в переводах
node scripts/find-missing-translations.js
# → Генерирует scripts/translation-report.md
# → Проверить отчёт, удалить строки с ключами, которые НЕ нужно добавлять
node scripts/find-missing-translations.js --apply
# → Добавляет ключи в ru (значение = ключ) и en (значение = пустая строка)

# Шаг 3. Перевод — заполнить пустые английские переводы
node scripts/find-empty-string-in-json-en.js
# → Генерирует scripts/empty-translations-report.md с ru-значениями для контекста
# → Отдать отчёт AI или переводчику — заполнить строки после **en:**
node scripts/find-empty-string-in-json-en.js --apply
# → Вставляет заполненные переводы в en/translation.json
```

---

#### `clean-translations.js` — очистка неиспользуемых ключей

Анализирует файлы переводов (`public/locales/`) и исходный код (`src/`):

1. **ru → код**: каждый ru-ключ ищется в исходниках. Если не найден — помечается на удаление. Англоязычные ключи (ответы от бэкенда) пропускаются автоматически
2. **en → ru**: каждый en-ключ проверяется на наличие в ru. Если нет — помечается на удаление
3. **ru → en**: каждый ru-ключ проверяется на наличие в en. Если нет — помечается на добавление

При `--apply` также удаляет из en ключи, удалённые из ru, чтобы не оставалось сирот.

**Отчёт:** `scripts/clean-translations-report.md` — удалите строки с ключами, которые хотите **оставить**, перед запуском `--apply`.

---

#### `find-missing-translations.js` — поиск недостающих ключей

Сканирует все `.ts`/`.tsx` файлы в `src/` и находит проблемы:

| Тип | Описание | Попадает в отчёт |
|-----|----------|-----------------|
| `MISSING_KEY` | Ключ в `t('...')` / `<Trans>` отсутствует в `translation.json` | Да |
| `WRONG_INTERPOLATION` | Используется `t(\`...\${var}...\`)` вместо `t('...{{var}}...', { var })` | Нет (только консоль) |
| `UNWRAPPED` | Русский текст в строковом литерале без `t()` | Нет (только консоль) |
| `JSX_TEXT` | Русский текст напрямую в JSX без `t()` | Нет (только консоль) |

Игнорирует: комментарии, `console.*`, `import`/`export type`/`interface`, тесты, stories, `.d.ts`.

**Отчёт:** `scripts/translation-report.md` — удалите строки с ключами, которые **не нужно** добавлять, перед запуском `--apply`.

При `--apply` добавляет ключи в оба файла: ru (значение = сам ключ) и en (пустая строка).

---

#### `find-empty-string-in-json-en.js` — заполнение пустых en-переводов

Находит ключи в `en/translation.json` с пустым значением (`""`) и генерирует отчёт с ru-значениями для контекста.

**Отчёт:** `scripts/empty-translations-report.md` — формат для AI/переводчика:

```markdown
### `Ключ перевода`

**ru:** Русское значение для контекста

**en:** (сюда вписать английский перевод)
```

При `--apply` парсит заполненные строки `**en:**` и вставляет переводы в `en/translation.json`.

---