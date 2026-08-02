/**
 * entrevistas.js
 * Controla o simulador de entrevistas: seleção de tecnologia, navegação
 * entre perguntas e feedback simulado de cada resposta.
 */

const questionBank = {
  HTML: [
    'O que é HTML semântico e por que ele é importante?',
    'Qual a diferença entre elementos block e inline?',
    'Para que serve o atributo "alt" em uma imagem?',
    'O que são formulários e quais são seus principais elementos?',
    'Como o HTML se relaciona com acessibilidade?',
  ],
  CSS: [
    'Qual a diferença entre Flexbox e Grid?',
    'O que é especificidade em CSS?',
    'Como funciona o box-model?',
    'O que são media queries e para que servem?',
    'Qual a diferença entre "em", "rem" e "px"?',
  ],
  JavaScript: [
    'O que é hoisting em JavaScript?',
    'Explique o conceito de closures.',
    'Qual a diferença entre "==" e "==="?',
    'O que é uma Promise e para que serve?',
    'Como funciona o event loop?',
  ],
  React: [
    'O que são hooks e para que servem?',
    'Qual a diferença entre estado (state) e propriedades (props)?',
    'O que é o Virtual DOM?',
    'Quando usar useEffect?',
    'Como funciona a renderização condicional em React?',
  ],
  Git: [
    'Qual a diferença entre "git merge" e "git rebase"?',
    'O que é um "branch" e para que serve?',
    'Como resolver um conflito de merge?',
    'O que é um "commit" e como escrever uma boa mensagem?',
    'Para que serve o "git stash"?',
  ],
  SQL: [
    'Qual a diferença entre INNER JOIN e LEFT JOIN?',
    'O que é uma chave primária e uma chave estrangeira?',
    'Para que serve a cláusula GROUP BY?',
    'O que é normalização de banco de dados?',
    'Qual a diferença entre WHERE e HAVING?',
  ],
};

const feedbackPool = [
  { score: 'Boa resposta ✅', text: 'Você cobriu os pontos principais. Para ir além, tente incluir um exemplo prático na próxima vez.' },
  { score: 'Resposta parcial ⚠️', text: 'Você está no caminho certo, mas faltou aprofundar o "porquê" por trás do conceito.' },
  { score: 'Pode melhorar 📚', text: 'Revise esse tópico no seu Plano de Estudos — considere explicar com um exemplo de código.' },
];

const interviewState = { tech: 'HTML', index: 0, answered: [] };

function renderQuestion() {
  const questions = questionBank[interviewState.tech];
  const total = questions.length;
  const current = interviewState.index;

  document.getElementById('questionTag').textContent = `${interviewState.tech} · Pergunta ${current + 1} de ${total}`;
  document.getElementById('questionText').textContent = questions[current];
  document.getElementById('answerInput').value = '';
  document.getElementById('feedbackBox').classList.remove('show');
  document.getElementById('submitAnswer').hidden = false;
  document.getElementById('nextQuestion').hidden = true;

  renderSessionList();
  updateProgress();
}

function renderSessionList() {
  const list = document.getElementById('sessionList');
  const questions = questionBank[interviewState.tech];
  list.innerHTML = questions
    .map((q, i) => `
      <div class="session-item ${interviewState.answered[i] ? 'answered' : ''}">
        <span class="dot-mark"></span>
        <span>Pergunta ${i + 1}${i === interviewState.index ? ' (atual)' : ''}</span>
      </div>
    `)
    .join('');
}

function updateProgress() {
  const total = questionBank[interviewState.tech].length;
  const answeredCount = interviewState.answered.filter(Boolean).length;
  const percent = Math.round((answeredCount / total) * 100);
  const bar = document.getElementById('sessionProgress');
  bar.dataset.value = percent;
  bar.style.width = `${percent}%`;
  document.getElementById('sessionProgressLabel').textContent = `${answeredCount} de ${total} perguntas respondidas`;
}

function initTechSelector() {
  document.getElementById('techSelectRow').addEventListener('click', (e) => {
    const chip = e.target.closest('.tech-chip');
    if (!chip) return;
    document.querySelectorAll('#techSelectRow .tech-chip').forEach((c) => c.classList.remove('selected'));
    chip.classList.add('selected');
    interviewState.tech = chip.dataset.tech;
    interviewState.index = 0;
    interviewState.answered = [];
    renderQuestion();
  });
}

function initAnswerFlow() {
  document.getElementById('submitAnswer').addEventListener('click', () => {
    const answer = document.getElementById('answerInput').value.trim();
    if (!answer) { showToast('Escreva uma resposta antes de enviar.', 'error'); return; }

    const feedback = feedbackPool[Math.floor(Math.random() * feedbackPool.length)];
    document.getElementById('feedbackScoreText').textContent = feedback.score;
    document.getElementById('feedbackText').textContent = feedback.text;
    document.getElementById('feedbackBox').classList.add('show');

    interviewState.answered[interviewState.index] = true;
    updateProgress();
    renderSessionList();

    document.getElementById('submitAnswer').hidden = true;
    const isLast = interviewState.index === questionBank[interviewState.tech].length - 1;
    document.getElementById('nextQuestion').hidden = isLast;

    if (isLast) showToast('Sessão concluída! Veja seu progresso no dashboard.', 'success');
  });

  document.getElementById('nextQuestion').addEventListener('click', () => {
    interviewState.index = Math.min(interviewState.index + 1, questionBank[interviewState.tech].length - 1);
    renderQuestion();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('questionText')) return;
  initTechSelector();
  initAnswerFlow();
  renderQuestion();
});
