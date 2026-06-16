# CLAUDE.md

## Project Overview

English Flashcards App — prototype web app for learning English vocabulary through flashcards. Users create decks of cards (term ↔ translation/definition) and practice them in study modes. Product reference: quizlet.com. React 19 / TypeScript 5.9+ / Webpack 5 frontend.

Current state: a clean boilerplate — the previous business domain was removed. Only infrastructure and the base entities `User`, `UserSettings`, `Notifications` remain. New language-learning features (decks, cards, study modes, progress) are built on top of this shell.

## Commands

```bash
npm run start        # Dev server (webpack-dev-server)
npm run build        # Production build
npm run lint:fix     # ESLint autofix
npm run lint:scss:fix # SCSS lint autofix
npm run typecheck    # TypeScript type checking
```

## Project Rules

- **FSD architecture**: app > pages > widgets > features > entities > shared. Import ONLY downward, `@/` prefix for cross-layer imports.
- **TypeScript**: strict typing, NO `any`, interfaces for all props, enums for constants, no `@ts-ignore` without comment.
- **i18n**: all user-facing text via `useTranslation` from `react-i18next`. Languages: ru (primary), en.
- **Styling**: CSS Modules only (`.module.scss`), no inline styles, no magic numbers. Use global vars and Ant Design theme tokens.
- **Components**: prefer Ant Design → @/shared/ui → custom styles → new component (last resort).
- **State**: `buildSlice` from `@/shared/lib/store` (auto useActions). RTK Query via a single API: `rtkApi` (`__API__` — users, settings, notifications, future decks/cards). `authenticatedFetch` (`@/shared/api`) for non-RTK endpoints (Mutex-protected 401 refresh).
- **Performance**: `React.lazy` for pages, `memo`/`useMemo`/`useCallback`, tree-shaking imports, `react-virtuoso` for large lists.
- **Barrel exports**: named only, no `default`, no `export *`.

---

## Behavioral Guidelines

Guidelines to reduce common LLM coding mistakes. Bias toward caution over speed; for trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
