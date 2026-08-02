/**
 * curriculo.js
 * Controla o upload do currículo (drag & drop + input), envia o PDF
 * para o backend (/api/analisar-curriculo) para análise em tempo real
 * via Gemini, e permite gerar uma versão reescrita otimizada para ATS
 * (/api/gerar-curriculo-ats).
 */
 
function formatFileSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
 
function preencherLista(container, itens, classe) {
  if (!container) return;
  container.innerHTML = '';
  (itens || []).forEach((item) => {
    const linha = document.createElement('div');
    linha.className = classe ? `point-item ${classe}` : 'point-item';
 
    const bolinha = document.createElement('span');
    bolinha.className = 'dot-mark';
    if (!classe) bolinha.style.background = 'var(--primary-glow)';
 
    linha.appendChild(bolinha);
    linha.appendChild(document.createTextNode(item));
    container.appendChild(linha);
  });
}
 
function tituloPorNota(nota) {
  if (nota >= 85) return 'Excelente currículo!';
  if (nota >= 70) return 'Boa base, com espaço para melhorar';
  if (nota >= 50) return 'Currículo razoável, precisa de ajustes';
  return 'Currículo precisa de bastante atenção';
}
 
/* ---------- Bloco de geração de versão ATS (criado dinamicamente) ---------- */
function garantirBlocoAts(resultBox) {
  let bloco = resultBox.querySelector('#atsBlock');
  if (bloco) return bloco;
 
  bloco = document.createElement('div');
  bloco.id = 'atsBlock';
  bloco.className = 'card-block';
  bloco.style.marginTop = '18px';
  bloco.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
      <h4 style="margin:0;">📝 Versão otimizada para ATS</h4>
      <button id="gerarAtsBtn" class="btn btn-primary btn-sm">Gerar versão ATS ✨</button>
    </div>
    <div id="atsResultWrap" hidden style="margin-top:14px;">
      <textarea id="atsTextarea" readonly style="width:100%; min-height:320px; resize:vertical; font-family:monospace; font-size:0.85rem; line-height:1.5; padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border, #333); background:var(--surface, #111); color:var(--text, #eee);"></textarea>
      <div style="display:flex; justify-content:flex-end; margin-top:10px;">
        <button id="copiarAtsBtn" class="btn btn-ghost btn-sm">Copiar texto</button>
      </div>
    </div>
  `;
  resultBox.appendChild(bloco);
  return bloco;
}
 
function renderizarResultado(resultBox, analise) {
  resultBox.hidden = false;
 
  const ring = resultBox.querySelector('.score-ring');
  ring.dataset.score = analise.nota;
  animateScoreRing(ring, Number(analise.nota));
 
  const titulo = resultBox.querySelector('h3');
  const resumo = resultBox.querySelector('.text-muted');
  if (titulo) titulo.textContent = tituloPorNota(analise.nota);
  if (resumo) resumo.textContent = analise.resumo;
 
  const colunas = resultBox.querySelectorAll('.result-columns > div');
  preencherLista(colunas[0]?.querySelector('.point-list'), analise.pontosFortes, 'strong');
  preencherLista(colunas[1]?.querySelector('.point-list'), analise.pontosFracos, 'weak');
 
  const sugestoesLista = resultBox.querySelector(':scope > .card-block .point-list');
  preencherLista(sugestoesLista, analise.sugestoes, null);
 
  garantirBlocoAts(resultBox);
 
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
 
  analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    analyzeBtn.disabled = true;
    const textoOriginalBtn = analyzeBtn.textContent;
    analyzeBtn.textContent = 'Analisando...';
 
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
 
      const resposta = await fetch('/api/analisar-curriculo', {
        method: 'POST',
        body: formData,
      });
 
      if (!resposta.ok) {
        const erroData = await resposta.json().catch(() => ({}));
        throw new Error(erroData.error || 'Erro ao analisar o currículo.');
      }
 
      const analise = await resposta.json();
      renderizarResultado(resultBox, analise);
      analyzeBtn.textContent = 'Analisar novamente ✨';
      showToast('Análise concluída!', 'success');
 
    } catch (erro) {
      showToast(erro.message || 'Erro ao analisar o currículo.', 'error');
      analyzeBtn.textContent = textoOriginalBtn;
    } finally {
      analyzeBtn.disabled = false;
    }
  });
 
  // Delegação de eventos: os botões do bloco ATS são criados dinamicamente
  resultBox.addEventListener('click', async (e) => {
    if (e.target.id === 'gerarAtsBtn') {
      if (!selectedFile) return;
      const btn = e.target;
      const textoOriginal = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Gerando...';
 
      try {
        const formData = new FormData();
        formData.append('resume', selectedFile);
 
        const resposta = await fetch('/api/gerar-curriculo-ats', {
          method: 'POST',
          body: formData,
        });
 
        if (!resposta.ok) {
          const erroData = await resposta.json().catch(() => ({}));
          throw new Error(erroData.error || 'Erro ao gerar o currículo ATS.');
        }
 
        const resultado = await resposta.json();
        const wrap = resultBox.querySelector('#atsResultWrap');
        const textarea = resultBox.querySelector('#atsTextarea');
        textarea.value = resultado.curriculoAts || '';
        wrap.hidden = false;
        btn.textContent = 'Gerar novamente ✨';
        showToast('Versão ATS gerada!', 'success');
 
      } catch (erro) {
        showToast(erro.message || 'Erro ao gerar o currículo ATS.', 'error');
        btn.textContent = textoOriginal;
      } finally {
        btn.disabled = false;
      }
    }
 
    if (e.target.id === 'copiarAtsBtn') {
      const textarea = resultBox.querySelector('#atsTextarea');
      if (!textarea?.value) return;
      navigator.clipboard.writeText(textarea.value)
        .then(() => showToast('Texto copiado!', 'success'))
        .catch(() => showToast('Não foi possível copiar. Selecione e copie manualmente.', 'error'));
    }
  });
}
 
document.addEventListener('DOMContentLoaded', initResumeUpload);