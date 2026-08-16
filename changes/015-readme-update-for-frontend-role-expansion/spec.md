# Spec — README update for frontend role expansion

A especificação técnica detalhada da feature de UI/UX que justifica esta change
de README está em:

- `docs/frontend/operator-profile-and-gestor-sidebar.md`

Esta change é **somente de documentação** e não introduz novos componentes
React, novas rotas no `app/`, ou novas dependências.

## Acceptance criteria

- A seção "Stack URLs" do `README.md` raiz lista
  `http://localhost:3000/operator/workspace` mapeando para a rota do
  Operador (sem sidebar lateral).
- A tabela de Changes inclui a nova change que implementa o `operator/workspace`.
- A seção "Repo layout" mostra o route group `operator/workspace/` ao lado
  de `(gestor)/` com suas 6 abas (dashboard, mapping, operations, fleet,
  maintenance, settings).
- O `docs/` map referencia o novo spec em
  `docs/frontend/operator-profile-and-gestor-sidebar.md`.
- Uma sub-seção "Personas & Permissões" documenta a matriz
  `ROLE_GESTOR` × `ROLE_OPERADOR` × rotas com redirecionamentos.
- `npm run build` continua verde.
- `.\mvnw.cmd test` continua 45/45 verde.
