# Implementation Plan: AiQi (AI起)

## Overview
AiQi is a bilingual tutorial app that teaches Claude Code to Chinese international graduates with no coding background. It takes them from zero to shipping a real prototype in 2 weeks through 14 interactive lessons with a terminal simulator, progress tracking, and celebration moments. Freemium model: lessons 1-5 free, full access via one-time purchase.

---

## Problem Statement
Chinese international graduates entering the job market lack coding skills but understand AI matters for their career. Existing Claude Code resources (even Chinese ones) assume coding experience and terminal familiarity. There is no beginner-friendly, bilingual path from "never opened a terminal" to "shipped a real prototype" — AiQi fills that gap.

## Value Proposition
1. **Bilingual by design** — not a translation, but native Chinese explanations with English technical terms taught as vocabulary
2. **Zero-to-ship in 2 weeks** — concrete, achievable timeline with daily lessons
3. **Safe practice environment** — terminal simulator lets students experiment without fear
4. **Portfolio outcome** — students finish with a deployed project they can show employers
5. **Career-focused framing** — every lesson connects back to "why this matters for your job search"

## Top 5 Features (ranked by impact)
1. **Interactive terminal simulator** — practice Claude Code commands safely, see realistic output, build muscle memory
2. **Bilingual content with instant toggle** — read in Chinese, see code in English, switch anytime without losing place
3. **Step-by-step lesson engine** — one action per screen, progressive disclosure, no walls of text
4. **Progress dashboard with celebrations** — streaks, completion %, milestone badges, confetti on achievements
5. **Copy-paste code blocks** — one-tap copy for every command and code snippet, reduces typing friction

## Content Outline

### Week 1: "I Can Do This" — Zero to First Ship
| # | Lesson | Key Outcome |
|---|--------|-------------|
| 1 | Why AI Coding Matters for YOUR Career | Motivation + mental model. Student can explain what Claude Code is to a friend |
| 2 | Meet the Terminal — It's Just a Chat Box | Terminal basics (cd, ls, pwd). Fear removed. Student navigates folders |
| 3 | Installing Claude Code | Step-by-step setup. Student has Claude Code running |
| 4 | Your First Conversation with Claude | Ask Claude to build a webpage. Student sees code appear |
| 5 | Understanding What Claude Made | Read HTML basics. Student can identify what each part does |
| 6 | Editing with Words: Tell Claude What to Change | Prompting patterns. Student modifies their page by describing changes |
| 7 | Ship It! Put Your Page on the Internet | Deploy to Cloudflare Pages. Student has a live URL to share |

### Week 2: "I Build Things" — From Prototype to Portfolio
| # | Lesson | Key Outcome |
|---|--------|-------------|
| 8 | Thinking Like a Builder: What Should I Make? | Ideation framework. Student has a project idea |
| 9 | Planning with CLAUDE.md | Project setup, CLAUDE.md, structured prompting. Student creates project scaffolding |
| 10 | Building Your App: Structure | Claude builds the skeleton. Student understands files/folders |
| 11 | Building Your App: Making It Interactive | Add JS/TS behavior. Student's app responds to user input |
| 12 | Styling: Making It Look Professional | CSS, layout, responsive design via Claude. App looks polished |
| 13 | When Things Go Wrong: Debugging with Claude | Error reading, debugging prompts. Student fixes a real bug |
| 14 | Launch Day: Ship Your Portfolio Piece | Final deploy + polish. Student has a live app they're proud of |

## UX Principles
- **One action per screen** — never show two things to do at once
- **Show, don't explain** — animations and visuals before text
- **Safe to fail** — terminal simulator has no consequences, error messages encourage retry
- **Warm tone** — "Nice! You just ran your first command" not "Command executed successfully"
- **Always forward** — every screen shows what's next, never a dead end
- **Phone-first** — designed for one-handed use, thumb-reachable actions
- **Language toggle is core** — always visible, preserves scroll position, instant switch

## Success Metrics
- Lesson 1 completion rate > 80% (no drop-off from confusion)
- Day-2 return rate > 50% (students come back voluntarily)
- Week 1 completion rate > 40% (students finish 7 lessons)
- Week 2 capstone ship rate > 25% (students deploy a real project)
- Average lesson completion time < 20 minutes

## MVP Scope
**In MVP:**
- All 14 lessons with bilingual content
- Terminal simulator (pre-scripted command/response pairs)
- Bilingual toggle (EN/ZH)
- Copy-paste code blocks
- Google sign-in for progress tracking
- Progress dashboard (completion %, current lesson, streaks)
- Milestone celebrations (CSS animations + encouraging messages)
- Checkpoint quizzes (2-3 questions per lesson)
- Freemium gate UI after lesson 5
- Mobile-responsive design

**NOT in MVP (post-launch):**
- Stripe payment integration (MVP shows "Coming soon" or contact to purchase)
- Community features (comments, forum)
- Video content within lessons
- Advanced analytics / admin dashboard
- Push notifications
- Offline mode / PWA

## Open Questions
- None blocking MVP. Payment integration deferred to post-MVP.

---

## Implementation Steps

### Phase 1: Project Scaffolding
1. Initialize project: `package.json`, `tsconfig.json`, `wrangler.toml`, esbuild build script
2. Create `src/index.html` — SPA shell with viewport meta, Google Fonts (Noto Sans SC + Inter), favicon placeholder, single `<div id="app">`, script/style tags
3. Create `src/css/style.css` — CSS reset, CSS custom properties (colors, spacing, typography scale), mobile-first base styles, dark/light theme variables
4. Create `src/ts/app.ts` — hash-based SPA router with routes: home, lesson, dashboard, settings. Mount/unmount pattern for views.

### Phase 2: Bilingual System
5. Create `src/ts/i18n.ts` — language toggle state (stored in localStorage), `t()` function that returns EN or ZH string, UI chrome translations (buttons, nav, labels)
6. Create content file structure: `src/content/en/lesson-01.json` and `src/content/zh/lesson-01.json` as templates with step schema: `{ steps: [{ type, title, body, terminal?, quiz?, codeBlock? }] }`
7. Add language toggle button to SPA shell — flag icon or EN/中文 text toggle, always visible in header, persists choice to localStorage

### Phase 3: Lesson Engine
8. Create `src/ts/lessons.ts` — lesson renderer that reads JSON content, displays one step at a time, handles step types (text, terminal-exercise, quiz, copy-block), shows "Next" button only after step interaction is complete
9. Create lesson navigation — previous/next step, lesson progress bar at top, step counter ("Step 3 of 8"), auto-scroll to top on step change
10. Create copy-paste code blocks — styled `<pre><code>` with one-tap copy button, visual confirmation ("Copied!" / "已复制!"), syntax-highlighted appearance via CSS

### Phase 4: Terminal Simulator
11. Create `src/ts/terminal.ts` — terminal UI component: black background, monospace font, blinking cursor, input field styled as terminal prompt (`$`), scrolling output area
12. Add command matching engine — each lesson exercise defines expected commands and their simulated outputs. Fuzzy matching (trim whitespace, ignore case for non-case-sensitive parts). On match: show output + success indicator. On mismatch: show encouraging hint ("Almost! Try: ..." / "差一点！试试：...")
13. Add typing animation for terminal output — simulated responses appear character-by-character (30ms/char) for realism, with option to skip

### Phase 5: Quiz System
14. Create `src/ts/quiz.ts` — multiple-choice quiz component (2-3 questions per lesson checkpoint). Show question + 4 options in current language. On correct: celebration + explanation. On incorrect: gentle hint + try again (no penalty, no counter).
15. Style quiz cards — large tap targets (min 48px), clear selected state, animated feedback (green glow for correct, gentle shake + hint for incorrect)

### Phase 6: Authentication
16. Set up Google Identity Services — add Google client library to index.html, create `src/ts/auth.ts` with sign-in/sign-out flow, store JWT token, display user avatar + name in header when signed in
17. Create Cloudflare Pages Function `functions/api/auth.ts` — verify Google ID token server-side, create/find user in D1, return session token
18. Set up Cloudflare D1 database — create `users` table (id, google_id, email, name, created_at) and `progress` table (user_id, lesson_id, completed_at, exercise_passed)
19. Create `wrangler.toml` D1 binding and seed migration SQL file

### Phase 7: Progress Tracking
20. Create Cloudflare Pages Function `functions/api/progress.ts` — GET endpoint returns all progress for user, POST endpoint marks lesson complete (with timestamp)
21. Create `src/ts/progress.ts` — client-side progress manager: sync with API when signed in, fallback to localStorage when not signed in, expose methods: `markComplete(lessonId)`, `getProgress()`, `getStreak()`
22. Create progress dashboard view — visual lesson map (14 circles in 2 rows of 7, filled when complete), completion percentage, current streak counter, "Continue" button pointing to next incomplete lesson

### Phase 8: Celebrations & Gamification
23. Add celebration moments — CSS confetti animation on lesson completion, milestone badges (First Lesson, Week 1 Done, First Ship, All Complete), encouraging messages in both languages that rotate randomly
24. Add streak tracking — calculate consecutive days with at least one lesson completed, show flame icon + count on dashboard, gentle "Welcome back!" if streak is broken (no shame)

### Phase 9: Freemium Gate
25. Create `src/ts/paywall.ts` — after lesson 5, show upgrade prompt: "You've completed the free lessons! Unlock all 14 lessons + your capstone project" with preview of what's next. For MVP, show a "Coming Soon" state or contact email. Never block progress tracking or language toggle.

### Phase 10: Content — Week 1 Lessons
26. Write lesson 1 content (EN + ZH): "Why AI Coding Matters for YOUR Career" — 6-8 steps covering: what is AI-assisted coding, why employers care, what you'll build in this course, real examples of non-coders shipping with Claude Code. No terminal exercise — just reading + 1 quiz.
27. Write lesson 2 content (EN + ZH): "Meet the Terminal" — 8-10 steps: what is a terminal, it's just a text chat with your computer, practice `pwd`, `ls`, `cd` in simulator. Terminal exercise: navigate to a folder.
28. Write lesson 3 content (EN + ZH): "Installing Claude Code" — 6-8 steps: prerequisites check, install command, first run, authentication. Terminal exercise: simulate `claude --version`.
29. Write lesson 4 content (EN + ZH): "Your First Conversation with Claude" — 8-10 steps: start Claude, ask it to build a webpage, watch it work, see the result. Terminal exercise: simulate `claude "create a simple webpage about me"`.
30. Write lesson 5 content (EN + ZH): "Understanding What Claude Made" — 8-10 steps: what is HTML, head/body, tags, reading code like reading a recipe. Quiz: identify HTML elements.

### Phase 11: Content — Week 1 Continued (Paid)
31. Write lesson 6 content (EN + ZH): "Editing with Words" — prompting patterns, making changes by describing them. Terminal exercise: simulate editing commands.
32. Write lesson 7 content (EN + ZH): "Ship It!" — deploy to Cloudflare Pages, get a live URL. Terminal exercise: simulate deploy flow.

### Phase 12: Content — Week 2 Lessons
33. Write lesson 8 content (EN + ZH): "Thinking Like a Builder" — ideation, picking a project, scoping. Quiz: evaluate project ideas.
34. Write lesson 9 content (EN + ZH): "Planning with CLAUDE.md" — project structure, CLAUDE.md, kickoff. Terminal exercise: simulate creating CLAUDE.md.
35. Write lesson 10 content (EN + ZH): "Building: Structure" — files, folders, HTML skeleton. Terminal exercise: simulate building app structure.
36. Write lesson 11 content (EN + ZH): "Building: Interactivity" — JavaScript basics through Claude, event handling. Terminal exercise: simulate adding interactivity.
37. Write lesson 12 content (EN + ZH): "Styling" — CSS through Claude, responsive design, making it look good. Terminal exercise: simulate styling commands.
38. Write lesson 13 content (EN + ZH): "Debugging" — reading errors, fixing bugs with Claude. Terminal exercise: simulate debugging flow.
39. Write lesson 14 content (EN + ZH): "Launch Day" — final polish, deploy, share. Terminal exercise: simulate final deploy.

### Phase 13: Polish & Mobile
40. Mobile responsiveness pass — test all views at 375px, fix any overflow/scroll issues, ensure tap targets are 48px+, verify language toggle is thumb-reachable
41. Loading states and empty states — skeleton screens while content loads, warm empty states ("No progress yet — start your first lesson!" / "还没有进度——开始第一课吧！")
42. Error handling — friendly error messages for network failures, auth issues, missing content. Never show raw error text.

### Phase 14: Landing Page
43. Create home/landing view — hero section with app name, tagline ("From zero to shipping — in your language" / "从零到上线——用你的语言"), CTA button "Start Lesson 1", preview of what you'll learn, social proof placeholder
44. Add smooth transitions between views — fade or slide animations (CSS transitions, 200ms), no jarring page jumps

### Phase 15: Testing & Verification
45. Verify: app loads on mobile Safari and Chrome — no console errors, no layout breaks
46. Verify: complete lesson 1 flow end-to-end — can a total beginner finish it without confusion?
47. Verify: language toggle works on every screen without losing position
48. Verify: terminal simulator accepts commands and shows appropriate responses
49. Verify: progress saves and persists across page reload (localStorage) and re-login (D1)
50. Verify: freemium gate appears after lesson 5, does not block core features

## Files to Create/Modify
- `package.json` — project metadata, esbuild build script, dev script
- `tsconfig.json` — TypeScript config (ES2020, DOM types)
- `wrangler.toml` — Cloudflare Pages config, D1 binding
- `src/index.html` — SPA shell
- `src/css/style.css` — all styles
- `src/ts/app.ts` — router + main logic
- `src/ts/i18n.ts` — bilingual system
- `src/ts/terminal.ts` — terminal simulator
- `src/ts/lessons.ts` — lesson engine
- `src/ts/quiz.ts` — quiz component
- `src/ts/auth.ts` — Google sign-in
- `src/ts/progress.ts` — progress tracking
- `src/ts/paywall.ts` — freemium gate
- `functions/api/auth.ts` — auth API endpoint
- `functions/api/progress.ts` — progress API endpoint
- `migrations/0001_init.sql` — D1 schema
- `src/content/en/lesson-01.json` through `lesson-14.json` — English content
- `src/content/zh/lesson-01.json` through `lesson-14.json` — Chinese content
