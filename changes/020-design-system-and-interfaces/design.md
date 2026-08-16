# Design — Design System & Interfaces (020)

## Decisões de arquitetura

### 1. Por que regra ESLint custom (e não `eslint-plugin-no-emoji`)

- **Prós do plugin:** já tem edge cases tratados (ZWJ sequences, variation
  selectors, regional indicators).
- **Contras:** adiciona dependência externa, sem controle sobre a regex
  exata que roda, e versões antigas tinham falsos positivos em strings
  com escape sequences legítimas (ex: `"\u2728"`).
- **Decisão:** rule custom de ~30 linhas, 100% sob nosso controle, sem
  nova dep no `package.json`. Cobre o range mais comum
  (U+1F300–U+1FAFF misc symbols + U+2600–U+27FF dingbats) — mais que
  suficiente para vetar 🚜⚠️🌾.

### 2. Por que componentes sem `useEffect` / sem estado global

- Os 3 componentes são **stateful localmente** (status, motivo selecionado)
  e dependem apenas de props. Sem necessidade de Zustand/TanStack Query
  dentro deles.
- O `OrderActionDock` faz um `useMutation` do TanStack Query para a
  transição de status (reativo, retry automático, cache invalidation).
- O `DowntimeModal` usa um `useMutation` simples para `POST /downtime`.
- O `OperatorHeader` é puro (props in, JSX out). Sem side-effects.

### 3. Por que `/operator/workspace` FORA do route group `(app)`

- O route group `(app)/layout.tsx` envolve as rotas autenticadas com
  `AuthGate` + `AppShell` (com Sidebar). Operador não pode ver Sidebar.
- Solução: rota **fora** do group, em
  `src/app/operator/workspace/page.tsx`, com seu próprio
  `layout.tsx` minimal (apenas `<AuthGate role="ROLE_OPERADOR">`).

### 4. Por que `warning: #F59E0B` já existia como `accent: #FFDE00`

- O Design System original (pre-017) usou amarelo `#FFDE00` como cor de
  marca secundária ("amarelo agrícola"). A spec do Design System (017)
  separou: `accent` = amarelo de marca, `warning` = amarelo de atenção
  média (Tailwind amber-500).
- Adicionar `warning` no `tailwind.config.ts` evita que devs usem
  `text-amber-500` direto (quebrando a regra "tudo via tokens").

## Estrutura de arquivos

```text
frontend-shell/
├── .eslint-plugin/
│   └── no-emoji.js                       # novo
├── .eslintrc.json                        # registra a rule
├── tailwind.config.ts                    # adiciona `warning`
├── src/
│   ├── app/
│   │   └── operator/
│   │       ├── layout.tsx                # novo — AuthGate role=OPERADOR
│   │       └── workspace/
│   │           └── page.tsx              # novo — grid de 3 seções
│   └── modules/
│       └── operator/                     # NOVO diretório
│           ├── OperatorHeader.tsx        # novo
│           ├── OrderActionDock.tsx       # novo
│           ├── DowntimeModal.tsx         # novo
│           ├── DowntimeModal.test.tsx    # novo (vitest)
│           └── index.ts                  # novo — barrel export
```

## Contrato de mutation (TanStack Query)

```ts
// modules/operator/useDowntimeMutation.ts
export function useDowntimeMutation(equipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { reason: DowntimeReason; notes?: string }) =>
      api.post<DowntimeResponse>('/operations/downtime', {
        equipmentId, reason: input.reason, notes: input.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
```

```ts
// modules/operator/useOrderStatusMutation.ts
export function useOrderStatusMutation(workOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: WorkOrderStatus) =>
      api.patch<WorkOrderResponse>(`/operations/work-orders/${workOrderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    },
  });
}
```

## Layout da rota `/operator/workspace`

```tsx
// app/operator/workspace/page.tsx
export default function OperatorWorkspacePage() {
  const user = useAuthStore((s) => s.user);
  const [downtimeOpen, setDowntimeOpen] = useState(false);

  // Mock O.S. ativa enquanto Change 021 não traz a query real.
  const activeOrder = {
    id: 'WO-MOCK-001',
    equipmentId: 'TRAC-7230J-001',
    status: 'PENDING' as const,
  };

  return (
    <main className="min-h-screen bg-bg p-4 space-y-4">
      <OperatorHeader
        equipmentId="TRAC-7230J-001"
        equipmentModel="7230J"
        operatorName={user?.name ?? ''}
        operatorCode={user?.id ?? ''}
        connected
      />

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <OrderActionDock
          workOrderId={activeOrder.id}
          equipmentId={activeOrder.equipmentId}
          status={activeOrder.status}
          onStatusChange={() => {}}
        />
        <Card>
          <h2>Apontamento</h2>
          <Button onClick={() => setDowntimeOpen(true)}>
            <Plus /> Registrar Parada
          </Button>
        </Card>
      </section>

      <Card>
        <h2>Alertas & Parâmetros</h2>
        <p className="font-mono">RPM 2100 | Temp 87.5°C | Combustível 82%</p>
      </Card>

      <DowntimeModal
        open={downtimeOpen}
        equipmentId={activeOrder.equipmentId}
        onClose={() => setDowntimeOpen(false)}
      />
    </main>
  );
}
```

## Estratégia de teste

- **Vitest + @testing-library/react** (já configurado).
- 1 teste para `DowntimeModal`:
  1. Renderiza modal fechado → `screen.queryByRole('dialog')` é null.
  2. Renderiza com `open=true` → 4 botões de motivo visíveis.
  3. Clica em "Manutenção / Quebra" → estado `selected` interno muda
     (verificável via `aria-pressed`).
  4. Mocka `api.post` para retornar 201; clica novamente para confirmar;
     verifica que `api.post` foi chamado com payload correto
     e que `onClose` foi invocado.
- Não testamos o `OperatorHeader` (componente puro, screenshot tests
  cobririam).
- Não testamos o `OrderActionDock` (depende do `useOrderStatusMutation`,
  melhor coberto em E2E na Change 021).

## Plano de rollout

1. Implementar tokens + componentes + modal + page + rule ESLint
   (single PR, single commit).
2. Rodar `npm run lint`, `npm test`, `npm run build` localmente.
3. Rebuild da imagem `agrio-frontend-shell`.
4. PR com título `feat(frontend): ship Change 020 - design system + operator components`.
5. Após CI verde, squash + merge em `main`.
6. Archive em `changes/archive/2026-08-16-020-…/archive.md`.

## Compatibilidade

- Tokens adicionados (`warning`) são **aditivos** — nenhum token
  existente é renomeado ou removido.
- Componentes novos vivem em `src/modules/operator/`, diretório
  separado, sem impacto no código existente.
- A rota `/operator/workspace` é nova — quem acessar sem estar
  logado é redirecionado para `/login` pelo `AuthGate`.
- A rule `no-emoji` é `error`, mas o código atual não tem nenhum
  emoji, então o build deve passar sem ajustes.
