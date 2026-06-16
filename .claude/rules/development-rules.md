---
paths:
  - "src/**"
---

# Development Rules

## Tech Stack

React 19, TypeScript 5.9+, Webpack 5, Redux Toolkit + RTK Query, SCSS + CSS Modules, Ant Design v6, React Router DOM v7, i18next, Jest, ESLint.

## FSD Architecture

```
src/
├── app/        # Providers (Store, Router, Theme, Notification, ErrorBoundary), global styles, types
├── pages/      # Route-bound pages (use .async.tsx for lazy loading)
├── widgets/    # Composite layout blocks (Navbar, Sidebar, Footer, PageLoader, ErrorPage)
├── features/   # User-facing features (LangSwitcher, ThemeSwitcher, Logout)
├── entities/   # Domain objects with API, types, UI (User, UserSettings, Notifications)
└── shared/     # Reusable utilities, hooks, UI components, API config
```

### FSD Import Rule (STRICT)

Layers import ONLY downward: `app > pages > widgets > features > entities > shared`. A layer CANNOT import from the same layer or above. Always use `@/` prefix for cross-layer imports.

### Import Order

1. React + external libraries (`react`, `antd`, `react-i18next`)
2. FSD layer imports via `@/` (`@/entities/User`, `@/shared/lib/...`)
3. Relative imports (`./LocalComponent`, `../lib/helper`)
4. Styles — ALWAYS last (`import cls from './Component.module.scss'`)

## Component Pattern

```typescript
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './ComponentName.module.scss';

interface ComponentNameProps {
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  return (
    <div className={classNames(cls.ComponentName, [className])}>
      {t('key')}
    </div>
  );
};
```

### File Structure

```
ComponentName/
├── index.ts                    # Barrel export (named exports only, no default, no export *)
├── ComponentName.tsx           # Main component
├── ComponentName.module.scss   # Styles
└── ComponentName.async.tsx     # lazy(() => import('./ComponentName')) — for pages
```

### Naming

- Components/folders: PascalCase (`UserProfile.tsx`, `UserProfile/`)
- Utilities/hooks: camelCase (`formatDate.ts`, `useDebounce.ts`)
- Props: `interface ComponentNameProps`, destructure at start of component body

## Component Reuse Priority (CRITICAL)

Before creating ANY new component, check in order:
1. **Ant Design** (`antd`) — Button, Input, Select, Table, Modal, Form, Card, Typography, Space, etc.
2. **@/shared/ui** — Loader, Drawer, Modal, HStack/VStack, MyTypography, InputFile, DateTimePicker, LabelWithTooltip, SuccessScreen, Overlay, Portal, FileViewerModal, FileLoadedList, ErrorFallback, EmptyState, StatusTag, AccessIndicator, CustomButton, BooleanSegmented, FloatingFormItem, LocalDraftRecoveryModal, PasswordStrengthIndicator, DoughnutChart, HorizontalBarChart, DatePickerInline
3. **Ant Design + custom `.module.scss`** — customize existing component with CSS
4. **New component** — ONLY if truly unique and reusable

## State Management

### buildSlice (`@/shared/lib/store`)

Wraps `createSlice`, auto-generates `useActions` hook with bound dispatch:

```typescript
export const { actions, reducer, useActions: useXActions } = buildSlice({
  name: 'x',
  initialState,
  reducers: { setFoo: (state, action) => { state.foo = action.payload; } },
});
// In component — NO useDispatch needed:
const { setFoo } = useXActions();
setFoo(value);
```

### RTK Query (single API)

One RTK Query API:

- **`rtkApi.injectEndpoints`** — main backend (`__API__`): users, settings, notifications, and future decks/cards endpoints

Defined in entity `model/api/`. Use `providesTags`/`invalidatesTags` for cache. Handle `isLoading`, `error`, `isFetching` states in components. Mutations: use `.unwrap()` in try/catch. `authenticatedFetch` (`@/shared/api`) provides fetch with Mutex-protected 401 refresh for non-RTK endpoints.

### Routing

Type-safe paths in `@/shared/config/router/routePath.ts`. Use `useNavigate`, `useParams`.

## TypeScript Rules

- Strict typing, NO `any` (use `unknown` or proper type)
- Interface for all props and data structures
- Enums for constants (roles, statuses)
- Utility types: `Partial`, `Pick`, `Omit`, `Record`
- Type all RTK Query endpoints: `builder.query<Response, Request>`
- No `@ts-ignore` without explanatory comment

## Styling Rules

- CSS Modules only (`.module.scss`), import as `cls`
- `classNames(cls.Component, [className], { [cls.active]: isActive })` for conditional classes
- PascalCase for main component classes, camelCase for elements/modifiers
- Max 3 levels nesting
- No inline styles, no magic numbers, no global CSS without modules

### CSS Variables Priority

1. **Global vars** (`src/app/styles/variables/global.scss`): `--bg-color`, `--text`, `--navbar-height`, `--sidebar-width`, `--modal-z-index`, etc.
2. **Ant Design theme tokens** (auto-converted camelCase → --kebab-case from `src/app/styles/themes/light/index.ts`): `--color-primary` (#0E0E0E), `--color-primary-bg` (#FAFAFA), `--color-error` (#eb5151), `--color-warning` (#f57834), `--color-success` (#69bb80), `--color-link` (#722ed1), `--border-radius` (8px)
3. **New variable** — add to `global.scss` only if reused in multiple places

## i18n

All user-facing text MUST use `useTranslation` from `react-i18next`. Supports `ru` (primary) and `en`. Locale files in `public/locales/`.

## Performance

- `React.lazy` + `.async.tsx` for all pages
- `memo`, `useMemo`, `useCallback` for expensive components
- Tree-shaking friendly imports (`import { X } from 'lib'`, not `import * as lib`)
- RTK Query caching with `keepUnusedDataFor`, `selectFromResult` for selective subscriptions
- `react-virtuoso` for large lists, pagination for large datasets
- Images: lazy loading, WebP/AVIF
- Debounce search requests

## Shared Hooks

- **Data**: `useDebounce`, `useDebounceState`, `useLocalStorage`, `useTableParams`
- **UI**: `useMatchMedia`, `useOutsideClick`, `useInfiniteScroll`, `useResizable`, `useInlineEdit`, `useCopyToClipboard`, `useForwardedRef`
- **Keyboard**: `useArrowPressed`, `useCtrlPressed`, `useShiftPressed`
- **App context**: `useAntdApp` (Ant Design modal/notification/message), `useTheme`, `useNotification`
- **Domain**: `useCheckFormChanges`, `useNumberParamsFromString`

## Critical Don'ts

- No `any` types, no hardcoded strings (use i18n)
- No FSD boundary violations (cross-layer or upward imports)
- No inline styles, no `export *` or default exports in barrel files
- No relative imports for cross-layer dependencies (use `@/`)
- No creating components that Ant Design or @/shared/ui already provides
