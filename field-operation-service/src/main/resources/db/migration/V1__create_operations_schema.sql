-- V1: create operations schema tables for field-operation-service
-- Applied by Flyway on first boot (production only; tests use ddl-auto=create-drop).

CREATE TABLE IF NOT EXISTS operations.work_orders (
    id              VARCHAR(64)  PRIMARY KEY,
    equipment_id    VARCHAR(64)  NOT NULL,
    field_id        VARCHAR(64),
    operator_id     VARCHAR(64)  NOT NULL,
    status          VARCHAR(32)  NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operator_notes  TEXT
);

CREATE INDEX IF NOT EXISTS idx_work_orders_equipment_id ON operations.work_orders (equipment_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_operator_id  ON operations.work_orders (operator_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status       ON operations.work_orders (status);

CREATE TABLE IF NOT EXISTS operations.downtime_records (
    id              VARCHAR(64)  PRIMARY KEY,
    equipment_id    VARCHAR(64)  NOT NULL,
    operator_id     VARCHAR(64)  NOT NULL,
    reason          VARCHAR(64)  NOT NULL,
    start_time      TIMESTAMP    NOT NULL,
    end_time        TIMESTAMP,
    comments        TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_downtime_equipment_id ON operations.downtime_records (equipment_id);
CREATE INDEX IF NOT EXISTS idx_downtime_operator_id  ON operations.downtime_records (operator_id);
CREATE INDEX IF NOT EXISTS idx_downtime_reason       ON operations.downtime_records (reason);
