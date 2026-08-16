# Tasks — README update (follow-up do Perfil Operador & Sidebar expandida do Gestor)

> Task futura, **não** é uma change SDD completa. Será executada como
> maintenance depois que a feature de UI/UX do **Perfil Operador** e a
> **expansão da Sidebar do Gestor** forem merged em `main`. ID reservado
> `015-readme-update-for-frontend-role-expansion` para manter a sequência
> numérica da pasta `changes/`.

## Contexto

Hoje o `README.md` raiz documenta o front-end como um único conjunto de rotas
no grupo `(app)/` (5 páginas: `/dashboard`, `/mapping`, `/fleet`, `/settings`,
`/login`/`/register`).

Com a chegada da expansão descrita em
`docs/frontend/operator-profile-and-gestor-sidebar.md`, o front-end passa a
ter:

- Duas **personas distintas** (Gestor vs Operador).
- Uma nova rota dedicada `/operator/workspace` (acessível só por
  `ROLE_OPERADOR`, **sem** sidebar).
- Uma **Sidebar expandida de 6 abas** para o Gestor (hoje são 4: Dashboard,
  Mapeamento, Frota, Configurações).
- Itens novos: `operations` (Acompanhamento de O.S.) e `maintenance`
  (Controle de Horímetro).

O `README.md` precisa refletir essa nova topologia.

## Tarefas

- [ ] **1. Atualizar a seção "Tech stack"** mencionando explicitamente o
      suporte a múltiplas personas (Gestor / Operador) e o redirect
      automático baseado em `role`.
- [ ] **2. Atualizar a tabela de Changes** (seção 3) com a nova change que
      implementar `operator/workspace` + Sidebar 6-abas.
- [ ] **3. Atualizar a seção "Stack URLs"** (seção 2) com a nova rota
      `http://localhost:3000/operator/workspace`.
- [ ] **4. Atualizar a seção "Repo layout"** (seção 6) com o novo route
      group `operator/` e a nova estrutura `(gestor)/` no `app/`.
- [ ] **5. Atualizar o `docs/` map** (seção 5) referenciando
      `docs/frontend/operator-profile-and-gestor-sidebar.md`.
- [ ] **6. Adicionar uma sub-seção "Personas & Permissões"** explicando
      a matriz `ROLE_GESTOR` × `ROLE_OPERADOR` × rotas.
- [ ] **7. Atualizar o diagrama ASCII de arquitetura** (seção 4) incluindo
      o novo container / rota `/operator/workspace`.
- [ ] **8. Atualizar os badges / screenshots** se houver.
- [ ] **9. Re-rodar `npm run build` + `mvnw.cmd test`** e validar 100% verde.
- [ ] **10. Mover esta pasta para
      `changes/archive/<data>-015-readme-update-for-frontend-role-expansion/`**
      após o merge.

## Trigger

Esta task deve ser executada **somente após** o merge em `main` da change que
implementar o `operator/workspace` e a Sidebar expandida de 6 abas do Gestor
(referenciada em `docs/frontend/operator-profile-and-gestor-sidebar.md`).

**Atenção:** esta task (015) e a task `014-readme-update-for-new-services`
são complementares. Sugere-se consolidá-las em uma única PR de maintenance
quando **ambas** as features (backend `field-operation-service` + frontend
`operator/workspace`) já estiverem merged.
