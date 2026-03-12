# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de geração de reports — a school report generation system for an English language school (EIC). Teachers create student competency reports, coordinators review them, and parents confirm receipt. The UI is in Portuguese (Brazilian).

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build (output to `dist/`)
- No test runner or linter is configured

## Tech Stack

- **Framework:** React 18 + TypeScript, Vite 6, React Router v6
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin), with shadcn/ui components (Radix UI primitives)
- **Backend:** Firebase (Auth + Firestore) — config in `src/app/firebase.ts`, service layer in `src/app/firebaseService.ts`
- **AI Integration:** Anthropic Claude API proxied through Vite dev server (`/anthropic` → `api.anthropic.com`), API key read from `.env.local` (`VITE_ANTHROPIC_API_KEY`)
- **Hosting:** Firebase Hosting (SPA rewrite config in `firebase.json`)

## Architecture

- `src/main.tsx` — entry point, renders `App`
- `src/app/App.tsx` — wraps `RouterProvider`
- `src/app/routes.ts` — all routes defined via `createBrowserRouter`
- `src/app/types.ts` — shared TypeScript types (`Report`, `Student`, `User`, `Competency`, CEFR levels, statuses)
- `src/app/firebaseService.ts` — all Firestore/Auth operations (CRUD for students, reports, users)
- `src/app/data/mockData.ts` — competency text templates (whyItMatters/whatToDo) per rating level, used in report generation
- `src/app/pages/` — page components, one per route
- `src/app/components/ui/` — shadcn/ui component library (do not edit manually; regenerate via shadcn CLI if needed)
- `src/app/components/` — custom shared components (Header, Logo, RatingStars, StatusBadge, Stepper)

## Key Concepts

- **Three user roles:** professor (teacher), coordinator, secretaria (admin/secretary) — each with dedicated dashboard and routes
- **Report lifecycle:** not-started → in-progress → completed → sent → confirmed → meeting-scheduled
- **Competencies** are rated 1-5 with three text fields each: whatISee, whyItMatters, whatToDo
- **CEFR levels** (A1 through C2) are used for student language proficiency
- **Path alias:** `@` maps to `./src` (configured in `vite.config.ts`)

## Route Structure

- `/` — Login
- `/professor` — Teacher dashboard
- `/coordinator` — Coordinator dashboard
- `/report/create/:studentId?/:reportId?` — Create/edit report
- `/report/view/:reportId` — View report
- `/confirm/:reportId` — Parent confirmation page
- `/secretaria` — Secretary dashboard
- `/secretaria/professores|alunos|horarios|ciclos|reunioes` — Admin management pages
