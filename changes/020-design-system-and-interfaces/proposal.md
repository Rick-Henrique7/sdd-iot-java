# Proposal — Design System & Interfaces (020)

## Contexto

A `docs/frontend/design-system-and-interfaces.md` (criada em Change 017) já
descreve formalmente os tokens visuais, anti-padrões (zero emojis, font-mono em
valores numéricos, paleta slate) e a separação de interfaces entre Gestor
(`/dashboard` + Sidebar 6-abas) e Operador (`/operator/workspace`).

Hoje o `tailwind.config.ts` já tem os tokens `bg`, `card`, `card-2`, `border`,
`brand`, `fg`, `fg-muted`, `fg-body`, `critical`, `info` em uso — mas falta
**formalizar** o mapeamento com a paleta da spec, **construir os 3
componentes do Operador** e **travar a regra de lint "no-emoji"** no CI para
garantir que nenhum PR futuro reintroduza emojis na UI.

## Objetivo

Implementar a infra-estrutura visual e os componentes que a próxima change
(`021-frontend-operator-workspace`) vai montar para entregar a Interface do
Operador.

## Entregas

1. **Tokens visuais formalizados** em `tailwind.config.ts` (paleta slate +
   verde John Deere + amarelo `warning`).
2. **3 componentes do Operador** em `frontend-shell/src/modules/operator/`:
   - `OperatorHeader.tsx` (header de identificação touch)
   - `OrderActionDock.tsx` (botões de iniciar/pausar/concluir, altura ≥ 64px)
   - `DowntimeModal.tsx` (modal de registro de parada com 4 motivos
     pré-definidos)
3. **Rota dedicada** `frontend-shell/src/app/operator/workspace/page.tsx`
   que monta os 3 componentes num grid touch-friendly.
4. **Regra ESLint customizada** `no-emoji` em
   `frontend-shell/.eslint-plugin/no-emoji.js` (rejeita chars em ranges
   U+1F300–U+1FAFF e U+2600–U+27BF em strings JSX/template literals) —
   cadastrada como `error` no `.eslintrc.json`.
5. **Teste vitest** para `DowntimeModal` (abre → seleciona motivo →
   submete POST → fecha).
6. **README atualizado** com a seção "Personas & Permissões" e a
   sub-seção "Design System".

## Não-objetivos

- Não inclui a Sidebar 6-abas do Gestor (vai em Change 021).
- Não inclui o `useRoleGuard` redirect (vai em Change 021).
- Não inclui a página `/operations` ou `/maintenance` (placeholders para
  changes futuras).

## Métricas de aceite

- `npm run lint` passa com `--max-warnings 0`.
- `npm test` continua com 52/52 (ou 53/53 se o teste do `DowntimeModal`
  for adicionado nesta change).
- `npm run build` continua com 10/10 páginas estáticas (ou 11/11 com a
  nova `/operator/workspace`).
- Auditoria de emojis no código (`grep` por ranges Unicode) retorna
  zero matches.

## Dependências

- `field-operation-service` (Change 019) — já merged, expõe
  `POST /api/v1/operations/downtime` que o `DowntimeModal` consome.
- `docs/frontend/design-system-and-interfaces.md` (Change 017) — fonte
  de verdade dos tokens e regras.
