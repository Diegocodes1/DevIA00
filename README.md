# DevMentor AI

CONTA DEMO PARA ACESSA O PROJETO: demo01@gmail.com senha:101010

Plataforma que funciona como um mentor virtual de programação, ajudando estudantes e desenvolvedores iniciantes a estudar, montar currículo e treinar entrevistas técnicas.

> Projeto de portfólio construído em **HTML5, CSS3 e JavaScript (ES6+)** puros, com arquitetura já pensada para evoluir para React + Node.js + Supabase + OpenAI API.

## Como abrir

Não há build nem dependências — é só abrir no navegador:

1. Abra `index.html` para ver a landing page.
2. Navegue até `pages/dashboard.html` para explorar a área logada (fluxo simulado, sem autenticação real).

Para melhor experiência (evita bloqueios de `file://` em alguns navegadores), sirva a pasta com um servidor local, por exemplo:

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
| v1 (atual) | HTML/CSS/JS estático, fluxos simulados no front-end |
| v2 | Migração da UI para **React** (componentizar sidebar, cards, chat) |
| v3 | Back-end em **Node.js** + banco **PostgreSQL/Supabase**, autenticação real |
| v4 | Integração com a **OpenAI API** para respostas reais do mentor, análise de currículo e geração de planos de estudo |
| v5 | Deploy contínuo, contas de usuário, histórico persistente e painel de administração |

## Observação

Todos os dados exibidos (usuário "João Silva", mensagens do chat, notas de currículo, feedbacks de entrevista) são **fictícios**, usados apenas para demonstrar a interface e o fluxo de uso.
