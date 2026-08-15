import type { AlertSeverity } from '@/types/alert';

const COLOUR: Record<AlertSeverity, string> = {
  INFO: 'bg-info',
  WARNING: 'bg-accent',
  CRITICAL: 'bg-critical',
};

const RING: Record<AlertSeverity, string> = {
  INFO: 'ring-info/40',
  WARNING: 'ring-accent/40',
  CRITICAL: 'ring-critical/40',
};

interface SeverityDotProps {
  severity: AlertSeverity;
  size?: 'sm' | 'md';
  withRing?: boolean;
}

/**
 * Tiny coloured dot for the alert feed. Matches the brand
 * palette so CRITICAL = red, WARNING = yellow, INFO = blue.
 */
export function SeverityDot({
  severity,
  size = 'sm',
  withRing = false,
}: SeverityDotProps) {
  const dim = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';
  return (
    <span
      aria-label={severity}
      title={severity}
      className={`inline-block shrink-0 rounded-full ${dim} ${COLOUR[severity]} ${
        withRing ? `ring-2 ${RING[severity]}` : ''
      }`}
    />
  );
}
