import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { DowntimeModal } from './DowntimeModal';

const mockPost = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

function makeWrapper(qc: QueryClient) {
  function Wrap({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        {children}
      </QueryClientProvider>
    );
  }
  Wrap.displayName = 'DowntimeModalTestWrap';
  return Wrap;
}

describe('DowntimeModal', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('does not render when open=false', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <DowntimeModal
        open={false}
        equipmentId="TRAC-7230J-001"
        onClose={() => {}}
      />,
      { wrapper: makeWrapper(qc) },
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders 4 reason buttons when open=true', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <DowntimeModal
        open
        equipmentId="TRAC-7230J-001"
        onClose={() => {}}
      />,
      { wrapper: makeWrapper(qc) },
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Abastecimento')).toBeTruthy();
    expect(screen.getByText('Manutencao / Quebra')).toBeTruthy();
    expect(screen.getByText('Clima Adverso')).toBeTruthy();
    expect(screen.getByText('Intervalo')).toBeTruthy();
  });

  it('marks the chosen reason with aria-pressed on first tap', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <DowntimeModal
        open
        equipmentId="TRAC-7230J-001"
        onClose={() => {}}
      />,
      { wrapper: makeWrapper(qc) },
    );

    const reasonBtn = screen.getByText('Manutencao / Quebra');
    expect(reasonBtn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(reasonBtn);
    expect(reasonBtn.getAttribute('aria-pressed')).toBe('true');
    // No POST yet — 1st tap only selects.
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('submits POST on 2nd tap of the same reason and closes on success', async () => {
    mockPost.mockResolvedValue({
      data: { id: 'DT-1', equipmentId: 'TRAC-7230J-001', reason: 'MECHANICAL_BREAKDOWN' },
    });
    const onClose = vi.fn();
    const onSubmitted = vi.fn();
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <DowntimeModal
        open
        equipmentId="TRAC-7230J-001"
        onClose={onClose}
        onSubmitted={onSubmitted}
      />,
      { wrapper: makeWrapper(qc) },
    );

    const reasonBtn = screen.getByText('Manutencao / Quebra');
    fireEvent.click(reasonBtn); // 1st tap = select
    fireEvent.click(reasonBtn); // 2nd tap = confirm

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/operations/downtime',
        expect.objectContaining({
          equipmentId: 'TRAC-7230J-001',
          reason: 'MECHANICAL_BREAKDOWN',
        }),
      );
    });
    expect(onSubmitted).toHaveBeenCalledWith('Parada registrada');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error message when POST fails', async () => {
    mockPost.mockRejectedValue(new Error('boom'));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <DowntimeModal
        open
        equipmentId="TRAC-7230J-001"
        onClose={() => {}}
      />,
      { wrapper: makeWrapper(qc) },
    );

    const reasonBtn = screen.getByText('Abastecimento');
    fireEvent.click(reasonBtn);
    fireEvent.click(reasonBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
    expect(screen.getByText(/Falha ao registrar parada/)).toBeTruthy();
  });
});
