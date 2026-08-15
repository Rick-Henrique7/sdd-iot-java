-- ============================================================
--  Agro-IoT Platform — PostgreSQL initialization
--  Creates isolated schemas per microservice, with restricted
--  roles aligned to the governance contract.
-- ============================================================

-- Timezone
SET timezone = 'UTC';

-- ---------- ISOLATED SCHEMAS ----------
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS fleet;
CREATE SCHEMA IF NOT EXISTS telemetry;

-- ---------- RESTRICTED ROLES ----------
-- Each service gets its own user, scoped to its own schema.
-- (Re-runnable: drop roles first to allow re-creation on init.)

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agrio_auth') THEN
        REVOKE ALL ON SCHEMA auth FROM agrio_auth;
        DROP ROLE agrio_auth;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agrio_fleet') THEN
        REVOKE ALL ON SCHEMA fleet FROM agrio_fleet;
        DROP ROLE agrio_fleet;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agrio_telemetry') THEN
        REVOKE ALL ON SCHEMA telemetry FROM agrio_telemetry;
        DROP ROLE agrio_telemetry;
    END IF;
END$$;

CREATE ROLE agrio_auth      WITH LOGIN PASSWORD 'agrio_auth_pwd';
CREATE ROLE agrio_fleet     WITH LOGIN PASSWORD 'agrio_fleet_pwd';
CREATE ROLE agrio_telemetry WITH LOGIN PASSWORD 'agrio_telemetry_pwd';

-- ---------- GRANTS ----------
GRANT USAGE, CREATE ON SCHEMA auth      TO agrio_auth;
GRANT USAGE, CREATE ON SCHEMA fleet     TO agrio_fleet;
GRANT USAGE, CREATE ON SCHEMA telemetry TO agrio_telemetry;

-- Default privileges for future objects inside each schema
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO agrio_auth;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
    GRANT USAGE, SELECT, UPDATE          ON SEQUENCES TO agrio_auth;

ALTER DEFAULT PRIVILEGES IN SCHEMA fleet
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO agrio_fleet;
ALTER DEFAULT PRIVILEGES IN SCHEMA fleet
    GRANT USAGE, SELECT, UPDATE          ON SEQUENCES TO agrio_fleet;

ALTER DEFAULT PRIVILEGES IN SCHEMA telemetry
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO agrio_telemetry;
ALTER DEFAULT PRIVILEGES IN SCHEMA telemetry
    GRANT USAGE, SELECT, UPDATE          ON SEQUENCES TO agrio_telemetry;
