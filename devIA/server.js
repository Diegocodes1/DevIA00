require('dotenv').config();

console.log('Chave carregada:', process.env.GEMINI_API_KEY ? 'SIM' : 'NÃO');

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// Servir arquivos estáticos (páginas, assets) a partir do diretório do projeto
app.use(express.static(path.join(__dirname)));

function sanitizeMessage(message) {
  return String(message || '').trim().slice(0, 4000);
}

app.post('/api/chat', async (req, res) => {
  const message = sanitizeMessage(req.body?.message);

  if (!message) {
    return res.status(400).json({ error: 'Mensagem obrigatória.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      reply: 'A chave do Gemini ainda não foi configurada. Defina GEMINI_API_KEY no ambiente e reinicie o servidor.'
    });
  }

  try {
    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              { text: 'Você é um mentor de programação amigável, objetivo e prático para iniciantes e desenvolvedores em início de carreira.' }
            ]
          },
          contents: [
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao chamar o Gemini.');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Não consegui gerar uma resposta agora.';
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Falha ao processar a mensagem.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});