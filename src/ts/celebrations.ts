import { t, getLang } from './i18n';
import { getCompletedCount } from './progress';

const CONFETTI_COLORS = ['#6C5CE7', '#A29BFE', '#00B894', '#55EFC4', '#FDCB6E', '#FF6B6B', '#74B9FF'];

export function triggerConfetti(): void {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    container.appendChild(piece);
  }

  // Clean up after animation
  setTimeout(() => {
    container.innerHTML = '';
  }, 4000);
}

const celebrationMessages = {
  en: [
    "You're doing amazing! 🌟",
    "One step closer to building real things! 💪",
    "Your future self will thank you for this! 🚀",
    "You just proved you can do this! ✨",
    "That's real progress — be proud! 🎯",
  ],
  zh: [
    '你做得太棒了！🌟',
    '离做出真东西又近了一步！💪',
    '未来的你会感谢现在的你！🚀',
    '你刚刚证明了自己可以做到！✨',
    '这是真正的进步——为自己骄傲！🎯',
  ],
};

export function showCelebration(lessonId: number): void {
  const lang = getLang();
  const completedCount = getCompletedCount();

  let icon = '🎉';
  let title = t('celebration.lessonComplete');
  let msg = celebrationMessages[lang][Math.floor(Math.random() * celebrationMessages[lang].length)];

  // Special milestones
  if (completedCount === 1) {
    icon = '🌟';
    title = t('celebration.firstLesson');
  } else if (completedCount === 7) {
    icon = '🏆';
    title = t('celebration.week1');
  } else if (completedCount === 14) {
    icon = '🎓';
    title = t('celebration.allDone');
    msg = lang === 'zh' ? '你完成了所有课程！你是真正的建造者！' : "You finished all lessons! You're a real builder!";
  } else if (lessonId === 7 || lessonId === 14) {
    icon = '🚀';
    title = t('celebration.shipped');
  }

  const nextLessonId = lessonId < 14 ? lessonId + 1 : null;
  const nextLabel = nextLessonId ? `${t('celebration.next')} →` : (lang === 'zh' ? '返回主页' : 'Back to Home');
  const nextAction = nextLessonId
    ? `window.__navigate('lesson', {lessonId: ${nextLessonId}})`
    : `window.__navigate('home')`;

  const overlay = document.createElement('div');
  overlay.className = 'celebration';
  overlay.innerHTML = `
    <div class="celebration__card">
      <div class="celebration__icon">${icon}</div>
      <h3 class="celebration__title">${title}</h3>
      <p class="celebration__msg">${msg}</p>
      <button class="celebration__btn" onclick="this.closest('.celebration').remove(); ${nextAction}">
        ${nextLabel}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
