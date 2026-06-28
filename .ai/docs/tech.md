# Technical Specification

## Project Overview

This project is a private, mobile-first web application for tracking gym progress and diet. It is intended for personal use only, not for public users, teams, or commercial deployment.

The application should work well on a mobile phone first, because most workout data will be entered during gym sessions. Desktop usage is secondary and mainly intended for reviewing history, editing plans, and looking at larger summaries.

The application will be built as a responsive web app / PWA rather than a native mobile application.

## Core Product Areas

The application is divided into separate product domains:

* `workouts` — workout logging, exercises, sets, weights, reps, progression tracking.
* `nutrition` — diet tracking, meals, products, calories, macronutrients.
* `dashboard` — shared overview of recent activity, progress, and daily/weekly summaries.
* `settings` — personal configuration, units, goals, and local application settings.

The first MVP focuses on the `workouts` module. Nutrition and dashboard functionality will be specified later in separate documents.

Planned documentation files:

* `tech.md` — technical stack, architecture, conventions, and implementation constraints.
* `workout.md` — workout module functionality and data model.
* `diet.md` — nutrition module functionality and data model.
* `dashboard.md` — dashboard functionality and data aggregation.
* `schema.md` — database schema once the domain models are finalized.
* `AGENTS.md` / `CLAUDE.md` — coding-agent instructions and repository conventions.

## Technical Priorities

The stack should be optimized for AI coding agents such as Codex, Claude Code, and Cursor.

This means the project should prefer:

* Popular technologies with strong model familiarity.
* Predictable file structure.
* Explicit types.
* Minimal framework magic.
* Clear domain boundaries.
* Small, composable files.
* Validation schemas close to the data they validate.
* Repository-level instructions for agents.
* Scripts for typechecking, linting, testing, and formatting.
* Documentation of architectural decisions.

The goal is not to use the most minimal possible stack. The goal is to use a stack that agents can navigate, modify, test, and extend reliably.

## Chosen Stack

### Frontend Framework

Use:

* Next.js
* React
* TypeScript

The app should use Next.js primarily as a structured React application. The project does not initially require complex server-side rendering or a custom backend, but Next.js leaves room for future API routes or server-side logic if needed.

The application should be mobile-first and responsive.

### Styling and UI

Use:

* Tailwind CSS
* shadcn/ui

Tailwind CSS provides simple, local styling. shadcn/ui provides accessible, copyable components that are easy for agents to inspect and modify because the component code lives directly in the repository.

The UI should prioritize speed of data entry over visual complexity.

### Forms and Validation

Use:

* React Hook Form
* Zod

React Hook Form should be used for user-facing forms. Zod should be used for validation schemas and type inference where appropriate.

Validation should exist at the application layer even if the database also has constraints.

### Data Fetching and Client State

Use:

* TanStack Query

TanStack Query should manage remote data fetching, caching, mutation state, and invalidation.

Local UI state should stay in React state or small local hooks. Avoid global state unless a specific need emerges.

### Database

Use:

* Supabase
* PostgreSQL

Supabase is used primarily as a hosted PostgreSQL database with a convenient web dashboard and JavaScript client.

The app will initially connect to Supabase directly from the frontend.

### Authentication and Access Control

The application is for personal use only.

There will be no full user authentication system in the MVP.

Instead, the app will use a simple client-side password gate:

* User opens the app.
* User enters an application password.
* If the password is correct, the app stores an unlocked state locally.
* The unlocked state should persist for approximately 14 days.
* Without the unlocked state, the UI is blocked.

Important security note:

This is not real security against a technical attacker. Supabase frontend keys and network calls can be inspected from the browser. The user accepts this trade-off because the app is private, low-risk, and not intended to protect sensitive data from a determined attacker.

The architecture should not pretend that this password gate secures the database. It only prevents casual access to the UI.

If stronger security is needed later, Supabase Auth and Row Level Security can be added.

### Offline Behavior

The app does not need full offline support in the MVP.

However, an active workout should be resilient against accidental page refreshes or brief connectivity issues.

Recommended approach:

* Store active workout draft data locally in the browser.
* Persist the draft during editing.
* Save the final workout to Supabase when the user finishes or explicitly saves.
* Avoid complex offline synchronization in the MVP.

Local draft storage can use `localStorage` or IndexedDB. Prefer the simplest reliable option first.

### Hosting

The app should be deployable as a static or mostly-static web application.

Good hosting options:

* Vercel
* Netlify
* Cloudflare Pages

The exact hosting provider is not a core architectural decision yet.

## Repository Structure

Recommended structure:

```txt
src/
  app/
    layout.tsx
    page.tsx
    workouts/
    nutrition/
    dashboard/
    settings/

  features/
    workouts/
      components/
      hooks/
      queries/
      schemas/
      types/
      utils/

    nutrition/
      components/
      hooks/
      queries/
      schemas/
      types/
      utils/

    dashboard/
      components/
      hooks/
      queries/
      schemas/
      types/
      utils/

    settings/
      components/
      hooks/
      schemas/
      types/
      utils/

  shared/
    components/
    hooks/
    lib/
    types/
    utils/

  supabase/
    client.ts
    types.ts
```

Domain-specific code should live inside `features/<domain>`.

Shared code should only be placed in `shared/` when at least two domains actually use it.

Avoid creating generic abstractions too early.

## Agent-Friendly Repository Files

The repository should include documentation and instruction files for AI agents.

Recommended files:

```txt
AGENTS.md
CLAUDE.md
.cursor/rules/project.mdc
docs/tech.md
docs/workout.md
docs/diet.md
docs/dashboard.md
docs/schema.md
```

### AGENTS.md / CLAUDE.md

These files should describe:

* The purpose of the app.
* The chosen stack.
* The folder structure.
* How to run the app.
* How to typecheck, lint, test, and format.
* Coding conventions.
* What not to change without explicit instruction.
* How database changes should be documented.

### Cursor Rules

Cursor rules should reinforce:

* Use TypeScript strictly.
* Keep domain code inside the correct feature folder.
* Do not introduce new dependencies without justification.
* Prefer small components and hooks.
* Update docs when making product or schema changes.
* Run validation commands before considering work complete.

## Development Commands

Recommended scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "vitest",
    "test:watch": "vitest --watch"
  }
}
```

Testing can be light in the MVP, but the repository should still include test infrastructure so agents have a way to verify utility functions, schema logic, and calculations.

## Coding Conventions

Use TypeScript throughout the project.

Prefer:

* Explicit types at domain boundaries.
* Zod schemas for form and input validation.
* Small, readable functions.
* Small React components.
* Feature-local code organization.
* Clear names over clever abstractions.
* Simple database queries wrapped in feature-specific query files.
* Minimal global state.

Avoid:

* Premature generic abstractions.
* Large multi-purpose components.
* Business logic hidden inside JSX.
* Complex state management libraries unless necessary.
* Backend code unless a real need appears.
* Full offline synchronization in the MVP.
* Treating the password gate as real database security.

## Database Approach

The initial database will be designed around the workout module first.

Supabase should be used for:

* Tables.
* Relations.
* Basic constraints.
* Manual inspection through Supabase Studio.
* SQL migrations or documented SQL setup scripts.

The database schema should be documented in `docs/schema.md`.

Generated Supabase types should be stored in:

```txt
src/supabase/types.ts
```

The application should not scatter raw table names and query logic across random components. Database operations should be wrapped in domain-specific query modules, for example:

```txt
features/workouts/queries/workouts.ts
features/workouts/queries/exercises.ts
```

## PWA Scope

The app should eventually behave like an installable mobile web app.

PWA support can be added after the initial MVP works.

Potential future additions:

* App manifest.
* Mobile home-screen icon.
* Basic service worker.
* Local caching for static assets.
* Better handling of active workout drafts.

PWA functionality is not required before the workout module is usable.

## Current Decisions

Accepted decisions:

* The app is mobile-first.
* Desktop support is secondary but should still be usable.
* The app is a responsive web app / PWA, not a native mobile app.
* The app uses Supabase as the database.
* The app does not use full authentication in the MVP.
* The app uses a simple client-side password gate.
* The password gate persists access locally for about 14 days.
* The user accepts that this does not provide real database-level security.
* The app does not need full offline support.
* Active workout drafts should survive refreshes or brief connectivity issues.
* The frontend stack is Next.js + React + TypeScript.
* UI stack is Tailwind CSS + shadcn/ui.
* Forms use React Hook Form.
* Validation uses Zod.
* Data fetching uses TanStack Query.
* The project should be optimized for AI coding agents.
* Code should be organized by domain.
* MVP starts with the workout module.

## Open Technical Decisions

These should be resolved later:

* Exact Supabase table schema.
* Whether to use localStorage or IndexedDB for active workout drafts.
* Exact deployment target.
* Whether to add PWA support immediately or after the workout MVP.
* Whether to enable Supabase Auth later.
* Exact testing scope.
* Whether nutrition product data is manually entered or imported from an external source.
* Whether dashboard data is calculated client-side or via database views/functions.
