-- PostgreSQL Database Schema for Rapid Route Driver App
-- Schemas: core (Drivers, Vehicles, Documents, Maintenance), biz (Trips, Trip Halt Logs, Breakdown Alerts)

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS biz;

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------------
-- CORE SCHEMA TABLES
----------------------------------------------------

-- 1. core.vehicles
CREATE TABLE IF NOT EXISTS core.vehicles (
    vehicle_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    seating_capacity INT NOT NULL DEFAULT 54,
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. core.drivers
CREATE TABLE IF NOT EXISTS core.drivers (
    driver_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nic_number VARCHAR(20) NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_class VARCHAR(50) NOT NULL DEFAULT 'Heavy Vehicle (Class A/B)',
    phone VARCHAR(20) NOT NULL,
    license_expiry DATE NOT NULL,
    assigned_vehicle_id VARCHAR(50) REFERENCES core.vehicles(vehicle_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. core.driver_documents
CREATE TABLE IF NOT EXISTS core.driver_documents (
    document_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    driver_id VARCHAR(50) NOT NULL REFERENCES core.drivers(driver_id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(255),
    expires_at DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VALID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. core.vehicle_documents
CREATE TABLE IF NOT EXISTS core.vehicle_documents (
    document_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES core.vehicles(vehicle_id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(255),
    expires_at DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VALID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. core.vehicle_maintenance
CREATE TABLE IF NOT EXISTS core.vehicle_maintenance (
    maintenance_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES core.vehicles(vehicle_id) ON DELETE CASCADE,
    driver_id VARCHAR(50) NOT NULL REFERENCES core.drivers(driver_id) ON DELETE CASCADE,
    maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('FUEL', 'REPAIR')),
    amount NUMERIC(10, 2) NOT NULL,
    liters NUMERIC(8, 2) DEFAULT 0,
    description TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


----------------------------------------------------
-- BIZ SCHEMA TABLES
----------------------------------------------------

-- 6. biz.trips
CREATE TABLE IF NOT EXISTS biz.trips (
    trip_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    driver_id VARCHAR(50) NOT NULL REFERENCES core.drivers(driver_id) ON DELETE CASCADE,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES core.vehicles(vehicle_id) ON DELETE CASCADE,
    route_id VARCHAR(50) NOT NULL DEFAULT 'route-138',
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    current_halt_index INT DEFAULT 1,
    passenger_count INT DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. biz.trip_halt_log
CREATE TABLE IF NOT EXISTS biz.trip_halt_log (
    log_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    trip_id VARCHAR(50) NOT NULL REFERENCES biz.trips(trip_id) ON DELETE CASCADE,
    halt_id VARCHAR(50) NOT NULL,
    sequence_no INT NOT NULL,
    boarded_passengers INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. biz.breakdown_alerts
CREATE TABLE IF NOT EXISTS biz.breakdown_alerts (
    alert_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    trip_id VARCHAR(50) NOT NULL REFERENCES biz.trips(trip_id) ON DELETE CASCADE,
    driver_id VARCHAR(50) NOT NULL REFERENCES core.drivers(driver_id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
