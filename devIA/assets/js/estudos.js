/**
 * estudos.js
 * Controla o formulário de 3 etapas (objetivo, nível, tecnologias)
 * e gera um cronograma de estudos simulado com base nas escolhas do usuário.
 */

const studyState = { objetivo: null, nivel: null, tecnologias: [] };
let currentStep = 1;
const totalSteps = 3;

const topicsByTech = {
  HTML: { title: 'HTML Semântico e Acessibilidade', desc: 'Estrutura de páginas, formulários e boas práticas de acessibilidade.' },
  CSS: { title: 'CSS, Flexbox e Grid', desc: 'Estilização responsiva e layouts modernos.' },
  JavaScript: { title: 'JavaScript Moderno (ES6+)', desc: 'Funções, arrays, promises, async/await e manipulação do DOM.' },
  React: { title: 'React — Componentes e Hooks', desc: 'useState, useEffect, props e composição de componentes.' },
  Git: { title: 'Git e GitHub', desc: 'Versionamento, branches, pull requests e boas práticas de commit.' },
  SQL: { title: 'SQL e Banco de Dados', desc: 'Modelagem, queries e integração com aplicações.' },
  'Node.js': { title: 'Node.js e APIs REST', desc: 'Servidores, rotas, middlewares e integração com banco de dados.' },
};

function updateStepper() {
  document.querySelectorAll('[data-step-indicator]').forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.stepIndicator) === currentStep);
  });
  document.querySelectorAll('[data-step]').forEach((el) => {
    el.hidden = Number(el.dataset.step) !== currentStep;
  });

  document.getElementById('prevStep').hidden = currentStep === 1;
  document.getElementById('nextStep').hidden = currentStep === totalSteps;
  document.getElementById('generatePlan').hidden = currentStep !== totalSteps;
}

function initOptionCards() {
  document.querySelectorAll('.option-card').forEach((card) => {
    card.addEventListener('click', () => {
      const group = card.closest('[data-group]').dataset.group;
      card.closest('[data-group]').querySelectorAll('.option-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      studyState[group] = card.dataset.value;
    });
  });
}

function initTechChips() {
  document.querySelectorAll('.tech-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const value = chip.dataset.value;
      if (studyState.tecnologias.includes(value)) {
        studyState.tecnologias = studyState.tecnologias.filter((t) => t !== value);
      } else {
        studyState.tecnologias.push(value);
      }
    });
  });
}

function validateStep(step) {
  if (step === 1 && !studyState.objetivo) { showToast('Escolha um objetivo para continuar', 'error'); return false; }
  if (step === 2 && !studyState.nivel) { showToast('Escolha seu nível para continuar', 'error'); return false; }
  if (step === 3 && studyState.tecnologias.length === 0) { showToast('Escolha pelo menos uma tecnologia', 'error'); return false; }
  return true;
}

function generatePlan() {
  const track = document.getElementById('planTrack');
  track.innerHTML = '';

  const selected = studyState.tecnologias.length ? studyState.tecnologias : Object.keys(topicsByTech);

  selected.forEach((tech, index) => {
    const topic = topicsByTech[tech] || { title: tech, desc: 'Conteúdo personalizado gerado pela IA.' };
    const node = document.createElement('div');
    node.className = `path-node${index === 0 ? ' current' : ''}`;
    node.innerHTML = `
      <span class="path-dot">${index + 1}</span>
      <div class="path-content">
        <h4>Semana ${index + 1} — ${topic.title}</h4>
        <p>${topic.desc}</p>
        <div class="path-meta">
          <span class="badge">${tech}</span>
          <span class="badge badge-warning">Desafio: projeto prático</span>
        </div>
      </div>
    `;
    track.appendChild(node);
  });

  document.getElementById('planResult').hidden = false;
  document.getElementById('planResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Cronograma gerado com sucesso!', 'success');
}

function initStudyForm() {
  const form = document.getElementById('studyForm');
  if (!form) return;

  initOptionCards();
  initTechChips();
  updateStepper();

  document.getElementById('nextStep').addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    currentStep = Math.min(currentStep + 1, totalSteps);
    updateStepper();
  });

  document.getElementById('prevStep').addEventListener('click', () => {
    currentStep = Math.max(currentStep - 1, 1);
    updateStepper();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    generatePlan();
  });
}

document.addEventListener('DOMContentLoaded', initStudyForm);
