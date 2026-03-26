export type Lang = 'en' | 'zh';

const STORAGE_KEY = 'aiqi-lang';

let currentLang: Lang = (localStorage.getItem(STORAGE_KEY) as Lang) || 'zh';

const translations: Record<string, Record<Lang, string>> = {
  'app.title': { en: 'AiQi', zh: 'AI起' },
  'app.subtitle': { en: 'AI起', zh: 'AiQi' },
  'nav.home': { en: 'Home', zh: '首页' },
  'nav.lessons': { en: 'Lessons', zh: '课程' },
  'nav.dashboard': { en: 'Progress', zh: '进度' },
  'btn.next': { en: 'Next', zh: '下一步' },
  'btn.prev': { en: 'Back', zh: '上一步' },
  'btn.start': { en: 'Start Lesson 1 — 10 min', zh: '开始第一课——10分钟' },
  'btn.continue': { en: 'Continue Learning', zh: '继续学习' },
  'btn.signIn': { en: 'Sign In', zh: '登录' },
  'btn.copied': { en: 'Copied!', zh: '已复制！' },
  'btn.copy': { en: 'Copy', zh: '复制' },
  'hero.title.1': { en: 'From Zero to Shipping', zh: '从零到上线' },
  'hero.title.2': { en: 'In Your Language', zh: '用你的语言' },
  'hero.subtitle': { en: '14 lessons. ~2 hours total. Your first live app in 2 weeks. No coding experience needed.', zh: '14节课。总共约2小时。2周内做出你的第一个在线应用。零基础也能学会。' },
  'feature.terminal': { en: 'Safe Practice Terminal', zh: '安全练习终端' },
  'feature.terminal.desc': { en: 'Practice commands without fear. Nothing can break.', zh: '放心练习命令。不会出任何问题。' },
  'feature.bilingual': { en: 'Bilingual Lessons', zh: '中英双语课程' },
  'feature.bilingual.desc': { en: 'Read in Chinese, code in English. Switch anytime.', zh: '中文阅读，英文编程。随时切换。' },
  'feature.stepbystep': { en: 'Step by Step', zh: '循序渐进' },
  'feature.stepbystep.desc': { en: 'One action at a time. Never overwhelming.', zh: '每次只做一件事。绝不手忙脚乱。' },
  'feature.portfolio': { en: 'Ship a Real Project', zh: '上线真实项目' },
  'feature.portfolio.desc': { en: 'Finish with a deployed app you can show employers.', zh: '课程结束时你会有一个可以给雇主看的在线应用。' },
  'week1': { en: 'Week 1: "I Can Do This"', zh: '第一周："我可以的"' },
  'week2': { en: 'Week 2: "I Build Things"', zh: '第二周："我会做东西了"' },
  'free': { en: '~8 min', zh: '约8分钟' },
  'completed': { en: 'Completed', zh: '已完成' },
  'step': { en: 'Step', zh: '第' },
  'of': { en: 'of', zh: '步，共' },
  'steps': { en: '', zh: '步' },
  'terminal.title': { en: 'Terminal', zh: '终端' },
  'terminal.hint.prefix': { en: 'Try: ', zh: '试试：' },
  'terminal.hint.almost': { en: 'Almost! ', zh: '差一点！' },
  'terminal.success': { en: 'Great job!', zh: '做得好！' },
  'quiz.correct': { en: 'Correct!', zh: '正确！' },
  'quiz.incorrect': { en: 'Not quite. Try again!', zh: '不太对哦，再试试！' },
  'dashboard.greeting': { en: 'Your Progress', zh: '你的进度' },
  'dashboard.completed': { en: 'Completed', zh: '已完成' },
  'dashboard.streak': { en: 'Day Streak', zh: '天连续' },
  'dashboard.percentage': { en: 'Complete', zh: '完成' },
  'dashboard.empty': { en: "No lessons completed yet. Start your first one!", zh: '还没有完成任何课程。开始第一课吧！' },
  'error.network': { en: 'Network error. Please check your connection.', zh: '网络错误，请检查你的连接。' },
  'error.generic': { en: "Couldn't load this lesson. Check your connection and try again.", zh: '无法加载课程。检查网络后重试。' },
  'celebration.lessonComplete': { en: 'Lesson Complete!', zh: '课程完成！' },
  'celebration.next': { en: 'Next Lesson', zh: '下一课' },
  'celebration.firstLesson': { en: 'First Lesson Done!', zh: '第一课完成！' },
  'celebration.week1': { en: 'Week 1 Complete!', zh: '第一周完成！' },
  'celebration.allDone': { en: 'All Lessons Complete!', zh: '全部课程完成！' },
  'celebration.shipped': { en: 'You Shipped It!', zh: '你上线了！' },
};

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] || entry['en'] || key;
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

export function toggleLang(): void {
  setLang(currentLang === 'en' ? 'zh' : 'en');
}

// Initialize
document.documentElement.lang = currentLang;
