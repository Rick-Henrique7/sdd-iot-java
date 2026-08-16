# Tasks — Design System & Interfaces (020)

> Task futura, **não** é uma change SDD completa. Será executada como
> parte do pacote de maintenance (014+015+016+020) que consolida os novos
> specs em uma única PR de maintenance.
> ID reservado `020-design-system-and-interfaces` para manter a sequência
> numérica da pasta `changes/`.

## Contexto

O blueprint completo de UI/UX do front-end está documentado em
`docs/frontend/design-system-and-interfaces.md`. Esta spec define:

- Tokens visuais (paleta slate + verde John Deere)
- Anti-padrões estritos (zero emojis, tipografia inviolável, font-mono)
- Layout da Interface do Operador (`/operator/workspace`)
- Layout da Sidebar 6-abas do Gestor
- Gerenciamento de estado (TanStack Query + Zustand)
- Mapeamento de rotas

Esta task rastreia a atualização do código e da documentação para
alinhar com o blueprint. Algumas mudanças já estão parcialmente
implementadas (a `Sidebar` 6-abas está desenhada no
`docs/frontend/operator-profile-and-gestor-sidebar.md` que
pré-datou este spec), mas faltam:

- Tokens visuais explícitos no `tailwind.config.ts`
- Componentes `OperatorHeader`, `OrderActionDock`, `DowntimeModal`
- Regra de lint para proibir emojis
- Documentação da seção "Personas & Permissões" no README

## Tarefas

### A. Tokens visuais (`tailwind.config.ts`)

- [ ] **A1.** Documentar os tokens em `theme.extend.colors`:
  `canvas` (`#0F172A`), `card-2` (`#1E293B`), `border` (`#334155`),
  `fg` (`#F8FAFC`), `brand` (`#367C2B`), `brand-hover` (`#2D6824`),
  `warning` (`#F59E0B`), `critical` (`#EF4444`), `info` (`#3B82F6`).
- [ ] **A2.** Confirmar que `bg`, `fg`, `fg-muted`, `fg-body`, `card`,
  `card-2`, `border`, `brand`, `brand-hover` já cobrem os tokens
  (sim, o spec atual já os usa — só falta documentar formalmente).

### B. Componentes do Operador (3 novos)

- [ ] **B1.** Criar `frontend-shell/src/app/operator/workspace/page.tsx` (layout touch-friendly).
- [ ] **B2.** Criar `frontend-shell/src/modules/operator/OperatorHeader.tsx`.
- [ ] **B3.** Criar `frontend-shell/src/modules/operator/OrderActionDock.tsx`
  (botões com altura mínima de 64px).
- [ ] **B4.** Criar `frontend-shell/src/modules/operator/DowntimeModal.tsx`
  (4 motivos pré-definidos, 2 toques para selecionar).
- [ ] **B5.** Adicionar teste vitest para `DowntimeModal` (1 caso: abre,
  seleciona motivo, submete POST, fecha).

### C. Regra de lint customizada

- [ ] **C1.** Criar `frontend-shell/.eslint-plugin/no-emoji.js` (rule
  customizada: rejeita chars em ranges U+1F300–U+1FAFF e
  U+2600–U+27BF em strings JSX e template literals).
- [ ] **C2.** Adicionar a rule ao `.eslintrc.json` como `error` (não warning).
- [ ] **C3.** Verificar que `npm run lint --max-warnings 0` continua passando
  no estado atual (deve passar porque nenhum emoji está presente no código).

### D. Documentação no README

- [ ] **D1.** Adicionar seção "Personas & Permissões" com a matriz
  `ROLE_GESTOR` × `ROLE_OPERADOR` × rotas.
- [ ] **D2.** Adicionar sub-seção "Design System" com:
  - Paleta de cores (tabela com hex + token name)
  - Anti-padrões (zero emojis, tipografia, font-mono)
  - Referência à spec em `docs/frontend/design-system-and-interfaces.md`.
- [ ] **D3.** Atualizar o `docs/` map (seção 5 do README) referenciando
  o novo spec.

### E. Code review de conformidade

- [ ] **E1.** Rodar `npm run lint` (quebra se emoji for encontrado em
  qualquer `.tsx`).
- [ ] **E2.** Auditar `frontend-shell/src/**/*.tsx` buscando emojis
  (`grep -P '[\x{1F300}-\x{1FAFF}]'` ou similar) — esperado: 0 matches.
- [ ] **E3.** Auditar títulos buscando variação de cor/peso na última
  palavra (regex) — esperado: 0 matches.
- [ ] **E4.** Confirmar que valores numéricos de telemetria
  (`RPM`, `Temp`, `Velocidade`, `Combustível`) usam `font-mono`.

### F. Validação E2E local

- [ ] **F1.** `npm test` continua 52/52 (ou +1 se o teste de
  `DowntimeModal` foi adicionado).
- [ ] **F2.** `npm run build` continua 10/10 static pages.
- [ ] **F3.** Acessar `/operator/workspace` local — renderiza com a
  grid touch-friendly.
- [ ] **F4.** Login como `ROLE_OPERADOR` redireciona para
  `/operator/workspace` (não para `/dashboard`).

## Trigger

Esta task deve ser executada **em conjunto** com:

- `changes/014-readme-update-for-new-services/tasks.md` (README update)
- `changes/015-readme-update-for-frontend-role-expansion/tasks.md` (README update UI/UX)
- `changes/016-docker-sql-verification/tasks.md` (Docker & SQL)

Como uma **única PR de maintenance** depois que as features
subjacentes (`field-operation-service` + `operator/workspace` +
Sidebar 6-abas) estiverem merged em `main`.

## Relação com outras tasks placeholder

- **014** = README update (backend) → atualiza com novo microsserviço.
- **015** = README update (UI/UX) → atualiza com persona Operator.
- **016** = Docker & SQL verification → valida docker-compose + init.sql.
- **020 (esta)** = Design system & interfaces → tokens + componentes + lint rule.

**Sugestão:** 014 + 015 + 016 + 020 em uma única PR de maintenance
depois que `019-field-operation-service` e `021-frontend-operator-workspace`
estiverem merged.
