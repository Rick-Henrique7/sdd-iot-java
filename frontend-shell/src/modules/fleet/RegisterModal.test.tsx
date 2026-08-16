import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterModal } from './RegisterModal';

const mockPost = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

function TestProviders({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function makeWrapper() {
  function Wrap({ children }: { children: React.ReactNode }) {
    return <TestProviders>{children}</TestProviders>;
  }
  Wrap.displayName = 'RegisterModalTestWrap';
  return Wrap;
}

const initial = {
  id: 'TRAC-EXISTING',
  name: 'Trator Existente',
  model: '6110J',
  serialNumber: 'JD6110J-EXISTING-001',
  type: 'TRACTOR' as const,
  status: 'OPERATIONAL' as const,
  horometerHours: 1234.5,
  lastMaintenanceDate: '2026-07-01',
};

describe('RegisterModal', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('submits a POST with the right DTO on register', async () => {
    mockPost.mockResolvedValue({ data: initial });
    const Wrapper = makeWrapper();
    const onClose = vi.fn();
    render(
      <Wrapper>
        <RegisterModal open onClose={onClose} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByLabelText('ID'), { target: { value: 'TRAC-NEW-001' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Trator Novo' } });
    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: '7230J' } });
    fireEvent.change(screen.getByLabelText('Número de série'), {
      target: { value: 'JD7230J-NEW-001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/fleet',
        expect.objectContaining({
          id: 'TRAC-NEW-001',
          name: 'Trator Novo',
          model: '7230J',
          serialNumber: 'JD7230J-NEW-001',
          type: 'TRACTOR',
          status: 'OPERATIONAL',
          horometerHours: 0,
          lastMaintenanceDate: null,
        }),
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders the backend error message on failure', async () => {
    mockPost.mockRejectedValue({ response: { data: { message: 'ID ja cadastrado' } } });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <RegisterModal open onClose={() => undefined} />
      </Wrapper>,
    );

    fireEvent.change(screen.getByLabelText('ID'), { target: { value: 'TRAC-DUP' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Dup' } });
    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'M' } });
    fireEvent.change(screen.getByLabelText('Número de série'), { target: { value: 'SN' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('ID ja cadastrado');
    });
  });

  it('pre-fills the form when `initial` is provided', async () => {
    mockPost.mockResolvedValue({ data: initial });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <RegisterModal open onClose={() => undefined} initial={initial} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect((screen.getByLabelText('ID') as HTMLInputElement).value).toBe('TRAC-EXISTING');
    });
    expect((screen.getByLabelText('Nome') as HTMLInputElement).value).toBe('Trator Existente');
    expect((screen.getByLabelText('Horimetro (h)') as HTMLInputElement).value).toBe('1234.5');
  });
});
