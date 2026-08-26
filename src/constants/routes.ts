export interface RouteHalt {
  halt_id: string;
  name: string;
  sequence_no: number;
  distance_km: number;
  eta_min: number;
  latitude: number;
  longitude: number;
}

export interface RouteDefinition {
  route_id: string;
  route_number: string;
  route_name: string;
  start_location: string;
  end_location: string;
  halts: RouteHalt[];
}

export const ROUTE_138: RouteDefinition = {
  route_id: 'route-138',
  route_number: '138',
  route_name: 'Pettah to Maharagama',
  start_location: 'Pettah Main Bus Stand',
  end_location: 'Kottawa Bus Stand',
  halts: [
    { halt_id: 'halt-01', name: 'Pettah Main Stand', sequence_no: 1, distance_km: 0, eta_min: 0, latitude: 6.9344, longitude: 79.8503 },
    { halt_id: 'halt-02', name: 'Town Hall', sequence_no: 2, distance_km: 1.8, eta_min: 6, latitude: 6.9147, longitude: 79.8653 },
    { halt_id: 'halt-03', name: 'Borella Junction', sequence_no: 3, distance_km: 3.5, eta_min: 12, latitude: 6.9142, longitude: 79.8778 },
    { halt_id: 'halt-04', name: 'Nugegoda Flyover', sequence_no: 4, distance_km: 8.2, eta_min: 24, latitude: 6.8711, longitude: 79.8885 },
    { halt_id: 'halt-05', name: 'Delkanda', sequence_no: 5, distance_km: 10.1, eta_min: 30, latitude: 6.8592, longitude: 79.8973 },
    { halt_id: 'halt-06', name: 'Maharagama Clock Tower', sequence_no: 6, distance_km: 14.3, eta_min: 40, latitude: 6.8481, longitude: 79.9265 },
    { halt_id: 'halt-07', name: 'Pannipitiya', sequence_no: 7, distance_km: 17.0, eta_min: 48, latitude: 6.8415, longitude: 79.9451 },
    { halt_id: 'halt-08', name: 'Kottawa Stand', sequence_no: 8, distance_km: 20.4, eta_min: 55, latitude: 6.8411, longitude: 79.9678 },
  ],
};

// In-memory halts registry to allow driver custom modifications without needing extra DB tables
export const routeHaltsStore: Map<string, RouteHalt[]> = new Map([
  [ROUTE_138.route_id, [...ROUTE_138.halts]],
]);

