import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useHeatmap } from './useHeatmap';

const mockGet = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

function Wrapper({ qc, children }: { qc: QueryClient; children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

function makeWrapper(qc: QueryClient) {
  function Wrap({ children }: { children: React.ReactNode }) {
    return <Wrapper qc={qc}>{children}</Wrapper>;
  }
  Wrap.displayName = 'HeatmapTestWrap';
  return Wrap;
}

describe('useHeatmap', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('is disabled when fieldId is null', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useHeatmap(null), { wrapper: makeWrapper(qc) });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toBeUndefined();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('fetches /api/v1/mapping/heatmaps when fieldId is set', async () => {
    mockGet.mockResolvedValue({ data: [{ latitude: 1, longitude: 2, intensity: 0.5 }] });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useHeatmap('FLD-01'), { wrapper: makeWrapper(qc) });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/mapping/heatmaps',
      expect.objectContaining({ params: { fieldId: 'FLD-01' } }),
    );
    expect(result.current.data).toEqual([{ latitude: 1, longitude: 2, intensity: 0.5 }]);
  });

  it('surfaces errors from the API call', async () => {
    mockGet.mockRejectedValue(new Error('boom'));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useHeatmap('FLD-02'), { wrapper: makeWrapper(qc) });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
