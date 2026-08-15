/**
 * Wire contract for the STOMP `/topic/telemetry` channel.
 *
 * Mirrors `alert-processing-service`'s `TelemetryMessage` record
 * (Change 008). Field names are camelCase to match the JSON the
 * Spring service emits.
 */
export interface TelemetryEvent {
  equipmentId: string;
  /** ISO-8601 instant. */
  timestamp: string;
  gps: GpsCoordinates;
  metrics: TelemetryMetrics;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface TelemetryMetrics {
  engineTemp: number;
  rpm: number;
  fuelLevel: number;
  speed: number;
}
