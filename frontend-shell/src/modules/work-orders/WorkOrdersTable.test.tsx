import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkOrdersTable } from './WorkOrdersTable';
import type { WorkOrderDTO } from './useWorkOrdersQuery';

describe('WorkOrdersTable', () => {
  it('renders the empty body when no rows are provided', () => {
    const { container } = render(<WorkOrdersTable rows={[]} />);
    expect(container.querySelector('tbody')?.children.length).toBe(0);
  });

  it('renders one row per WO with status dot and short id', () => {
    const rows: WorkOrderDTO[] = [
      {
        id: 'WO-1234567890abcdef',
        equipmentId: 'TRAC-1',
        operatorId: 'OP-001',
        status: 'PENDING',
        createdAt: '2026-08-16T20:00:00Z',
        updatedAt: '2026-08-16T20:00:00Z',
      },
      {
        id: 'WO-abcdef1234567890',
        equipmentId: 'TRAC-2',
        operatorId: 'OP-002',
        status: 'IN_PROGRESS',
        createdAt: '2026-08-16T21:00:00Z',
        updatedAt: '2026-08-16T21:00:00Z',
      },
    ];
    render(<WorkOrdersTable rows={rows} />);
    // Each id is sliced to 12 chars.
    expect(screen.getByText('WO-123456789')).toBeTruthy();
    expect(screen.getByText('WO-abcdef123')).toBeTruthy();
    // Status labels.
    expect(screen.getByText('Pendente')).toBeTruthy();
    expect(screen.getByText('Em curso')).toBeTruthy();
    // Equipment.
    expect(screen.getByText('TRAC-1')).toBeTruthy();
    expect(screen.getByText('TRAC-2')).toBeTruthy();
  });
});
