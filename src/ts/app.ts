import { t, getLang, toggleLang, type Lang } from './i18n';
import { renderLesson, unmountLesson } from './lessons';
import { renderDashboard } from './progress';
import { renderPaywall } from './paywall';
import { initAuth, renderAuthButton } from './auth';
import { triggerConfetti, showCelebration } from './celebrations';

type Route = 'home' | 'lessons' | 'lesson' | 'dashboard';

interface RouteParams {
  lessonId?: number;
}

let currentRoute: Route = 'home';
let currentParams: RouteParams = {};

const app = document.getElementById('app')!;

// SVG icons for bottom nav
const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  lessons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
};

// Lesson titles for both languages
const lessonTitles: Record<Lang, string[]> = {
  en: [
    'Why AI Coding Matters for YOUR Career',
    'Meet the Terminal — It\'s Just a Chat Box',
    'Installing Claude Code',
    'Your First Conversation with Claude',
    'Understanding What Claude Made',
    'Editing with Words: Tell Claude What to Change',
    'Ship It! Put Your Page on the Internet',
    'Thinking Like a Builder: What Should I Make?',
    'Planning with CLAUDE.md',
    'Building Your App: Structure',
    'Building Your App: Making It Interactive',
    'Styling: Making It Look Professional',
    'When Things Go Wrong: Debugging with Claude',
    'Launch Day: Ship Your Portfolio Piece',
  ],
  zh: [
    '为什么AI编程对你的职业很重要',
    '认识终端——它只是一个聊天框',
    '安装 Claude Code',
    '与 Claude 的第一次对话',
    '理解 Claude 创建的内容',
    '用文字编辑：告诉 Claude 你想改什么',
    '上线！把你的页面放到互联网上',
    '像建造者一样思考：我该做什么？',
    '用 CLAUDE.md 做规划',
    '构建你的应用：结构',
    '构建你的应用：添加交互',
    '样式设计：让它看起来专业',
    '出了问题怎么办：用 Claude 调试',
    '上线日：发布你的作品集',
  ],
};

export function getLessonTitle(lessonNum: number): string {
  const lang = getLang();
  return lessonTitles[lang][lessonNum - 1] || `Lesson ${lessonNum}`;
}

export function navigate(route: Route, params: RouteParams = {}): void {
  currentRoute = route;
  currentParams = params;

  if (route === 'lesson' && params.lessonId) {
    window.location.hash = `#/lesson/${params.lessonId}`;
  } else {
    window.location.hash = `#/${route === 'home' ? '' : route}`;
  }

  render();
}

function parseHash(): { route: Route; params: RouteParams } {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts[0] === 'lesson' && parts[1]) {
    const lessonId = parseInt(parts[1], 10);
    if (lessonId >= 1 && lessonId <= 14) {
      return { route: 'lesson', params: { lessonId } };
    }
    return { route: 'lessons', params: {} };
  }

  const routeMap: Record<string, Route> = {
    '': 'home',
    'lessons': 'lessons',
    'dashboard': 'dashboard',
  };

  return { route: routeMap[parts[0] || ''] || 'home', params: {} };
}

function renderHeader(): string {
  return `
    <header class="header">
      <div class="header__logo">AI起 <span>AiQi</span></div>
      <div class="header__actions">
        <button class="lang-toggle" onclick="window.__toggleLang()" aria-label="Switch language">
          <span class="lang-toggle__option ${getLang() === 'en' ? 'lang-toggle__option--active' : ''}">EN</span>
          <span class="lang-toggle__option ${getLang() === 'zh' ? 'lang-toggle__option--active' : ''}">中文</span>
        </button>
      </div>
    </header>
  `;
}

function renderBottomNav(): string {
  const items: { route: Route; icon: keyof typeof icons; labelKey: string }[] = [
    { route: 'home', icon: 'home', labelKey: 'nav.home' },
    { route: 'lessons', icon: 'lessons', labelKey: 'nav.lessons' },
    { route: 'dashboard', icon: 'dashboard', labelKey: 'nav.dashboard' },
  ];

  return `
    <nav class="bottom-nav" aria-label="Main navigation">
      ${items.map(item => `
        <button class="nav-item ${currentRoute === item.route ? 'nav-item--active' : ''}"
                ${currentRoute === item.route ? 'aria-current="page"' : ''}
                onclick="window.__navigate('${item.route}')">
          <span class="nav-item__icon">${icons[item.icon]}</span>
          <span>${t(item.labelKey)}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function renderHome(): string {
  return `
    <div class="view-enter">
      <section class="hero">
        <h1 class="hero__title">
          ${t('hero.title.1')}<br><em>${t('hero.title.2')}</em>
        </h1>
        <p class="hero__subtitle">${t('hero.subtitle')}</p>
        <div class="hero-terminal">
          <div class="hero-terminal__bar">
            <span class="hero-terminal__dot" style="background:#FF5F57"></span>
            <span class="hero-terminal__dot" style="background:#FFBD2E"></span>
            <span class="hero-terminal__dot" style="background:#28C840"></span>
          </div>
          <div class="hero-terminal__body">
            <div class="hero-terminal__line"><span class="hero-terminal__prompt">$</span> claude "build me a personal website"</div>
            <div class="hero-terminal__line hero-terminal__line--response">✓ Created index.html</div>
            <div class="hero-terminal__line hero-terminal__line--response">✓ Added modern styling</div>
            <div class="hero-terminal__line hero-terminal__line--success">🎉 Your site is live at mysite.pages.dev</div>
          </div>
        </div>
        <button class="hero__cta" onclick="window.__navigate('lesson', {lessonId: 1})">
          ${t('btn.start')} →
        </button>
        <p style="margin-top: var(--space-md); font-size: var(--text-sm); color: var(--text-muted);">${t('hero.proof')}</p>
      </section>
      <section class="features">
        ${renderFeatureCard('terminal', '💻')}
        ${renderFeatureCard('bilingual', '🌏')}
        ${renderFeatureCard('stepbystep', '👣')}
        ${renderFeatureCard('portfolio', '🚀')}
      </section>
    </div>
  `;
}

function renderFeatureCard(key: string, icon: string): string {
  return `
    <div class="feature-card">
      <div class="feature-card__icon">${icon}</div>
      <div>
        <div class="feature-card__title">${t(`feature.${key}`)}</div>
        <div class="feature-card__desc">${t(`feature.${key}.desc`)}</div>
      </div>
    </div>
  `;
}

function renderLessonList(): string {
  const progress = window.__getProgress();
  const completedLessons = new Set(progress.map((p: any) => p.lessonId));

  let nextLesson = 1;
  for (let i = 1; i <= 14; i++) {
    if (!completedLessons.has(i)) { nextLesson = i; break; }
    if (i === 14) nextLesson = 15; // all done
  }

  function renderCard(num: number): string {
    const completed = completedLessons.has(num);
    const isCurrent = num === nextLesson;
    const title = getLessonTitle(num);

    let stateClass = '';
    if (completed) stateClass = 'lesson-card--completed';
    else if (isCurrent) stateClass = 'lesson-card--current';

    const badge = completed
      ? `<span class="lesson-card__badge">${t('completed')}</span>`
      : `<span class="lesson-card__badge lesson-card__badge--free">${t('free')}</span>`;

    return `
      <div class="lesson-card ${stateClass}" onclick="window.__navigate('lesson', {lessonId: ${num}})">
        <div class="lesson-card__number">${completed ? '✓' : num}</div>
        <div class="lesson-card__info">
          <div class="lesson-card__title">${title}</div>
          <div class="lesson-card__meta">${badge}</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="main-content view-enter">
      <div class="lesson-list">
        <div class="lesson-list__week">${t('week1')}</div>
        ${[1,2,3,4,5,6,7].map(renderCard).join('')}
        <div class="lesson-list__week">${t('week2')}</div>
        ${[8,9,10,11,12,13,14].map(renderCard).join('')}
      </div>
    </div>
  `;
}

function renderContent(): string {
  switch (currentRoute) {
    case 'home': return renderHome();
    case 'lessons': return renderLessonList();
    case 'lesson': return ''; // handled separately
    case 'dashboard': return renderDashboard();
    default: return renderHome();
  }
}

function render(): void {
  unmountLesson();

  if (currentRoute === 'lesson' && currentParams.lessonId) {
    // Paywall disabled — all lessons free during testing
    // TODO: Re-enable when payment system is ready
    // if (currentParams.lessonId > 5 && !window.__isPurchased()) {
    //   app.innerHTML = renderHeader() + renderPaywall() + renderBottomNav();
    //   return;
    // }
    app.innerHTML = '';
    renderLesson(app, currentParams.lessonId);
    return;
  }

  app.innerHTML = renderHeader() + renderContent() + renderBottomNav();
}

// Global functions for onclick handlers
declare global {
  interface Window {
    __navigate: typeof navigate;
    __toggleLang: typeof toggleLang;
    __getProgress: () => any[];
    __isPurchased: () => boolean;
    __triggerConfetti: typeof triggerConfetti;
    __showCelebration: typeof showCelebration;
  }
}

window.__navigate = navigate;
window.__toggleLang = () => {
  toggleLang();
  render();
};

// Listen for language changes
window.addEventListener('langchange', () => {
  render();
});

// Hash-based routing
window.addEventListener('hashchange', () => {
  const parsed = parseHash();
  currentRoute = parsed.route;
  currentParams = parsed.params;
  render();
});

// Initialize
function init(): void {
  initAuth();
  const parsed = parseHash();
  currentRoute = parsed.route;
  currentParams = parsed.params;
  render();
}

window.__triggerConfetti = triggerConfetti;
window.__showCelebration = showCelebration;

document.addEventListener('DOMContentLoaded', init);
