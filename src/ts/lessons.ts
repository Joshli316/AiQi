import { t, getLang, type Lang } from './i18n';
import { getLessonTitle, navigate } from './app';
import { renderTerminal, unmountTerminal } from './terminal';
import { renderQuiz } from './quiz';
import { markComplete } from './progress';
import { triggerConfetti, showCelebration } from './celebrations';

const BACK_ARROW_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';

interface LessonStep {
  type: 'text' | 'terminal-exercise' | 'quiz' | 'copy-block';
  title: { en: string; zh: string };
  body?: { en: string; zh: string };
  codeBlock?: { code: string; label?: string };
  terminal?: {
    expectedCommands: { command: string; output: string; successMsg?: string }[];
    hints: { en: string; zh: string };
  };
  quiz?: {
    questions: {
      question: { en: string; zh: string };
      options: { en: string; zh: string }[];
      correctIndex: number;
      explanation: { en: string; zh: string };
    }[];
  };
}

interface LessonData {
  id: number;
  steps: LessonStep[];
}

let currentStep = 0;
let lessonData: LessonData | null = null;
let stepCompleted = false;
let appContainer: HTMLElement | null = null;

const lessonCache: Record<string, LessonData> = {};

async function loadLesson(lessonId: number): Promise<LessonData> {
  const lang = getLang();
  const key = `${lang}-${lessonId}`;

  if (lessonCache[key]) return lessonCache[key];

  const num = String(lessonId).padStart(2, '0');
  try {
    const res = await fetch(`/content/${lang}/lesson-${num}.json`);
    if (!res.ok) throw new Error(`Failed to load lesson ${lessonId}`);
    const data = await res.json();
    lessonCache[key] = data;
    return data;
  } catch {
    // Fallback: try other language
    const fallbackLang = lang === 'en' ? 'zh' : 'en';
    const fallbackKey = `${fallbackLang}-${lessonId}`;
    if (lessonCache[fallbackKey]) return lessonCache[fallbackKey];

    const res = await fetch(`/content/${fallbackLang}/lesson-${num}.json`);
    if (!res.ok) throw new Error(`Lesson ${lessonId} not found`);
    const data = await res.json();
    lessonCache[fallbackKey] = data;
    return data;
  }
}

export async function renderLesson(container: HTMLElement, lessonId: number): Promise<void> {
  appContainer = container;
  currentStep = 0;
  stepCompleted = false;

  // Show loading skeleton
  container.innerHTML = `
    <div class="lesson-header">
      <button class="lesson-header__back" onclick="window.__navigate('lessons')">
        ${BACK_ARROW_SVG}
      </button>
      <span class="lesson-header__title">
        <span class="skeleton skeleton-text" style="width:60%;display:inline-block;height:18px"></span>
      </span>
    </div>
    <div class="progress-bar"><div class="progress-bar__fill" style="width:0%"></div></div>
    <div class="main-content" style="padding-bottom:100px">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text" style="width:90%"></div>
      <div class="skeleton skeleton-text" style="width:75%"></div>
      <div class="skeleton skeleton-text" style="width:85%"></div>
    </div>
  `;

  try {
    lessonData = await loadLesson(lessonId);
    renderCurrentStep();
  } catch (err) {
    container.innerHTML = `
      <div class="lesson-header">
        <button class="lesson-header__back" onclick="window.__navigate('lessons')">
          ${BACK_ARROW_SVG}
        </button>
        <span class="lesson-header__title">${getLessonTitle(lessonId)}</span>
      </div>
      <div class="main-content">
        <div class="error-msg">${t('error.generic')}</div>
      </div>
    `;
  }
}

function renderCurrentStep(): void {
  if (!lessonData || !appContainer) return;

  const lang = getLang();
  const step = lessonData.steps[currentStep];
  const totalSteps = lessonData.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // For text and copy-block, step is immediately completable
  stepCompleted = step.type === 'text' || step.type === 'copy-block';

  const stepCounterText = lang === 'zh'
    ? `${t('step')} ${currentStep + 1} ${t('of')} ${totalSteps} ${t('steps')}`
    : `${t('step')} ${currentStep + 1} ${t('of')} ${totalSteps}`;

  appContainer.innerHTML = `
    <div class="lesson-header">
      <button class="lesson-header__back" onclick="window.__navigate('lessons')">
        ${BACK_ARROW_SVG}
      </button>
      <span class="lesson-header__title">${getLessonTitle(lessonData.id)}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-bar__fill" style="width:${progress}%"></div>
    </div>
    <div class="step-counter">${stepCounterText}</div>
    <div class="lesson-step">
      <h2 class="lesson-step__title">${step.title[lang]}</h2>
      ${step.body ? `<div class="lesson-step__body">${formatBody(step.body[lang])}</div>` : ''}
      <div id="step-interactive"></div>
    </div>
    ${renderNextButton()}
  `;

  // Render interactive elements
  const interactiveEl = document.getElementById('step-interactive')!;

  if (step.type === 'copy-block' && step.codeBlock) {
    interactiveEl.innerHTML = renderCodeBlock(step.codeBlock.code, step.codeBlock.label);
  }

  if (step.type === 'terminal-exercise' && step.terminal) {
    stepCompleted = false;
    updateNextButton();
    renderTerminal(interactiveEl, step.terminal, () => {
      stepCompleted = true;
      updateNextButton();
    });
  }

  if (step.type === 'quiz' && step.quiz) {
    stepCompleted = false;
    updateNextButton();
    renderQuiz(interactiveEl, step.quiz.questions, () => {
      stepCompleted = true;
      updateNextButton();
    });
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

function formatBody(html: string): string {
  // Simple markdown-like formatting
  return html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

function renderCodeBlock(code: string, label?: string): string {
  const id = 'code-' + Math.random().toString(36).slice(2);
  const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  setTimeout(() => {
    const copyBtn = document.getElementById(`copy-${id}`);
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.textContent = t('btn.copied');
          copyBtn.classList.add('code-block__copy--copied');
          setTimeout(() => {
            copyBtn.textContent = t('btn.copy');
            copyBtn.classList.remove('code-block__copy--copied');
          }, 2000);
        });
      });
    }
  }, 0);

  return `
    <div class="code-block">
      <div class="code-block__header">
        <span class="code-block__label">${label || ''}</span>
        <button class="code-block__copy" id="copy-${id}">${t('btn.copy')}</button>
      </div>
      <pre><code>${escapedCode}</code></pre>
    </div>
  `;
}

function renderNextButton(): string {
  if (!lessonData) return '';

  const isLastStep = currentStep >= lessonData.steps.length - 1;
  const label = isLastStep ? t('celebration.lessonComplete') : t('btn.next');

  return `
    <button class="next-btn" id="next-btn" ${!stepCompleted ? 'disabled' : ''} onclick="window.__nextStep()">
      ${label} ${isLastStep ? '🎉' : '→'}
    </button>
  `;
}

function updateNextButton(): void {
  const btn = document.getElementById('next-btn') as HTMLButtonElement;
  if (btn) {
    btn.disabled = !stepCompleted;
  }
}

async function nextStep(): Promise<void> {
  if (!lessonData || !stepCompleted) return;

  unmountTerminal();

  if (currentStep >= lessonData.steps.length - 1) {
    // Lesson complete
    await markComplete(lessonData.id);
    triggerConfetti();
    showCelebration(lessonData.id);
    return;
  }

  currentStep++;
  stepCompleted = false;
  renderCurrentStep();
}

function prevStep(): void {
  if (currentStep > 0) {
    unmountTerminal();
    currentStep--;
    stepCompleted = true;
    renderCurrentStep();
  }
}

export function unmountLesson(): void {
  unmountTerminal();
  lessonData = null;
  currentStep = 0;
  appContainer = null;
}

// Expose globally
declare global {
  interface Window {
    __nextStep: () => void;
    __prevStep: () => void;
  }
}

window.__nextStep = nextStep;
window.__prevStep = prevStep;

// Re-render on language change
window.addEventListener('langchange', () => {
  if (lessonData && appContainer) {
    // Reload lesson in new language
    const id = lessonData.id;
    lessonData = null; // Force re-fetch
    renderLesson(appContainer, id);
  }
});
