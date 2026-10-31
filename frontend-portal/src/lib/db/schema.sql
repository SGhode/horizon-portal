-- ==============================================================================
-- Aura Workforce / Horizon Portal: Leave and Attendance Schema DDL
-- Phase 2, Day 6, Task 6: Leave and Attendance Self-Service
-- ==============================================================================

-- 1. Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    default_days_per_year INT NOT NULL DEFAULT 0,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    color VARCHAR(32) NOT NULL DEFAULT '#3b82f6',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL,
    leave_type_id VARCHAR(64) NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    year INT NOT NULL,
    allocated_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    used_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    pending_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    available_days DECIMAL(5,2) GENERATED ALWAYS AS (allocated_days - used_days - pending_days) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_leave_year UNIQUE (employee_id, leave_type_id, year),
    CONSTRAINT chk_allocated_non_negative CHECK (allocated_days >= 0),
    CONSTRAINT chk_used_non_negative CHECK (used_days >= 0),
    CONSTRAINT chk_pending_non_negative CHECK (pending_days >= 0),
    CONSTRAINT chk_available_non_negative CHECK (allocated_days - used_days - pending_days >= 0)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON leave_balances (employee_id, year);

-- 3. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL,
    employee_name VARCHAR(128) NOT NULL,
    leave_type_id VARCHAR(64) NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count DECIMAL(5,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(64),
    rejection_reason TEXT,
    CONSTRAINT chk_valid_date_range CHECK (start_date <= end_date),
    CONSTRAINT chk_positive_days CHECK (days_count > 0)
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests (employee_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_overlap ON leave_requests (employee_id, status, start_date, end_date);

-- 4. Holidays Table
CREATE TABLE IF NOT EXISTS holidays (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    date DATE NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL DEFAULT 'NATIONAL' CHECK (type IN ('NATIONAL', 'COMPANY', 'OPTIONAL')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays (date);

-- 5. Monthly Attendance Table
CREATE TABLE IF NOT EXISTS attendance_monthly (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL,
    employee_name VARCHAR(128) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    year INT NOT NULL,
    total_working_days INT NOT NULL DEFAULT 0,
    present_days INT NOT NULL DEFAULT 0,
    absent_days INT NOT NULL DEFAULT 0,
    late_arrivals INT NOT NULL DEFAULT 0,
    half_days INT NOT NULL DEFAULT 0,
    on_leave_days INT NOT NULL DEFAULT 0,
    attendance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_attendance_month UNIQUE (employee_id, month),
    CONSTRAINT chk_attendance_percentage CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100)
);

CREATE INDEX IF NOT EXISTS idx_attendance_monthly_employee ON attendance_monthly (employee_id, month DESC);
