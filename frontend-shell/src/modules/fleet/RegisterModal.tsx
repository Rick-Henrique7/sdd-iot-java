'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useRegisterEquipment } from './useRegisterEquipment';
import type { Equipment, EquipmentStatus, EquipmentType } from '@/types/equipment';

const STATUS_OPTIONS: EquipmentStatus[] = ['OPERATIONAL', 'MAINTENANCE', 'INACTIVE'];
const TYPE_OPTIONS: EquipmentType[] = ['TRACTOR', 'HARVESTER', 'SPRAYER'];

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-filled values for the status-toggle flow. */
  initial?: Equipment;
}

interface FormState {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  type: EquipmentType;
  status: EquipmentStatus;
  horometerHours: string;
  lastMaintenanceDate: string;
}

const EMPTY: FormState = {
  id: '',
  name: '',
  model: '',
  serialNumber: '',
  type: 'TRACTOR',
  status: 'OPERATIONAL',
  horometerHours: '0',
  lastMaintenanceDate: '',
};

export function RegisterModal({ open, onClose, initial }: RegisterModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const mutation = useRegisterEquipment();

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name,
        model: initial.model,
        serialNumber: initial.serialNumber,
        type: initial.type,
        status: initial.status,
        horometerHours: String(initial.horometerHours ?? 0),
        lastMaintenanceDate: initial.lastMaintenanceDate ?? '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, initial]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.id.trim()) {
      setError('ID e obrigatorio.');
      return;
    }
    if (!form.name.trim()) {
      setError('Nome e obrigatorio.');
      return;
    }
    const dto: Equipment = {
      id: form.id.trim(),
      name: form.name.trim(),
      model: form.model.trim(),
      serialNumber: form.serialNumber.trim(),
      type: form.type,
      status: form.status,
      horometerHours: Number(form.horometerHours) || 0,
      lastMaintenanceDate: form.lastMaintenanceDate.trim() || null,
    };
    setError(null);
    mutation.mutate(dto, {
      onSuccess: () => onClose(),
      onError: (err) => {
        const body = (err as { response?: { data?: { message?: string } } })?.response?.data;
        setError(body?.message ?? 'Falha ao salvar equipamento.');
      },
    });
  }

  const isEdit = Boolean(initial);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar ${initial?.id}` : 'Cadastrar equipamento'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="register-form" loading={mutation.isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="register-form" onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="ID"
            value={form.id}
            disabled={isEdit}
            onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
            required
          />
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Modelo"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            required
          />
          <Input
            label="Numero de serie"
            value={form.serialNumber}
            onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
            required
          />
          <Select
            label="Tipo"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EquipmentType }))}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EquipmentStatus }))}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Input
            label="Horimetro (h)"
            type="number"
            min={0}
            value={form.horometerHours}
            onChange={(e) => setForm((f) => ({ ...f, horometerHours: e.target.value }))}
          />
          <Input
            label="Ultima manutencao"
            type="date"
            value={form.lastMaintenanceDate}
            onChange={(e) => setForm((f) => ({ ...f, lastMaintenanceDate: e.target.value }))}
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-critical"
          >
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
