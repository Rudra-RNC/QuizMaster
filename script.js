const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : '';

const TOPIC_ICONS = {
  'Atmosphere': '🌤️',
  'Energy': '⚡',
  'Plants': '🌱',
  'Water Cycle': '💧',
  'default': '🌍'
};

const GRADE_TITLES = [
  { min: 100, title: "Perfect Score! 🌟", sub: "You're an environmental champion!" },
  { min: 80, title: "Excellent Work! 🎉", sub: "You really know your environment." },
  { min: 60, title: "Good Effort! 🌱", sub: "Keep exploring and learning." },
  { min: 40, title: "Nice Try! 💪", sub: "Every expert started as a beginner." },
  { min: 0, title: "Keep Learning! 🌍", sub: "The planet has so much to teach us." }
];

const LETTERS = ['A', 'B', 'C', 'D'];

let state = {
  sessionId: null,
  questions: [],
  currentIndex: 0,
  answered: false,
  correctCount: 0
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  showScreen('screen-error');
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function startQuiz() {
  showScreen('screen-loading');
  try {
    const data = await apiFetch('/api/sessions', { method: 'POST' });
    state.sessionId = data.session_id;
    state.questions = data.questions;
    state.currentIndex = 0;
    state.answered = false;
    state.correctCount = 0;
    renderQuestion();
    showScreen('screen-quiz');
  } catch (e) {
    showError(`Could not start quiz: ${e.message}`);
  }
}

function renderQuestion() {
  const q = state.questions[state.currentIndex];
  const total = state.questions.length;
  const current = state.currentIndex + 1;

  document.getElementById('progress-count').textContent = `${current} of ${total}`;
  document.getElementById('progress-fill').style.width = `${((current - 1) / total) * 100}%`;

  const icon = TOPIC_ICONS[q.topic] || TOPIC_ICONS.default;
  document.getElementById('question-topic').textContent = `${icon} ${q.topic}`;
  document.getElementById('question-text').textContent = q.question_text;

  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.optionId = opt.id;
    btn.innerHTML = `
      <span class="option-letter">${LETTERS[idx]}</span>
      <span>${opt.text}</span>
    `;
    btn.addEventListener('click', () => submitAnswer(opt.id));
    grid.appendChild(btn);
  });

  const feedback = document.getElementById('feedback-box');
  feedback.className = 'feedback-box';
  feedback.textContent = '';

  document.getElementById('btn-next').style.display = 'none';
  document.getElementById('btn-finish').style.display = 'none';
  state.answered = false;
}

async function submitAnswer(selectedOptionId) {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.currentIndex];
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => b.disabled = true);

  try {
    const result = await apiFetch(`/api/sessions/${state.sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ question_id: q.id, selected_option_id: selectedOptionId })
    });

    if (result.correct) state.correctCount++;

    allBtns.forEach(btn => {
      const optId = parseInt(btn.dataset.optionId);
      if (optId === result.correct_answer_id) {
        btn.classList.add('correct');
      } else if (optId === selectedOptionId && !result.correct) {
        btn.classList.add('wrong');
      } else {
        btn.classList.add('revealed');
      }
    });

    const feedback = document.getElementById('feedback-box');
    feedback.className = `feedback-box ${result.correct ? 'correct' : 'wrong'}`;
    const icon = result.correct ? '✅' : '💡';
    feedback.innerHTML = `<span class="feedback-icon">${icon}</span>${result.explanation}`;

    const isLast = state.currentIndex === state.questions.length - 1;
    if (isLast) {
      document.getElementById('btn-finish').style.display = 'inline-flex';
    } else {
      document.getElementById('btn-next').style.display = 'inline-flex';
    }
  } catch (e) {
    showError(`Could not submit answer: ${e.message}`);
  }
}

async function loadResults() {
  showScreen('screen-loading');
  try {
    const result = await apiFetch(`/api/sessions/${state.sessionId}/results`);
    renderResults(result);
    showScreen('screen-results');

    requestAnimationFrame(() => {
      const pct = result.score_percentage;
      const circumference = 283;
      const offset = circumference - (pct / 100) * circumference;
      document.getElementById('score-ring-fill').style.strokeDashoffset = offset;
    });
  } catch (e) {
    showError(`Could not load results: ${e.message}`);
  }
}

function renderResults(result) {
  const pct = result.score_percentage;
  document.getElementById('result-percent').textContent = `${Math.round(pct)}%`;
  document.getElementById('stat-correct').textContent = result.correct_answers;
  document.getElementById('stat-wrong').textContent = result.total_questions - result.correct_answers;
  document.getElementById('stat-total').textContent = result.total_questions;

  const grade = GRADE_TITLES.find(g => pct >= g.min);
  document.getElementById('results-title').textContent = grade.title;
  document.getElementById('results-subtitle').textContent = grade.sub;
}

document.getElementById('btn-start').addEventListener('click', startQuiz);
document.getElementById('btn-retry').addEventListener('click', startQuiz);
document.getElementById('btn-restart').addEventListener('click', startQuiz);

document.getElementById('btn-next').addEventListener('click', () => {
  state.currentIndex++;
  renderQuestion();
});

document.getElementById('btn-finish').addEventListener('click', loadResults);
