import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DowntimeTable } from './DowntimeTable';
import type { DowntimeDTO } from './useDowntimeQuery';

describe('DowntimeTable', () => {
  it('renders empty tbody when no rows', () => {
    const { container } = render(<DowntimeTable rows={[]} />);
    expect(container.querySelector('tbody')?.children.length).toBe(0);
  });

  it('renders a row with reason label and duration', () => {
    const rows: DowntimeDTO[] = [
      {
        id: 'DT-1',
        equipmentId: 'TRAC-1',
        operatorId: 'OP-001',
        reason: 'MECHANICAL_BREAKDOWN',
        startTime: '2026-08-16T20:00:00Z',
        // 90 minutes later
        endTime: '2026-08-16T21:30:00Z',
      },
    ];
    render(<DowntimeTable rows={rows} />);
    expect(screen.getByText('Manutencao / Quebra')).toBeTruthy();
    expect(screen.getByText('TRAC-1')).toBeTruthy();
    // Duration 90 min -> "1h 30min".
    expect(screen.getByText('1h 30min')).toBeTruthy();
    // "em curso" badge for ongoing downtimes.
    const ongoing: DowntimeDTO[] = [
      {
        id: 'DT-2',
        equipmentId: 'TRAC-2',
        operatorId: 'OP-001',
        reason: 'REFUELING',
        startTime: '2026-08-16T22:00:00Z',
      },
    ];
    const { rerender } = render(<DowntimeTable rows={ongoing} />);
    rerender(<DowntimeTable rows={ongoing} />);
    expect(screen.getByText('em curso')).toBeTruthy();
  });
});
