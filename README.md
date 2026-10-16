# OurDevo

Devocional a dois: um PWA para ler o Novo Testamento em dupla, com progresso
compartilhado, pedidos de oração e um jardim que só cresce quando as duas leem.

- Interface em pt-BR · mobile-first · instalável no iPhone (Adicionar à Tela de Início)
- Stack: Next.js (App Router) + TypeScript + Tailwind v4 + Motion, Supabase (Auth/Postgres/Storage), Web Push (VAPID), Vercel.

## Status por fase

| Fase | O quê | Estado |
|---|---|---|
| 1 | Setup, auth por convite, RLS | ✅ feita |
| 2 | Leitura + progresso | ✅ feita |
| 3 | Perfil + temas + tela de ajustes (lembretes/notificações) | ⬜ |
| 3 | Perfil + temas | ⬜ |
| 4 | Gamificação (jardim, streak da dupla) | ⬜ |
| 5 | Push + agendamento (pg_cron + Edge Function) | ⬜ |
| 6 | Polimento PWA + deploy final | ⬜ |

## Setup local

1. **Banco de dados** — crie o projeto no [Supabase](https://supabase.com) (região `South America` para latência), depois abra o **SQL Editor** e rode na íntegra, **em ordem**: `supabase/01_schema.sql` e `supabase/02_leitura.sql`. Antes de rodar, edite o bloco `insert into public.allowed_users` com os e-mails dos dois convidados.
2. **Variáveis de ambiente** — `cp .env.example .env.local` e preencha com os valores de *Settings → API* no painel do Supabase. A `service_role` fica **apenas** neste arquivo: nunca vá para o git nem para o cliente.
3. **Login** — o OurDevo usa **e-mail + senha**, sem e-mail de confirmação. No painel: *Authentication → Sign In / Providers → Email* → **desligue o toggle "Confirm email"**. Assim o cadastro em "1º acesso" já loga direto — o trigger do banco cria o perfil e valida que o e-mail está na lista de convites. A rota `/auth/confirm` fica como rede de segurança, fora do fluxo normal.
4. **URLs de auth** — *Authentication → URL Configuration*: Site URL = `http://localhost:3000` (e a URL da Vercel depois); Redirect URLs: adicione `<URL>/auth/confirm`.
5. Rodar: `npm run dev` → `http://localhost:3000`.

## Criar as contas e a dupla

1. Em `/login`, aba **1º acesso**: cada uma cria a conta (nome + e-mail + senha) e já entra direto.
2. Com os dois cadastros feitos, rode no SQL Editor o bloco comentado **"Criar a dupla"** no fim de `01_schema.sql` (uma única vez).

## Deploy na Vercel

1. Suba num **repositório privado** no GitHub.
2. Na Vercel, importe o repositório e cadastre as 3 variáveis de `.env.local` (*Project Settings → Environment Variables*). A `service_role` é server-only por natureza (só server actions/route handlers a leem).
3. Atualize *URL Configuration* no Supabase com a URL da Vercel e adicione `<url>/auth/confirm` às Redirect URLs.

## Recomendações de segurança no GitHub (manual, uma vez)

- *Settings → Branches*: branch protection na `main` (exigir PR + checks). Para um projeto a dois, exigir apenas 1 aprovação.
- Ativar **Dependabot** (security updates), **Secret scanning** + *Push protection* e **Code scanning** (CodeQL).

## Segurança já implementada

- RLS habilitada em **todas** as tabelas; `allowed_users` sem nenhuma política (nem anon, nem authenticated leem).
- Trava de convite em **duas camadas**: verificação na server action antes do signup e trigger `handle_new_user` no banco (+ gate na rota `/auth/confirm`).
- Rate limit nas actions de login/cadastro (5–8 tentativas / 10 min por IP).
- Zod validando toda entrada; service role apenas no servidor.
- Headers de segurança (CSP, HSTS, frame-ancestors none, etc.) em `next.config.ts`; `poweredByHeader` desabilitado.

## Segurança do ambiente

- `.tool-versions`: Node 26 (o asdf lê este arquivo).
- Verificação de tipos: `npm run typecheck`.

## Texto bíblico

Tradução **João Ferreira de Almeida** (domínio público), convertida dos arquivos
[USFX do projeto open-bibles](https://github.com/seven1m/open-bibles) (27 livros
do NT, 260 capítulos, 7.697 versículos) e armazenada em `public/biblia/`
(27 pastas + índice). Para regenerar:

```bash
curl -L -o /tmp/por-almeida.usfx.xml https://raw.githubusercontent.com/seven1m/open-bibles/master/por-almeida.usfx.xml
node scripts/gerar-biblia.mjs /tmp/por-almeida.usfx.xml
```

## Como instalar no iPhone (usuária final)

Abra `/onboarding` no Safari — a página explica os passos (Compartilhar → Adicionar à Tela de Início).