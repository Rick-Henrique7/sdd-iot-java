/**
 * Wire contract for the STOMP `/topic/alerts` channel.
 *
 * Mirrors `alert-processing-service`'s `AlertDTO` record
 * (Change 004). The dashboard treats `severity` as the
 * single source of truth for the colour and the icon.
 */
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Alert {
  alertId: string;
  equipmentId: string;
  severity: AlertSeverity;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  message: string;
  /** ISO-8601 instant. */
  timestamp: string;
}
