import { t, getLang } from './i18n';

interface QuizQuestion {
  question: { en: string; zh: string };
  options: { en: string; zh: string }[];
  correctIndex: number;
  explanation: { en: string; zh: string };
}

export function renderQuiz(container: HTMLElement, questions: QuizQuestion[], onComplete: () => void): void {
  let currentQuestion = 0;

  function renderQuestion(): void {
    const q = questions[currentQuestion];
    const lang = getLang();
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="quiz">
        <div class="step-counter" style="margin-bottom: var(--space-md);">
          ${lang === 'zh' ? `第 ${currentQuestion + 1} 题，共 ${questions.length} 题` : `Question ${currentQuestion + 1} of ${questions.length}`}
        </div>
        <div class="quiz__question">${q.question[lang]}</div>
        <div class="quiz__options">
          ${q.options.map((opt, i) => `
            <button class="quiz__option" data-index="${i}">
              <span class="quiz__option-letter">${letters[i]}</span>
              <span>${opt[lang]}</span>
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback"></div>
      </div>
    `;

    // Attach click handlers
    container.querySelectorAll('.quiz__option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt((btn as HTMLElement).dataset.index || '0', 10);
        handleAnswer(index, q, btn as HTMLElement);
      });
    });
  }

  function handleAnswer(selectedIndex: number, q: QuizQuestion, btnEl: HTMLElement): void {
    const lang = getLang();
    const feedbackEl = document.getElementById('quiz-feedback');
    if (!feedbackEl) return;

    // Disable all options
    container.querySelectorAll('.quiz__option').forEach(b => {
      (b as HTMLButtonElement).disabled = true;
    });

    if (selectedIndex === q.correctIndex) {
      btnEl.classList.add('quiz__option--correct');
      feedbackEl.innerHTML = `
        <div class="quiz__feedback quiz__feedback--correct">
          <strong>${t('quiz.correct')}</strong> ${q.explanation[lang]}
        </div>
      `;

      // Auto-advance after delay
      setTimeout(() => {
        currentQuestion++;
        if (currentQuestion >= questions.length) {
          onComplete();
        } else {
          renderQuestion();
        }
      }, 1500);
    } else {
      btnEl.classList.add('quiz__option--incorrect');
      feedbackEl.innerHTML = `
        <div class="quiz__feedback quiz__feedback--incorrect">
          ${t('quiz.incorrect')}
        </div>
      `;

      // Re-enable options after delay for retry
      setTimeout(() => {
        btnEl.classList.remove('quiz__option--incorrect');
        feedbackEl.innerHTML = '';
        container.querySelectorAll('.quiz__option').forEach(b => {
          (b as HTMLButtonElement).disabled = false;
        });
      }, 1000);
    }
  }

  renderQuestion();
}
