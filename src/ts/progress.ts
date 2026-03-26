import { t, getLang } from './i18n';
import { getToken } from './auth';
import { getLessonTitle } from './app';

interface ProgressEntry {
  lessonId: number;
  completedAt: string;
  exercisePassed: boolean;
}

const STORAGE_KEY = 'aiqi-progress';
const STREAK_KEY = 'aiqi-streak-dates';
const MS_PER_DAY = 86400000;

let cachedProgress: ProgressEntry[] | null = null;

function getLocalProgress(): ProgressEntry[] {
  if (cachedProgress) return cachedProgress;
  try {
    cachedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return cachedProgress!;
  } catch {
    return [];
  }
}

function saveLocalProgress(entries: ProgressEntry[]): void {
  cachedProgress = entries;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function markComplete(lessonId: number, exercisePassed: boolean = true): Promise<void> {
  const entry: ProgressEntry = {
    lessonId,
    completedAt: new Date().toISOString(),
    exercisePassed,
  };

  // Update local
  const local = getLocalProgress();
  const existing = local.findIndex(p => p.lessonId === lessonId);
  if (existing >= 0) {
    local[existing] = entry;
  } else {
    local.push(entry);
  }
  saveLocalProgress(local);

  // Track streak
  const today = new Date().toISOString().split('T')[0];
  const streakDates: string[] = JSON.parse(localStorage.getItem(STREAK_KEY) || '[]');
  if (!streakDates.includes(today)) {
    streakDates.push(today);
    localStorage.setItem(STREAK_KEY, JSON.stringify(streakDates));
  }

  // Sync to server if signed in
  const token = getToken();
  if (token) {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId, exercisePassed }),
      });
    } catch {
      // Server sync failed — local progress still saved
    }
  }
}

export function getProgress(): ProgressEntry[] {
  return getLocalProgress();
}

export function getCompletedCount(): number {
  return getLocalProgress().length;
}

export function getStreak(): number {
  const streakDates: string[] = JSON.parse(localStorage.getItem(STREAK_KEY) || '[]');
  if (streakDates.length === 0) return 0;

  // Sort dates descending
  const sorted = streakDates.sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - MS_PER_DAY).toISOString().split('T')[0];

  // Streak must include today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i]).getTime();
    const prev = new Date(sorted[i + 1]).getTime();
    if (curr - prev === MS_PER_DAY) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getNextLesson(): number {
  const completed = new Set(getLocalProgress().map(p => p.lessonId));
  for (let i = 1; i <= 14; i++) {
    if (!completed.has(i)) return i;
  }
  return 14; // All done
}

// Expose globally for app.ts
window.__getProgress = getProgress;

export function renderDashboard(): string {
  const lang = getLang();
  const progress = getLocalProgress();
  const completed = new Set(progress.map(p => p.lessonId));
  const streak = getStreak();
  const percentage = Math.round((completed.size / 14) * 100);
  const nextLesson = getNextLesson();

  if (progress.length === 0) {
    return `
      <div class="main-content view-enter">
        <div class="empty-state">
          <div class="empty-state__icon">📚</div>
          <div class="empty-state__text">${t('dashboard.empty')}</div>
          <br/>
          <button class="btn btn--primary" onclick="window.__navigate('lesson', {lessonId: 1})">
            ${t('btn.start')}
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="main-content view-enter">
      <div class="dashboard">
        <h2 class="dashboard__greeting">${t('dashboard.greeting')}</h2>

        ${streak > 0 ? `
          <div class="streak">
            <span class="streak__icon">🔥</span>
            <span class="streak__count">${streak}</span>
            <span class="streak__label">${t('dashboard.streak')}</span>
          </div>
        ` : ''}

        <div class="dashboard__stats">
          <div class="stat-card stat-card--lessons">
            <div class="stat-card__value">${completed.size}/14</div>
            <div class="stat-card__label">${t('dashboard.completed')}</div>
          </div>
          <div class="stat-card stat-card--progress">
            <div class="stat-card__value">${percentage}%</div>
            <div class="stat-card__label">${t('dashboard.percentage')}</div>
          </div>
          <div class="stat-card stat-card--streak">
            <div class="stat-card__value">${streak}</div>
            <div class="stat-card__label">${t('dashboard.streak')}</div>
          </div>
        </div>

        <div class="lesson-map">
          ${Array.from({ length: 14 }, (_, i) => {
            const num = i + 1;
            const isComplete = completed.has(num);
            const isCurrent = num === nextLesson;
            let cls = 'lesson-dot';
            if (isComplete) cls += ' lesson-dot--complete';
            else if (isCurrent) cls += ' lesson-dot--current';
            return `<div class="${cls}" role="button" tabindex="0" onclick="window.__navigate('lesson', {lessonId: ${num}})" onkeydown="if(event.key==='Enter')this.click()">${num}</div>`;
          }).join('')}
        </div>

        ${nextLesson <= 14 ? `
          <button class="continue-btn" onclick="window.__navigate('lesson', {lessonId: ${nextLesson}})">
            ${t('btn.continue')} — ${getLessonTitle(nextLesson)}
          </button>
        ` : `
          <div style="text-align:center; padding: var(--space-lg);">
            <div style="font-size: 48px; margin-bottom: var(--space-md);">🎉</div>
            <div style="font-size: var(--text-xl); font-weight: 700;">${t('celebration.allDone')}</div>
          </div>
        `}
      </div>
    </div>
  `;
}
