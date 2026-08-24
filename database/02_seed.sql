-- Initial Seed Data for Rapid Route Driver App
-- Strictly matching core and biz tables

-- Seed Vehicle
INSERT INTO core.vehicles (vehicle_id, registration_number, seating_capacity, model)
VALUES ('veh-138-01', 'ND-4829', 54, 'Leyland Viking 2022')
ON CONFLICT (registration_number) DO NOTHING;

-- Seed Driver (Email: driver@rapidroute.com / Phone: 0771234567 / Password: Password123!)
INSERT INTO core.drivers (driver_id, name, email, password_hash, nic_number, license_number, license_class, phone, license_expiry, assigned_vehicle_id)
VALUES (
    'drv-001',
    'Kamal Perera',
    'driver@rapidroute.com',
    '$2a$10$7R9f6L03E8S2v8Jp.oTz2.4M/b8X5F5o1lV1O6S4l7C0V2K4U8E3G', -- Password123!
    '881234567V',
    'B9482910',
    'Heavy Vehicle (Class A/B)',
    '0771234567',
    CURRENT_DATE + INTERVAL '2 days',
    'veh-138-01'
)
ON CONFLICT (email) DO NOTHING;

-- Seed Active Trip for Driver drv-001
INSERT INTO biz.trips (trip_id, driver_id, vehicle_id, route_id, status, current_halt_index, passenger_count, start_time)
VALUES ('trip-active-01', 'drv-001', 'veh-138-01', 'route-138', 'IN_PROGRESS', 1, 14, CURRENT_TIMESTAMP - INTERVAL '25 minutes')
ON CONFLICT (trip_id) DO NOTHING;

-- Seed Driver Compliance Documents
INSERT INTO core.driver_documents (document_id, driver_id, document_type, expires_at, status)
VALUES 
    ('doc-drv-01', 'drv-001', 'Heavy Driving License', CURRENT_DATE + INTERVAL '2 days', 'WARNING'),
    ('doc-drv-02', 'drv-001', 'Medical Fitness Certificate', CURRENT_DATE + INTERVAL '180 days', 'VALID')
ON CONFLICT (document_id) DO NOTHING;

-- Seed Vehicle Compliance Documents
INSERT INTO core.vehicle_documents (document_id, vehicle_id, document_type, expires_at, status)
VALUES 
    ('doc-veh-01', 'veh-138-01', 'Revenue License (Western Province)', CURRENT_DATE + INTERVAL '14 days', 'VALID'),
    ('doc-veh-02', 'veh-138-01', 'Passenger Insurance Policy', CURRENT_DATE + INTERVAL '45 days', 'VALID'),
    ('doc-veh-03', 'veh-138-01', 'Emission Test Certificate', CURRENT_DATE + INTERVAL '1 day', 'WARNING')
ON CONFLICT (document_id) DO NOTHING;

-- Seed Maintenance / Fuel Records
INSERT INTO core.vehicle_maintenance (maintenance_id, vehicle_id, driver_id, maintenance_type, amount, liters, description, logged_at)
VALUES 
    ('maint-01', 'veh-138-01', 'drv-001', 'FUEL', 18500.00, 42.5, 'Ceypetco Filling Station - Maharagama', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
    ('maint-02', 'veh-138-01', 'drv-001', 'REPAIR', 4500.00, 0, 'Tyre Air Pressure & Brake Pad Check', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT (maintenance_id) DO NOTHING;
