# Product Requirements Document
## AiQi (AI起) — Learn Claude Code

**Version:** 1.0  |  **Date:** 2026-03-26  |  **URL:** https://aiqi.pages.dev/

---

## 1. Overview

AiQi is a bilingual (English/Chinese) tutorial app that teaches Claude Code to Chinese international graduates with zero coding experience. It takes learners from "never opened a terminal" to "shipped a live app" in 2 weeks through 14 interactive lessons.

**Target audience:** Chinese international graduates entering the job market who want to build with AI but have no coding background.

**Core value proposition:** 14 lessons. 2 weeks. Your first live app. No coding experience needed.

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla TypeScript SPA (no framework) |
| Bundler | esbuild |
| Styling | CSS custom properties, mobile-first |
| Fonts | Inter (UI), Noto Sans SC (Chinese), JetBrains Mono (code) |
| Hosting | Cloudflare Pages |
| API | Cloudflare Pages Functions |
| Database | Cloudflare D1 (SQLite) |
| Auth | Google Identity Services |
| Analytics | Cloudflare Web Analytics |
| Runtime deps | 0 (zero) |
| Dev deps | esbuild, typescript, wrangler |

## 3. Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | #6C5CE7 | Buttons, links, active states |
| `--primary-light` | #A29BFE | Hover states, borders |
| `--primary-dark` | #5A4BD1 | CTA gradients |
| `--accent` | #00B894 | Success, completion |
| `--accent-light` | #55EFC4 | Terminal output |
| `--warning` | #FDCB6E | Hints, paid badges |
| `--error` | #E17055 | Error states |
| `--bg` | #FAFAFA | Page background |
| `--bg-terminal` | #1E1E2E | Terminal/code blocks |

### Typography
- Sans: Inter + Noto Sans SC (400/500/600/700)
- Mono: JetBrains Mono (400/500)
- Scale: 0.75rem to 2.5rem (8 steps)

### Spacing
4px / 8px / 16px / 24px / 32px / 48px / 64px

### Border Radius
8px / 12px / 16px / 24px / 9999px (pill)

## 4. Pages & Features

| Route | View | Description |
|-------|------|-------------|
| `#/` | Home/Landing | Hero with animated terminal mockup, feature cards, CTA |
| `#/lessons` | Lesson List | 14 lessons in 2 weeks, with completion badges |
| `#/lesson/:id` | Lesson View | Step-by-step content with progress bar |
| `#/dashboard` | Progress Dashboard | Stats, streak, lesson map, continue button |

### Interactive Components
- **Terminal Simulator** — Black terminal UI with command input, typed output animation, fuzzy matching
- **Quiz Engine** — Multiple-choice with animated correct/incorrect feedback, retry without penalty
- **Copy-Paste Code Blocks** — One-tap copy with "Copied!" confirmation
- **Confetti Celebration** — CSS confetti + milestone modal on lesson completion

### Bilingual System
- Instant EN/ZH toggle via header button
- `t()` function for UI strings (93 translation keys)
- Per-language lesson content JSON (28 files)
- Preserves scroll position on language switch

## 5. Component Architecture

```
app.ts          — Hash router, header, bottom nav, home/lesson list rendering
i18n.ts         — Language state, t() function, 93 translation keys
lessons.ts      — Lesson loader, step renderer, code blocks, navigation
terminal.ts     — Terminal UI, command matching, typing animation
quiz.ts         — Multiple-choice renderer, feedback, retry logic
auth.ts         — Google sign-in/out, localStorage persistence
progress.ts     — LocalStorage + API sync, streaks, dashboard rendering
celebrations.ts — Confetti particles, milestone modals
paywall.ts      — Freemium gate (currently disabled for testing)
```

### Server-Side
```
functions/api/_shared.ts   — Google JWT verification, shared types, helpers
functions/api/auth.ts      — POST: verify Google token, upsert user
functions/api/progress.ts  — GET/POST: read/write lesson completion
```

## 6. Screenshots

![Desktop](./brief-desktop.png)

![Mobile](./brief-mobile.png)

![Lessons Page](./brief-interior.png)

## 7. Accessibility

| Feature | Implementation |
|---------|---------------|
| Language | `<html lang="zh">`, dynamically updated |
| ARIA labels | Navigation, back button, terminal input, language toggle |
| ARIA roles | `role="progressbar"` on lesson progress, `role="status" aria-live="polite"` on quiz feedback |
| Navigation | `aria-current="page"` on active nav item, `aria-label="Main navigation"` |
| Keyboard | `:focus-visible` styles with 2px primary outline |
| Motion | `prefers-reduced-motion: reduce` disables all animations |
| Tap targets | Minimum 44px on all interactive elements (buttons use 48px) |

## 8. Security

| Measure | Implementation |
|---------|---------------|
| JWT verification | Google tokeninfo endpoint verification on every API request |
| Audience check | Validates `aud` claim matches app's Google client ID |
| SQL injection | Parameterized D1 queries throughout |
| Input validation | lessonId validated as number 1-14 on server |
| XSS | innerHTML used only with author-controlled content (static JSON) |
| Secrets | `.env`, `.env.*`, `.dev.vars` in .gitignore |
| CORS | Same-origin (Cloudflare Pages serves both static + functions) |

## 9. SEO

| Tag | Value |
|-----|-------|
| Title | AiQi (AI起) — Learn Claude Code |
| Description | Learn Claude Code with bilingual lessons. Zero coding experience needed — from terminal basics to shipping a live app in 2 weeks. |
| Canonical | https://aiqi.pages.dev/ |
| OG Title | AiQi — Learn Claude Code in Your Language |
| OG Description | Bilingual tutorial app: from zero coding to shipping real projects with AI. 14 interactive lessons in English and Chinese. |
| OG Type | website |
| Twitter Card | summary |
| Robots.txt | Allow all, sitemap reference |
| Favicon | SVG rocket emoji |

## 10. Deployment

```bash
# Build
npm run build          # esbuild → dist/

# Deploy
wrangler pages deploy dist/ --project-name=aiqi

# Type check
npx tsc --noEmit
```

**Platform:** Cloudflare Pages
**Database:** Cloudflare D1 (aiqi-db)
**Analytics:** Cloudflare Web Analytics
**Repository:** https://github.com/Joshli316/AiQi

## 11. Open Items

| Item | Priority | Status |
|------|----------|--------|
| Replace placeholder Google client ID | High | Blocked until Google OAuth credentials created |
| Payment integration (Stripe) | Medium | Deferred post-testing. Paywall code exists but is disabled |
| Unit tests for pure functions | Medium | getStreak(), parseHash(), getNextLesson() |
| GitHub Actions CI/CD | Low | Currently manual deploy via wrangler |
| Custom domain | Low | Using aiqi.pages.dev for now |

---

*Generated 2026-03-26. Source: https://github.com/Joshli316/AiQi*
