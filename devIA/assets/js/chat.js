/**
 * chat.js
 * Controla a interface de chat com o mentor de IA.
 * As mensagens vão para o backend local (server/), que guarda a chave da IA.
 */
 
import { getCurrentUser, onAuthStateChanged } from '../../firebase/auth.js';
import { db } from '../../firebase/firestore.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
 
const API_URL = 'http://localhost:3000/api/chat';
const HISTORY_LIMIT = 10;
 
const history = [];
let userInitials = 'EU';
 
async function saveChatMessage(userId, role, content) {
  if (!userId) return;
  try {
    await addDoc(
      collection(db, 'chats', userId, 'conversations', 'default', 'messages'),
      { role, content, timestamp: new Date().toISOString() }
    );
  } catch (error) {
    console.warn('Não foi possível salvar mensagem no Firestore:', error);
  }
}
 
async function getMentorReply(message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: history.slice(-HISTORY_LIMIT) })
  });
 
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Falha ao buscar resposta da IA.');
  return data.reply;
}
 
function formatTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
 
/** Monta a bolha usando textContent — nada do que o usuário ou a IA escreve vira HTML. */
function appendMessage(text, role) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
 
  const msg = document.createElement('div');
  msg.className = `msg msg-${role}`;
 
  const avatar = document.createElement('span');
  avatar.className = 'msg-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = role === 'ai' ? 'AI' : userInitials;
 
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
 
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = formatTime();
 
  const body = document.createElement('div');
  body.append(bubble, time);
  msg.append(avatar, body);
 
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}
 
function appendTypingIndicator() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
 
  const msg = document.createElement('div');
  msg.className = 'msg msg-ai';
  msg.id = 'typingIndicator';
  msg.innerHTML = `
    <span class="msg-avatar" aria-hidden="true">AI</span>
    <div><div class="msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div></div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}
 
function updateSidebarUser(user) {
  if (!user) return;
  const label = user.displayName || user.email || 'Usuário';
  userInitials = label.trim().charAt(0).toUpperCase();
 
  const avatar = document.getElementById('sidebarAvatar');
  const name = document.getElementById('sidebarName');
  if (avatar) avatar.textContent = userInitials;
  if (name) name.textContent = user.displayName || user.email?.split('@')[0] || 'Usuário';
}
 
function initChat() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  if (!form || !input) return;
 
  const sendButton = form.querySelector('button[type="submit"]');
  const suggestionButtons = document.querySelectorAll('.chat-suggestion');

  suggestionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.textContent.trim();
      if (!value || !input) return;
      input.value = value;
      input.focus();
      input.dispatchEvent(new Event('input'));
    });
  });
  
  onAuthStateChanged((user) => {
    if (user) updateSidebarUser(user);
  });
 
  // Auto-resize da textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  });
 
  // Enter envia, Shift+Enter quebra linha
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
 
    appendMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';
    if (sendButton) sendButton.disabled = true;
 
    appendTypingIndicator();
 
    let reply;
    try {
      reply = await getMentorReply(text);
    } catch (error) {
      console.error(error);
      reply = 'Não consegui responder agora. Verifique se o servidor local está rodando (npm start em server/) e se a chave de IA foi configurada.';
    } finally {
      document.getElementById('typingIndicator')?.remove();
      if (sendButton) sendButton.disabled = false;
    }
 
    appendMessage(reply, 'ai');
    history.push({ role: 'user', content: text }, { role: 'ai', content: reply });
 
    const currentUser = getCurrentUser();
    if (currentUser) {
      await saveChatMessage(currentUser.uid, 'user', text);
      await saveChatMessage(currentUser.uid, 'ai', reply);
    }
 
    if (window.devmentorProgress) {
      const nextState = window.devmentorProgress.updateProgress({
        progress: 2.8,
        hours: 0.2,
        projects: 0,
        streak: 0
      });
      window.dispatchEvent(new CustomEvent('devmentor:progress-updated', { detail: nextState }));
    }
  });
}
 
document.addEventListener('DOMContentLoaded', initChat);