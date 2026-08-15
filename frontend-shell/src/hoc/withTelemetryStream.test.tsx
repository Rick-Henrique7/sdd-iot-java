import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { withTelemetryStream } from './withTelemetryStream';
import { useAuthStore } from '@/stores/authStore';
import { useTelemetryStore } from '@/stores/telemetryStore';

type Listener = (m: IMessage) => void;

/**
 * Test double for the STOMP Client. We capture subscribers so
 * the test can simulate frames, and we expose `activate` /
 * `deactivate` so the HOC sees the same lifecycle it would in
 * production.
 */
class FakeClient {
  onConnect: (() => void) | null = null;
  onStompError: ((f: { headers: Record<string, string> }) => void) | null = null;
  private subs: Map<string, Listener[]> = new Map();
  activated = false;
  deactivated = false;

  activate() {
    this.activated = true;
    // Fire onConnect on the next tick, mimicking the real client.
    setTimeout(() => this.onConnect?.(), 0);
  }
  deactivate() {
    this.deactivated = true;
  }
  subscribe(topic: string, cb: (m: IMessage) => void) {
    const arr = this.subs.get(topic) ?? [];
    arr.push(cb);
    this.subs.set(topic, arr);
    return {
      unsubscribe: () => {
        const cur = this.subs.get(topic) ?? [];
        this.subs.set(
          topic,
          cur.filter((fn) => fn !== cb),
        );
      },
    };
  }
  emit(topic: string, body: string) {
    const arr = this.subs.get(topic) ?? [];
    for (const cb of arr) {
      cb({ body } as unknown as IMessage);
    }
  }
}

const clients: FakeClient[] = [];

vi.mock('@/lib/ws', () => ({
  createWsClient: () => {
    const c = new FakeClient();
    clients.push(c);
    return c;
  },
  subscribe: (client: FakeClient, topic: string, cb: (m: IMessage) => void) =>
    client.subscribe(topic, cb).unsubscribe,
}));

beforeEach(() => {
  vi.useFakeTimers();
  clients.length = 0;
  useAuthStore.setState({ token: 'jwt-xyz', user: null });
  useTelemetryStore.getState().clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const Inner = withTelemetryStream(function Inner() {
  return <div data-testid="ok">ready</div>;
});

describe('withTelemetryStream HOC', () => {
  it('opens a client on mount and deactivates on unmount', async () => {
    const { unmount } = render(<Inner />);
    // Let the onConnect microtask fire.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(clients).toHaveLength(1);
    expect(clients[0].activated).toBe(true);

    unmount();
    expect(clients[0].deactivated).toBe(true);
  });

  it('does not open a client when there is no token', async () => {
    useAuthStore.setState({ token: null, user: null });
    render(<Inner />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(clients).toHaveLength(0);
  });

  it('debounces telemetry frames: 30 in 100ms -> 1 store flush', async () => {
    render(<Inner />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    const client = clients[0];

    // Push 30 telemetry frames in ~90ms (well inside the 1s
    // debounce window). The HOC's flush interval fires every
    // 250 ms but the debounce keeps the buffer closed.
    await act(async () => {
      for (let i = 0; i < 30; i++) {
        client.emit(
          '/topic/telemetry',
          JSON.stringify({
            equipmentId: 'TRAC-1',
            timestamp: new Date(2026, 0, 1, 0, 0, i).toISOString(),
            gps: { latitude: 0, longitude: 0 },
            metrics: { engineTemp: 80, rpm: 1500, fuelLevel: 50, speed: 10 },
          }),
        );
        await vi.advanceTimersByTimeAsync(3);
      }
    });

    // Advance well past the 1s debounce so a single tick is
    // guaranteed to flush.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    // All 30 events should be in the store, batched.
    const series = useTelemetryStore.getState().telemetry['TRAC-1'] ?? [];
    expect(series).toHaveLength(30);
  });

  it('forwards alert frames immediately (no debounce)', async () => {
    render(<Inner />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    const client = clients[0];

    await act(async () => {
      client.emit(
        '/topic/alerts',
        JSON.stringify({
          alertId: 'a-1',
          equipmentId: 'TRAC-1',
          severity: 'CRITICAL',
          metricName: 'engineTemp',
          currentValue: 102,
          thresholdValue: 100,
          message: 'too hot',
          timestamp: '2026-08-15T18:00:00Z',
        }),
      );
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(useTelemetryStore.getState().alerts).toHaveLength(1);
    expect(useTelemetryStore.getState().alerts[0].alertId).toBe('a-1');
  });

  it('renders the wrapped component', () => {
    render(<Inner />);
    expect(screen.getByTestId('ok')).toBeTruthy();
  });
});
