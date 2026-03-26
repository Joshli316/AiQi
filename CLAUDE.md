# AiQi (AI起)

Bilingual (EN/ZH) tutorial app teaching Claude Code to Chinese international graduates with zero coding experience — from fear of the terminal to shipping real prototypes in 2 weeks.

## Tech Stack
- HTML/TypeScript SPA on Cloudflare Pages
- Cloudflare Pages Functions for API (auth, progress tracking)
- Cloudflare D1 (SQLite) for user progress data
- Google Identity Services for sign-in
- esbuild for TypeScript compilation
- No frontend framework — vanilla TS + CSS

## Structure
```
AiQi/
├── dist/                    # Build output → deployed to CF Pages
├── src/
│   ├── index.html           # SPA shell
│   ├── css/
│   │   └── style.css        # All styles, mobile-first
│   ├── ts/
│   │   ├── app.ts           # Router, SPA logic, main entry
│   │   ├── i18n.ts          # Bilingual content system (EN/ZH toggle)
│   │   ├── terminal.ts      # Interactive terminal simulator
│   │   ├── auth.ts          # Google sign-in client
│   │   ├── progress.ts      # Progress tracking + dashboard
│   │   ├── lessons.ts       # Lesson renderer + exercise engine
│   │   └── quiz.ts          # Checkpoint quizzes
│   └── content/
│       ├── en/              # English lesson files (lesson-01.json … lesson-14.json)
│       └── zh/              # Chinese lesson files (lesson-01.json … lesson-14.json)
├── functions/               # Cloudflare Pages Functions (serverless API)
│   └── api/
│       ├── auth.ts          # Google token verification + user creation
│       └── progress.ts      # GET/POST lesson completion
├── public/                  # Static assets copied to dist/
│   └── assets/
│       ├── icons/
│       └── animations/      # Lottie/CSS celebration animations
├── package.json
├── tsconfig.json
├── wrangler.toml            # D1 binding, Pages config
└── plan.md
```

## Entry Point
`dist/index.html` (built from `src/index.html`)

## Build
```bash
npm run build    # esbuild compiles TS → dist/js/, copies HTML/CSS/assets
npm run dev      # local dev with wrangler pages dev
```

## Deployment
```bash
wrangler pages deploy dist/
```

## Conventions
- **Bilingual always**: Every user-facing string must exist in both EN and ZH in content files. UI chrome strings live in i18n.ts.
- **Mobile-first CSS**: Design for 375px width first, scale up. No horizontal scroll.
- **One action per screen**: Each lesson step shows one thing to do. No multi-action screens.
- **Content format**: Lessons are JSON files with ordered steps. Each step has: type (text, terminal-exercise, quiz, copy-block), content in both languages, and optional metadata.
- **Terminal simulator**: Client-side only. Pre-scripted command/response pairs per lesson. No real shell execution.
- **Tone**: Encouraging friend, not professor. No jargon without inline explanation. Celebrate mistakes as learning.
- **All lessons free**: Paywall removed. All 14 lessons are free, no account needed. Auth scaffolding exists but is not active.
- **Progress data model**: `{ userId, lessonId, completedAt, exercisePassed }` — nothing more.

## Design System
- **Theme**: Dark OLED (Codecademy-inspired) — deep navy `#020617`, indigo accents, green CTA
- **Design tokens**: `design-system/aiqi/MASTER.md`
- **Typography**: Plus Jakarta Sans (headings/body) + JetBrains Mono (code) + Noto Sans SC (CJK)
- **Icons**: Inline SVGs, Lucide-style, `stroke-width="2"`. No emojis as icons.
