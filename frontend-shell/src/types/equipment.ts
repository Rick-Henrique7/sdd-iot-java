/**
 * Wire contract for `GET /api/v1/fleet` (fleet-mapping-service,
 * Change 005). The dashboard's Fleet table and the "Frota Ativa"
 * KPI both consume this shape.
 */
export type EquipmentType = 'TRACTOR' | 'HARVESTER' | 'SPRAYER';
export type EquipmentStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'INACTIVE';

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  type: EquipmentType;
  status: EquipmentStatus;
  horometerHours: number;
  /** ISO date (yyyy-MM-dd) or null when never maintained. */
  lastMaintenanceDate: string | null;
}
