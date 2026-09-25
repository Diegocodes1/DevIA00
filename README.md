# DevMentor AI
RODE O PROJETO NO NODE SERVER.JS. POIS NETLIFY TA SEM SALDO PARA ATUALIZAR O PROJETO.
CONTA DEMO PARA ACESSA O PROJETO: demo01@gmail.com senha:101010

Plataforma que funciona como um mentor virtual de programação, ajudando estudantes e desenvolvedores iniciantes a estudar, montar currículo e treinar entrevistas técnicas.

> Projeto de portfólio construído em **HTML5, CSS3 e JavaScript (ES6+)** puros, com arquitetura já pensada para evoluir para React + Node.js + Supabase + OpenAI API.

## Como abrir

O projeto usa o servidor Express para servir as páginas, proteger as rotas e disponibilizar as APIs de chat e análise de currículo:

```bash
npm install
npm start
```

Depois, acesse `http://localhost:3000/`. A autenticação é feita pelo Firebase; páginas dentro de `pages/` redirecionam para `pages/login.html` quando não existe uma sessão válida.

### Deploy na Netlify

O projeto inclui `netlify.toml` e uma Netlify Function para executar as rotas Express da API. Publique o repositório na Netlify usando estas configurações:

- **Build command:** `npm install`
- **Publish directory:** `.`
- **Functions directory:** `netlify/functions`

Configure `GEMINI_API_KEY` nas variáveis de ambiente do site para habilitar o chat e a análise de currículo. O arquivo `.env` é apenas local e não deve ser enviado ao repositório.

As rotas `/api/*` são encaminhadas automaticamente para a função serverless. As páginas e os arquivos estáticos continuam sendo publicados diretamente pela Netlify.

Para testar somente a interface estática, também é possível servir a pasta com outro servidor local (não use `file://`, pois os módulos do Firebase precisam de HTTP):

```bash
npx serve .
# ou
python3 -m http.server 5500
```

## Estrutura do projeto

```
/index.html              → Landing page
/pages
  dashboard.html          → Painel com progresso, calendário e atividades
  chat.html                → Chat com o mentor de IA
  estudos.html             → Formulário + geração de plano de estudos
  curriculo.html            → Upload e análise de currículo
  entrevistas.html          → Simulador de entrevistas técnicas
  perfil.html               → Perfil, tecnologias, metas e configurações
/assets
  /css   → style.css (design system), components.css, landing.css, app.css
  /js    → main.js (compartilhado) + um arquivo por página
  /images
/components               → Partials de referência (sidebar) para futura migração a componentes React
```

## Design

- Tema escuro, azul elétrico como cor primária, ciano como acento.
- Tipografia: Space Grotesk (display) + Inter (texto) + JetBrains Mono (código/dados).
- Elemento de assinatura visual: **path track** — uma trilha vertical com nós, usada no dashboard e no plano de estudos, representando a jornada de aprendizado (inspirada em grafos de commit).
- Totalmente responsivo (mobile, tablet, desktop), com sidebar que vira menu retrátil no mobile.
- Acessibilidade: contraste AA, foco visível no teclado, `aria-labels` em controles interativos, `prefers-reduced-motion` respeitado.

## Roadmap técnico (próximas versões)

| Fase | Entrega |
|---|---|
| v1 (atual) | HTML/CSS/JS estático, autenticação Firebase e APIs Express |
| v2 | Migração da UI para **React** (componentizar sidebar, cards, chat) |
| v3 | Back-end em **Node.js** + banco **PostgreSQL/Supabase**, autenticação real |
| v4 | Integração com a **OpenAI API** para respostas reais do mentor, análise de currículo e geração de planos de estudo |
| v5 | Deploy contínuo, contas de usuário, histórico persistente e painel de administração |

## Observação

As perguntas de entrevista e alguns textos iniciais são demonstrativos. O perfil, a sessão e o progresso do usuário autenticado são carregados do Firebase; o chat e a análise de currículo usam as APIs do servidor quando configuradas.
