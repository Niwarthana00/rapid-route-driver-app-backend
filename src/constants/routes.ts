export interface RouteHalt {
  halt_id: string;
  name: string;
  sequence_no: number;
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
  route_name: 'Pettah - Maharagama / Kottawa',
  start_location: 'Pettah Main Bus Stand',
  end_location: 'Kottawa Bus Stand',
  halts: [
    { halt_id: 'halt-01', name: 'Pettah Main Stand', sequence_no: 1, latitude: 6.9344, longitude: 79.8503 },
    { halt_id: 'halt-02', name: 'Town Hall', sequence_no: 2, latitude: 6.9147, longitude: 79.8653 },
    { halt_id: 'halt-03', name: 'Borella Junction', sequence_no: 3, latitude: 6.9142, longitude: 79.8778 },
    { halt_id: 'halt-04', name: 'Nugegoda Flyover', sequence_no: 4, latitude: 6.8711, longitude: 79.8885 },
    { halt_id: 'halt-05', name: 'Delkanda', sequence_no: 5, latitude: 6.8592, longitude: 79.8973 },
    { halt_id: 'halt-06', name: 'Maharagama Clock Tower', sequence_no: 6, latitude: 6.8481, longitude: 79.9265 },
    { halt_id: 'halt-07', name: 'Pannipitiya', sequence_no: 7, latitude: 6.8415, longitude: 79.9451 },
    { halt_id: 'halt-08', name: 'Kottawa Stand', sequence_no: 8, latitude: 6.8411, longitude: 79.9678 },
  ],
};

// In-memory halts registry to allow driver custom modifications without needing extra DB tables
export const routeHaltsStore: Map<string, RouteHalt[]> = new Map([
  [ROUTE_138.route_id, [...ROUTE_138.halts]],
]);
