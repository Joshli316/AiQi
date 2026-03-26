import { t, getLang } from './i18n';

interface TerminalExercise {
  expectedCommands: { command: string; output: string; successMsg?: string }[];
  hints: { en: string; zh: string };
}

interface TerminalState {
  outputLines: { text: string; type: 'command' | 'response' | 'error' | 'success' | 'hint' }[];
  currentCommandIndex: number;
  completed: boolean;
}

let activeState: TerminalState | null = null;
let activeExercise: TerminalExercise | null = null;
let onCompleteCallback: (() => void) | null = null;
let typingTimeout: number | null = null;

export function renderTerminal(container: HTMLElement, exercise: TerminalExercise, onComplete: () => void): void {
  activeExercise = exercise;
  onCompleteCallback = onComplete;
  activeState = {
    outputLines: [],
    completed: false,
    currentCommandIndex: 0,
  };

  const el = document.createElement('div');
  el.className = 'terminal';
  el.innerHTML = `
    <div class="terminal__titlebar">
      <span class="terminal__dot terminal__dot--red"></span>
      <span class="terminal__dot terminal__dot--yellow"></span>
      <span class="terminal__dot terminal__dot--green"></span>
      <span class="terminal__title">${t('terminal.title')}</span>
    </div>
    <div class="terminal__body">
      <div class="terminal__output" id="terminal-output"></div>
      <div class="terminal__input-line" id="terminal-input-line">
        <span class="terminal__prompt">$</span>
        <input class="terminal__input" id="terminal-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="${getLang() === 'zh' ? '在这里输入命令...' : 'Type a command here...'}" />
      </div>
    </div>
  `;

  container.appendChild(el);

  const input = el.querySelector('#terminal-input') as HTMLInputElement;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleCommand(input.value.trim());
      input.value = '';
    }
  });

  // Focus input
  setTimeout(() => input.focus(), 100);
}

function handleCommand(cmd: string): void {
  if (!activeState || !activeExercise || activeState.completed) return;

  const expected = activeExercise.expectedCommands[activeState.currentCommandIndex];
  if (!expected) return;

  // Add the command line to output
  addOutputLine(`$ ${cmd}`, 'command');

  // Fuzzy match: trim, case-insensitive comparison
  const normalizedCmd = cmd.toLowerCase().trim();
  const normalizedExpected = expected.command.toLowerCase().trim();

  if (normalizedCmd === normalizedExpected) {
    // Correct command
    typeOutput(expected.output, 'response', () => {
      const successMsg = expected.successMsg || t('terminal.success');
      addOutputLine(`✓ ${successMsg}`, 'success');

      activeState!.currentCommandIndex++;

      if (activeState!.currentCommandIndex >= activeExercise!.expectedCommands.length) {
        activeState!.completed = true;
        if (onCompleteCallback) onCompleteCallback();
      }
    });
  } else {
    // Wrong command — show hint
    const lang = getLang();
    const hint = activeExercise.hints[lang] || activeExercise.hints['en'];
    addOutputLine(`${t('terminal.hint.almost')}${t('terminal.hint.prefix')}${expected.command}`, 'hint');
  }
}

function addOutputLine(text: string, type: 'command' | 'response' | 'error' | 'success' | 'hint'): void {
  if (!activeState) return;
  activeState.outputLines.push({ text, type });

  const outputEl = document.getElementById('terminal-output');
  if (!outputEl) return;

  const line = document.createElement('div');
  line.className = `terminal__output-line terminal__output-line--${type}`;
  line.textContent = text;
  outputEl.appendChild(line);

  // Auto scroll
  const body = outputEl.parentElement;
  if (body) body.scrollTop = body.scrollHeight;
}

function typeOutput(text: string, type: 'response' | 'error', onDone?: () => void): void {
  if (!activeState) return;

  const outputEl = document.getElementById('terminal-output');
  if (!outputEl) return;

  const line = document.createElement('div');
  line.className = `terminal__output-line terminal__output-line--${type}`;
  outputEl.appendChild(line);

  // Disable input during typing
  const input = document.getElementById('terminal-input') as HTMLInputElement;
  if (input) input.disabled = true;

  let charIndex = 0;
  const speed = 20; // ms per character

  function typeChar() {
    if (charIndex < text.length) {
      line.textContent += text[charIndex];
      charIndex++;
      const body = outputEl!.parentElement;
      if (body) body.scrollTop = body.scrollHeight;
      typingTimeout = window.setTimeout(typeChar, speed);
    } else {
      if (input) input.disabled = false;
      input?.focus();
      if (onDone) onDone();
    }
  }

  typeChar();
}

export function unmountTerminal(): void {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  activeState = null;
  activeExercise = null;
  onCompleteCallback = null;
}
