'use client';

import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FleetTable } from './FleetTable';
import { RegisterModal } from './RegisterModal';
import { useRegisterEquipment } from './useRegisterEquipment';
import type { Equipment, EquipmentStatus } from '@/types/equipment';

export function Fleet() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Equipment | null>(null);
  const mutation = useRegisterEquipment();

  function handleEdit(e: Equipment) {
    setEditTarget(e);
    setModalOpen(true);
  }

  function handleToggleStatus(e: Equipment) {
    const next: EquipmentStatus = e.status === 'INACTIVE' ? 'OPERATIONAL' : 'INACTIVE';
    const action = next === 'INACTIVE' ? 'desativar' : 'reativar';
    if (typeof window !== 'undefined' && !window.confirm(`Confirma ${action} o equipamento ${e.id}?`)) {
      return;
    }
    mutation.mutate(
      { ...e, status: next },
      {
        onError: (err) => {
          const body = (err as { response?: { data?: { message?: string } } })?.response?.data;
          // eslint-disable-next-line no-console
          console.error('Status toggle failed', body?.message ?? err);
        },
      },
    );
  }

  return (
    <section className="animate-fade-in space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
            <Truck size={12} aria-hidden />
            Change 009
          </span>
          <h1 className="text-h1 font-semibold text-fg">Gestao de Frota</h1>
          <p className="text-sm text-fg-muted">
            Cadastro, edicao e alteracao de status dos equipamentos. O CRUD fala com o
            <code className="ml-1 rounded bg-card-2 px-1.5 py-0.5 font-mono text-[0.75rem] text-fg">fleet-mapping-service</code>.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditTarget(null);
            setModalOpen(true);
          }}
        >
          <Plus size={14} />
          Cadastrar equipamento
        </Button>
      </header>

      <FleetTable
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        actionsDisabled={mutation.isPending}
      />

      <RegisterModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        initial={editTarget ?? undefined}
      />
    </section>
  );
}
