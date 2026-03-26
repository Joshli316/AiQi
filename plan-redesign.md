# Implementation Plan: AiQi UI/UX Redesign

## Overview
Redesign AiQi from a generic, flat-looking AI-generated app into a polished, Codecademy-inspired EdTech experience. The audience is non-technical Chinese graduates (22-30) learning to code — the UI must feel warm, encouraging, and modern, not intimidating. This is a visual + layout redesign; core logic (routing, progress, terminal engine, i18n) stays untouched.

## Design Direction
**Inspiration:** Codecademy — deep navy backgrounds, bold accent colors, generous whitespace, confident typography, clear visual hierarchy.

**Key shifts from current design:**
- Soft purple/gray → deep navy + vibrant yellow/teal accents (high contrast, energetic)
- Flat white cards → layered surfaces with depth (dark cards, subtle gradients, colored borders)
- Generic rounded everything → intentional border-radius (4px buttons, 8-12px cards, sharp where appropriate)
- Timid spacing → generous, confident whitespace
- Bland Inter 400/500 → bolder weight hierarchy (700 headings, 400 body, mono for code stands out more)
- No personality → micro-interactions, hover states, and visual rhythm that feel alive

**Design system already generated** via `/ui-ux-pro-max` and persisted to `design-system/aiqi/MASTER.md`. Typography was manually refined (Baloo 2/Comic Neue too childish → Plus Jakarta Sans for young adults).

## Steps

### 1. Overhaul CSS custom properties (`:root`)
- Replace the entire `:root` block with the new design tokens from step 1
- Update both light theme and dark theme variables
- Key changes: `--bg` goes deeper, `--primary` gets bolder, add `--surface-*` layers for card hierarchy
- Update `--font-sans` and `--font-mono` if the skill recommends different pairings
- Add new tokens: `--gradient-primary`, `--gradient-accent`, `--glow-*` for interactive states

### 2. Redesign the header + navigation
- **Header:** Dark/navy background, logo with more personality (gradient or accent color), language toggle with better contrast
- **Bottom nav:** More prominent active state (filled icon + colored background pill, not just color change), slightly larger touch targets, subtle backdrop blur
- Update CSS for `.header`, `.header__logo`, `.lang-toggle`, `.bottom-nav`, `.nav-item`
- Update `renderHeader()` and `renderBottomNav()` in `app.ts` if HTML structure needs changes

### 3. Redesign the landing page / hero section
- **Hero:** Bolder headline with gradient text, more confident subtitle, larger CTA button with glow/shadow on hover
- **Terminal preview:** Add a subtle glow/border effect, make it feel more immersive
- **Feature cards:** Replace flat white cards with dark-surface cards, colored left borders or icon backgrounds, more visual weight
- **Social proof / trust element:** Consider adding a "14 lessons · ~2 hours · Free to start" summary bar
- Update CSS for `.hero`, `.hero__title`, `.hero__cta`, `.feature-card`, `.hero-terminal`
- Update `renderHome()` in `app.ts` for any HTML structure changes

### 4. Redesign the lesson list view
- **Week headers:** More prominent, maybe with a decorative line or icon
- **Lesson cards:** Taller, more breathing room, progress indicator on the left (vertical bar or step connector between cards), clearer completed/current/locked states
- **Visual journey:** Connect cards vertically (progress path feel, like Codecademy's syllabus)
- Update CSS for `.lesson-list`, `.lesson-card`, `.lesson-card__number`
- Update `renderLessonList()` in `app.ts` if structure changes

### 5. Redesign the lesson view (reading + exercises)
- **Lesson header:** Cleaner back button, bolder title, progress bar with more visual impact (thicker, gradient)
- **Step content:** Better typography hierarchy — larger step titles, more spacious body text, better contrast
- **Code blocks:** Stronger visual treatment — brighter syntax colors, better copy button, glow border
- **Tip/note callouts:** If any exist, give them colored left-border treatment
- Update CSS for `.lesson-header`, `.lesson-step`, `.code-block`, `.progress-bar`

### 6. Redesign the terminal simulator
- **Titlebar:** More realistic macOS feel or modernize with a sleek dark bar
- **Body:** Slightly larger font, more line spacing, better color differentiation between commands/responses/errors
- **Input line:** More prominent cursor, subtle glow on focus, better prompt styling
- **Overall:** Add a subtle outer glow/shadow to make it pop off the page
- Update CSS for `.terminal`, `.terminal__*` classes

### 7. Redesign the quiz component
- **Options:** Bolder borders, clearer hover/selected states, more padding
- **Feedback:** More celebratory correct state (green glow), clearer incorrect state
- **Question text:** Larger, bolder
- Update CSS for `.quiz`, `.quiz__option`, `.quiz__feedback`

### 8. Redesign the progress dashboard
- **Stats cards:** Add color coding (each stat gets its own accent), bolder numbers, subtle background patterns or gradients
- **Lesson map dots:** Larger, more satisfying completed state, glow on current
- **Greeting:** Consider adding time-of-day greeting or motivational line
- Update CSS for `.dashboard`, `.stat-card`, `.lesson-dot`
- Update `renderDashboard()` in `progress.ts` if structure changes

### 9. Add micro-interactions and polish
- Button hover: lift + shadow increase (not just color change)
- Card hover: subtle border color shift + shadow
- Page transitions: smoother fade-slide
- Celebration moments: ensure confetti/celebrations still work with new color scheme
- Focus states: visible, accessible, colored outlines (not browser default)
- Loading states: skeleton shimmer if applicable
- Review `prefers-reduced-motion` support still works

### 10. Responsive polish + final QA
- Test at 375px, 390px, 428px (common phone widths)
- Verify no horizontal scroll
- Check both EN and ZH text (Chinese text is wider — verify nothing overflows)
- Verify dark terminal sections contrast properly against new page background
- Check all interactive states: hover, focus, active, disabled
- Run through lessons 1-3 end-to-end to verify nothing broke

## Files to Modify
- `src/css/style.css` — Primary file: all visual changes (1254 lines, full rewrite of tokens + component styles)
- `src/ts/app.ts` — Update `renderHome()`, `renderHeader()`, `renderBottomNav()`, `renderLessonList()` HTML templates
- `src/ts/progress.ts` — Update `renderDashboard()` HTML template if stat cards or lesson map structure changes
- `src/ts/lessons.ts` — Minor template tweaks for step content layout if needed
- `src/ts/terminal.ts` — No logic changes; CSS handles the visual redesign
- `src/ts/quiz.ts` — Minor template tweaks if quiz option structure changes
- `src/index.html` — Update Google Fonts link if font pairing changes

## Files NOT to Modify
- `src/ts/i18n.ts` — Content/translation system stays the same
- `src/ts/auth.ts` — Auth logic unchanged
- `src/ts/paywall.ts` — Payment flow unchanged
- `src/content/en/*`, `src/content/zh/*` — Lesson content unchanged
- `functions/*` — Server-side API unchanged
- `wrangler.toml`, `tsconfig.json`, `build.js` — Build/deploy config unchanged

## Open Questions
- None — ready to build
