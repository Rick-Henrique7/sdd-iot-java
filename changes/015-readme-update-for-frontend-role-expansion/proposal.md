# Proposal — README update for frontend role expansion

## Why

Hoje o `README.md` raiz documenta o front-end como um único conjunto de rotas
no grupo `(app)/` (5 páginas: `/dashboard`, `/mapping`, `/fleet`, `/settings`,
`/login`/`/register`).

Com a chegada da expansão descrita em
`docs/frontend/operator-profile-and-gestor-sidebar.md`, o front-end passa a ter:

- Duas **personas distintas** (Gestor vs Operador).
- Uma nova rota dedicada `/operator/workspace` (acessível só por
  `ROLE_OPERADOR`, **sem** sidebar).
- Uma **Sidebar expandida de 6 abas** para o Gestor (hoje são 4: Dashboard,
  Mapeamento, Frota, Configurações).
- Itens novos: `operations` (Acompanhamento de O.S.) e `maintenance`
  (Controle de Horímetro).

O `README.md` precisa refletir essa nova topologia.

## What changes

- Atualizar a seção "Tech stack" mencionando explicitamente o suporte a
  múltiplas personas (Gestor / Operador) e o redirect automático baseado em
  `role`.
- Atualizar a tabela de Changes com a nova change que implementar
  `operator/workspace` + Sidebar 6-abas.
- Atualizar a seção "Stack URLs" com a nova rota `http://localhost:3000/operator/workspace`.
- Atualizar a seção "Repo layout" com o novo route group `operator/` e a
  nova estrutura `(gestor)/` no `app/`.
- Atualizar o `docs/` map referenciando
  `docs/frontend/operator-profile-and-gestor-sidebar.md`.
- Adicionar uma sub-seção "Personas & Permissões" explicando a matriz
  `ROLE_GESTOR` × `ROLE_OPERADOR` × rotas.
- Atualizar o diagrama ASCII de arquitetura (seção 4) incluindo o novo
  container / rota `/operator/workspace`.

## Out of scope

- Mudanças de código em si. Esta é uma change puramente de documentação.
- Mudanças em testes ou em fluxos de autenticação (essas pertencem ao PR de
  feature do `operator/workspace`).

## Trigger

Esta change deve ser merged **somente após** o merge em `main` da change que
implementa o `operator/workspace` e a Sidebar expandida de 6 abas.
