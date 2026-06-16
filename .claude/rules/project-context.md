---
paths:
  - "src/**"
---

# English Flashcards App — Project Context

Prototype web app for learning English vocabulary through flashcards. Users create decks of cards (term ↔ translation/definition) and practice them in study modes. Product reference: [quizlet.com](https://quizlet.com).

This repository is currently a **clean boilerplate**: the previous business domain has been removed. Only infrastructure and the base entities `User`, `UserSettings`, `Notifications` remain. New language-learning features are built on top of this shell.

## Planned Core Features (target domain)

1. **Decks** — collections of flashcards owned by a user (title, description, language pair, visibility)
2. **Cards** — term ↔ translation/definition pairs, optional examples and audio
3. **Study modes** — flashcard flip, multiple-choice quiz, typing/spelling, spaced repetition
4. **Progress tracking** — per-card mastery, study stats, streaks

> These are intended directions, not yet implemented. The current code only contains the auth/profile/settings shell.

## Current Entities (implemented)

- **User** — ID, name/surname, email, phone, role, avatar, account status, accesses (RBAC helpers)
- **UserSettings** — per-user preferences (theme, etc.), synced via API
- **Notifications** — real-time user notifications over WebSocket (socket.io)

## Current Pages (implemented shell)

- **LoginPage**, **ChangePasswordPage** — auth
- **MainPage** — welcome/landing stub (future: decks dashboard)
- **ProfilePage** — current user info
- **SettingPage** — theme + language preferences
- **UserPage** — user details by id
- **ForbiddenPage**, **NotFoundPage**, **PrivacyPage** — system pages

## API Architecture

Single RTK Query API:

- **`rtkApi`** → `__API__` — main backend (users, settings, notifications, and future decks/cards endpoints)

`rtkApi` uses Mutex-protected 401 re-authentication (`authenticatedFetch`) and global error notifications. New domain endpoints are added via `rtkApi.injectEndpoints` in the relevant entity's `model/api/`.

## App Providers

- **StoreProvider** — Redux store with `rtkApi` + user slice
- **ThemeProvider** — Ant Design theme (light/dark)
- **NotificationProvider** — Ant Design notification context
- **ErrorBoundary** — error fallback UI

## Design System

- Font: Open Sans (main)
- Localization: Russian (primary) + English
- Ant Design v6 theme tokens (light/dark)

## Conventions

- Strict FSD layering, `@/` cross-layer imports
- RBAC helpers live in the `User` entity (`Accesses` enum in `@/shared/types/accesses`)
- All user-facing text via i18n
