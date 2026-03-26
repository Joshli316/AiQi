import { t, getLang } from './i18n';
import { getLessonTitle } from './app';

export function renderPaywall(): string {
  const lang = getLang();

  const previewLessons = [6, 7, 8, 9, 10, 11, 12, 13, 14];

  return `
    <div class="main-content view-enter">
      <div class="paywall">
        <div class="paywall__icon">🔓</div>
        <h2 class="paywall__title">${t('paywall.title')}</h2>
        <p class="paywall__desc">${t('paywall.desc')}</p>

        <div class="paywall__preview">
          ${previewLessons.map(num => `
            <div class="paywall__preview-item">
              <span>📘</span>
              <span>${lang === 'zh' ? '第' : 'Lesson '}${num}${lang === 'zh' ? '课：' : ': '}${getLessonTitle(num)}</span>
            </div>
          `).join('')}
        </div>

        <button class="paywall__cta" onclick="alert('${t('paywall.coming')}')">
          ${t('paywall.contact')}
        </button>
      </div>
    </div>
  `;
}
