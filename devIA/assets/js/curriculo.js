/**
 * curriculo.js
 * Controla o upload do currículo (drag & drop + input) e simula a chamada
 * à IA para gerar o relatório de análise. Em produção, o arquivo seria
 * enviado para um endpoint (ex: /api/resume/analyze) que usa a OpenAI API.
 */

function formatFileSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function initResumeUpload() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('resumeFile');
  const fileChip = document.getElementById('fileChip');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultBox = document.getElementById('resumeResult');
  if (!zone || !input) return;

  let selectedFile = null;

  function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Envie o currículo em formato PDF.', 'error');
      return;
    }
    selectedFile = file;
    fileChip.hidden = false;
    fileChip.innerHTML = `<span class="file-chip">📎 ${file.name} · ${formatFileSize(file.size)}</span>`;
    analyzeBtn.disabled = false;
  }

  input.addEventListener('change', (e) => handleFile(e.target.files[0]));

  ['dragover', 'dragenter'].forEach((evt) => {
    zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach((evt) => {
    zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.remove('dragover'); });
  });
  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  analyzeBtn.addEventListener('click', () => {
    if (!selectedFile) return;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analisando...';

    // Simula o tempo de processamento da IA
    setTimeout(() => {
      resultBox.hidden = false;
      const ring = resultBox.querySelector('.score-ring');
      animateScoreRing(ring, Number(ring.dataset.score));
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analisar novamente ✨';
      showToast('Análise concluída!', 'success');
    }, 1400);
  });
}

document.addEventListener('DOMContentLoaded', initResumeUpload);
