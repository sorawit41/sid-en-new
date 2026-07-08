-- =============================================================================
-- ENGINSPECT - Full Database Schema (PostgreSQL)
-- Energy Audit & Equipment Management System
-- Version 2.0 - Complete Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS
-- =============================================================================
CREATE TABLE users (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    role           VARCHAR(50)  NOT NULL DEFAULT 'engineer',  -- 'admin' | 'engineer' | 'manager' | 'viewer'
    avatar_url     VARCHAR(500),
    created_at     TIMESTAMPTZ  DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 2. FACTORIES
-- =============================================================================
CREATE TABLE factories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    location    VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 3. CATEGORIES  (Equipment Type)
-- =============================================================================
CREATE TABLE categories (
    id          VARCHAR(50)  PRIMARY KEY,   -- 'chiller' | 'compressor' | 'boiler' | 'pump' | 'cooling' | 'electrical'
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    icon        VARCHAR(100)               -- Lucide icon name e.g. 'Snowflake', 'Wind'
);

-- =============================================================================
-- 4. EQUIPMENTS
-- =============================================================================
CREATE TABLE equipments (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id        UUID         NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    category_id       VARCHAR(50)  NOT NULL REFERENCES categories(id),
    tag_number        VARCHAR(100) NOT NULL,            -- e.g. 'CH-01', 'AC-02'
    department        VARCHAR(255),                     -- e.g. 'อาคารผลิต 1', 'Utility'
    brand             VARCHAR(255),
    model             VARCHAR(255),
    rated_spec        VARCHAR(255),                     -- e.g. '500 TR', '75 kW'
    manufacturing_year INTEGER,
    power_kw          DECIMAL(10,2),
    capacity          DECIMAL(10,2),                    -- TR for chiller, GPM for pump, etc.
    efficiency        DECIMAL(10,4),                    -- kW/TR for chiller, etc.
    notes             TEXT,
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 5. INSPECTIONS  (Audit History)
-- =============================================================================
CREATE TABLE inspections (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id    UUID         NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    inspector_id    UUID         REFERENCES users(id) ON DELETE SET NULL,
    inspection_date TIMESTAMPTZ  NOT NULL,
    summary         TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 6. CHILLER_CALCULATIONS  (Audit calc results from ChillerCalcModal)
-- =============================================================================
CREATE TABLE chiller_calculations (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id    UUID         REFERENCES equipments(id) ON DELETE CASCADE,
    inspection_id   UUID         REFERENCES inspections(id) ON DELETE SET NULL,
    calculated_by   UUID         REFERENCES users(id) ON DELETE SET NULL,

    -- Inputs
    cooling_type    VARCHAR(20)  NOT NULL DEFAULT 'water',   -- 'water' | 'air'
    chws_temp_f     DECIMAL(6,2),   -- Chilled Water Supply Temp (°F)
    chwr_temp_f     DECIMAL(6,2),   -- Chilled Water Return Temp (°F)
    chw_flow_gpm    DECIMAL(8,2),   -- Chilled Water Flow (GPM)
    power_input_kw  DECIMAL(8,2),   -- Measured Power Input (kW)
    load_pct        DECIMAL(5,2),   -- % Load
    op_hours_day    DECIMAL(4,1),   -- Operating Hours/Day
    op_days_year    INTEGER,        -- Operating Days/Year
    elec_rate       DECIMAL(6,3),   -- Electricity Rate (Baht/kWh)
    refrigerant     VARCHAR(20),    -- e.g. 'R-134a', 'R-123'

    -- Condenser (Water Cooled)
    cws_temp_f      DECIMAL(6,2),   -- Condenser Water Supply (°F)
    cwr_temp_f      DECIMAL(6,2),   -- Condenser Water Return (°F)
    cw_flow_gpm     DECIMAL(8,2),

    -- Air Cooled
    dry_bulb_temp_f DECIMAL(6,2),

    -- Calculated Results
    cooling_tr      DECIMAL(10,3),  -- Cooling Capacity (TR)
    cooling_kw      DECIMAL(10,3),  -- Cooling Capacity (kW)
    cop             DECIMAL(6,4),   -- Coefficient of Performance
    eer             DECIMAL(6,4),   -- Energy Efficiency Ratio
    kw_per_tr       DECIMAL(6,4),   -- Specific Power (kW/TR)
    heat_rej_kw     DECIMAL(10,3),  -- Heat Rejection (kW)
    heat_balance_pct DECIMAL(6,2),  -- Heat Balance (%)
    carnot_eff_pct  DECIMAL(6,2),   -- Carnot Efficiency (%)

    calculated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 7. MEASURES  (Energy Conservation Measures - ECMs)
-- =============================================================================
CREATE TABLE measures (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id    UUID         NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,

    name            VARCHAR(255) NOT NULL,
    energy_type     VARCHAR(10)  NOT NULL CHECK (energy_type IN ('elec', 'heat')),
    status          VARCHAR(50)  NOT NULL DEFAULT 'proposed',   -- 'proposed' | 'approved' | 'implemented' | 'rejected'

    -- Savings Calculation Inputs
    savings_pct     DECIMAL(5,2),    -- % Power Reduction
    target_kw_tr    DECIMAL(6,4),    -- Target Efficiency for chiller replacement
    op_hours_yr     INTEGER,         -- Annual Operating Hours

    -- Calculated Results
    savings_kwh_yr  DECIMAL(14,2),
    savings_baht_yr DECIMAL(14,2),
    investment_cost DECIMAL(14,2),
    payback_years   DECIMAL(6,2),
    ghg_ton_yr      DECIMAL(10,3),   -- GHG Reduction (tCO2e/yr)

    proposed_date   DATE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 8. REPORT_PARAMS  (Custom parameters for M&V Reports)
-- =============================================================================
CREATE TABLE report_params (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID         NOT NULL,    -- FK added after reports table created
    param_label     VARCHAR(255) NOT NULL,
    before_value    VARCHAR(255),
    after_value     VARCHAR(255),
    sort_order      INTEGER      DEFAULT 0
);

-- =============================================================================
-- 9. REPORTS  (Measurement & Verification - M&V Reports)
-- =============================================================================
CREATE TABLE reports (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id    UUID         REFERENCES equipments(id) ON DELETE SET NULL,
    measure_id      UUID         REFERENCES measures(id) ON DELETE SET NULL,
    created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,

    -- Header
    document_no     VARCHAR(100) UNIQUE NOT NULL,
    title           VARCHAR(500) NOT NULL,
    factory_name    VARCHAR(255),
    department      VARCHAR(255),
    source_method   VARCHAR(255),   -- 'การตรวจวัดและวิเคราะห์' | etc.
    measure_type    VARCHAR(100),   -- 'No/Low Cost' | 'Medium Cost' | 'High Cost'
    objective       TEXT,
    equip_main      VARCHAR(255),
    equip_aux       VARCHAR(255),
    date_start      DATE,
    date_end        DATE,

    -- Authors
    author          VARCHAR(255),
    consultant      VARCHAR(255),
    approver        VARCHAR(255),

    -- Before
    before_date     DATE,
    before_inspector VARCHAR(255),
    before_kw       DECIMAL(10,2),
    before_hrs      INTEGER,
    before_issue    TEXT,

    -- After
    after_date      DATE,
    after_inspector VARCHAR(255),
    after_kw        DECIMAL(10,2),
    after_hrs       INTEGER,
    after_action    TEXT,
    after_result    TEXT,

    -- Summary
    savings_kwh     DECIMAL(14,2),
    savings_baht    DECIMAL(14,2),
    investment_cost DECIMAL(14,2),
    payback_years   DECIMAL(6,2),
    conclusion      TEXT,
    recommend       TEXT,

    -- Photos (store as JSONB arrays of {url, caption})
    before_photos   JSONB  DEFAULT '[]',
    after_photos    JSONB  DEFAULT '[]',

    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Add FK from report_params to reports
ALTER TABLE report_params
    ADD CONSTRAINT fk_report_params_report
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE;

-- =============================================================================
-- 10. SYSTEM_SETTINGS
-- =============================================================================
CREATE TABLE system_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       JSONB        NOT NULL,
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- INDEXES  (Performance Optimization)
-- =============================================================================
CREATE INDEX idx_equipments_factory_id     ON equipments(factory_id);
CREATE INDEX idx_equipments_category_id    ON equipments(category_id);
CREATE INDEX idx_inspections_equipment_id  ON inspections(equipment_id);
CREATE INDEX idx_inspections_date          ON inspections(inspection_date DESC);
CREATE INDEX idx_measures_equipment_id     ON measures(equipment_id);
CREATE INDEX idx_measures_status           ON measures(status);
CREATE INDEX idx_reports_equipment_id      ON reports(equipment_id);
CREATE INDEX idx_reports_created_at        ON reports(created_at DESC);
CREATE INDEX idx_chiller_calc_equipment_id ON chiller_calculations(equipment_id);

-- =============================================================================
-- TRIGGERS  (auto-update updated_at)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_factories_updated_at    BEFORE UPDATE ON factories    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_equipments_updated_at   BEFORE UPDATE ON equipments   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_measures_updated_at     BEFORE UPDATE ON measures     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reports_updated_at      BEFORE UPDATE ON reports      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated_at     BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
