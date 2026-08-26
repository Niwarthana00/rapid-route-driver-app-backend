# 📱 FRONTEND INTEGRATION GUIDE - RAPID ROUTE DRIVER MOBILE APP

This guide is formatted for the **React Native (Expo) Frontend Agent** to easily connect all 9 mobile app screens to the live **Node.js + PostgreSQL Backend REST API**.

---

## 1. Environment Configuration Setup (`.env`)

Add the following to your Expo React Native root directory's `.env` file:

```env
# Change IP to your local machine Wi-Fi IP address (e.g. 192.168.1.100) or localhost for emulator
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api/v1
```

> 💡 **Tip:** On physical mobile devices (Expo Go / standalone APK), use your computer's local Wi-Fi IP address (e.g., `http://192.168.1.X:5000/api/v1`) instead of `localhost`.

---

## 2. React Native API Axios Client (`src/services/api.ts`)

Create or update your API client configuration with automatic JWT authorization header injection from `@react-native-async-storage/async-storage`:

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic JWT Token Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified API Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Network error or server unavailable';
    return Promise.reject(new Error(message));
  }
);
```

---

## 3. Screen-by-Screen API Specification & Payloads

### 🔑 1. Authentication & Session (`AuthScreen.tsx`)

#### **A. Driver Login**
- **Endpoint:** `POST /driver/auth/login`
- **Request Body:**
```json
{
  "identifier": "driver@rapidroute.com",
  "password": "Password123!"
}
```
- **Response Data (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "profile": {
      "driver_id": "drv-001",
      "name": "Kamal Perera",
      "email": "driver@rapidroute.com",
      "phone": "0771234567",
      "nic_no": "881234567V",
      "license_no": "B9482910",
      "license_class": "Heavy Vehicle (Class A/B)",
      "license_expiry": "2026-08-27"
    },
    "assigned_vehicle": {
      "vehicle_id": "veh-138-01",
      "registration_number": "ND-4829",
      "model": "Leyland Viking 2022",
      "seating_capacity": 54
    }
  }
}
```

#### **B. Driver Registration**
- **Endpoint:** `POST /driver/auth/register`
- **Request Body:**
```json
{
  "name": "Kamal Perera",
  "email": "driver@rapidroute.com",
  "password": "Password123!",
  "phone": "0771234567",
  "nic_number": "881234567V",
  "license_number": "B9482910",
  "license_class": "Heavy Vehicle (Class A/B)",
  "license_expiry": "2026-08-27"
}
```

---

### 📊 2. Driver Dashboard (`DashboardScreen.tsx`)

- **Endpoint:** `GET /driver/dashboard`
- **Headers:** `Authorization: Bearer <token>`
- **Response Data (`200 OK`):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "summary": {
      "today_passengers": 42,
      "today_fuel_liters": 42.5,
      "next_doc_expiry_days": 2
    },
    "driver": {
      "driver_id": "drv-001",
      "name": "Kamal Perera",
      "license_number": "B9482910"
    },
    "vehicle": {
      "vehicle_id": "veh-138-01",
      "registration_number": "ND-4829",
      "model": "Leyland Viking 2022"
    },
    "active_trip": {
      "trip_id": "trip-active-01",
      "status": "IN_PROGRESS",
      "route_number": "138",
      "route_name": "Pettah - Maharagama / Kottawa",
      "start_location": "Pettah Main Bus Stand",
      "end_location": "Kottawa Bus Stand",
      "current_halt_index": 1,
      "passenger_count": 14,
      "start_time": "2026-08-25T02:40:00.000Z"
    }
  }
}
```

---

### 🚏 3. Route Halts Review & Management (`RouteHaltsScreen.tsx`)

#### **A. Fetch Halts List**
- **Endpoint:** `GET /driver/trips/active/halts` (or `GET /driver/routes/:routeId/halts`)
- **Headers:** `Authorization: Bearer <token>`
- **Response Data (`200 OK`):**
```json
{
  "success": true,
  "message": "Active route halts fetched successfully",
  "data": {
    "trip_id": "trip-active-01",
    "route_id": "route-138",
    "route_number": "138",
    "route_name": "Pettah to Maharagama",
    "current_halt_index": 0,
    "halts": [
      { "halt_id": "halt-01", "name": "Pettah Main Stand", "sequence_no": 1, "distance_km": 0, "eta_min": 0, "latitude": 6.9344, "longitude": 79.8503 },
      { "halt_id": "halt-02", "name": "Town Hall", "sequence_no": 2, "distance_km": 1.8, "eta_min": 6, "latitude": 6.9147, "longitude": 79.8653 },
      { "halt_id": "halt-03", "name": "Borella Junction", "sequence_no": 3, "distance_km": 3.5, "eta_min": 12, "latitude": 6.9142, "longitude": 79.8778 },
      { "halt_id": "halt-04", "name": "Nugegoda Flyover", "sequence_no": 4, "distance_km": 8.2, "eta_min": 24, "latitude": 6.8711, "longitude": 79.8885 },
      { "halt_id": "halt-05", "name": "Delkanda", "sequence_no": 5, "distance_km": 10.1, "eta_min": 30, "latitude": 6.8592, "longitude": 79.8973 },
      { "halt_id": "halt-06", "name": "Maharagama Clock Tower", "sequence_no": 6, "distance_km": 14.3, "eta_min": 40, "latitude": 6.8481, "longitude": 79.9265 },
      { "halt_id": "halt-07", "name": "Pannipitiya", "sequence_no": 7, "distance_km": 17.0, "eta_min": 48, "latitude": 6.8415, "longitude": 79.9451 },
      { "halt_id": "halt-08", "name": "Kottawa Stand", "sequence_no": 8, "distance_km": 20.4, "eta_min": 55, "latitude": 6.8411, "longitude": 79.9678 }
    ]
  }
}
```

#### **B. Edit Stop Name / Sequence**
- **Endpoint:** `PATCH /driver/trips/halts/:haltId`
- **Request Body:**
```json
{
  "name": "Town Hall Junction (Updated)",
  "sequence_no": 2
}
```

---

### 🗺️ 4. Active Trip Tracking (`ActiveTripMapScreen.tsx`)

#### **A. Start Trip**
- **Endpoint:** `POST /driver/trips/start`
- **Request Body:**
```json
{
  "route_id": "route-138"
}
```

#### **B. Complete Current Halt**
- **Endpoint:** `POST /driver/trips/halts/complete`
- **Request Body:**
```json
{
  "trip_id": "trip-active-01",
  "halt_id": "halt-01",
  "sequence_no": 1,
  "boarded_passengers": 6
}
```

#### **C. Live GPS Location Streaming**
- **Endpoint:** `POST /driver/location/ping`
- **Request Body:**
```json
{
  "trip_id": "trip-active-01",
  "latitude": 6.9344,
  "longitude": 79.8503,
  "speed": 34.5
}
```

---

### ⚠️ 5. Breakdown Incident Alert (`BreakdownReportScreen.tsx`)

- **Endpoint:** `POST /driver/breakdowns`
- **Request Body:**
```json
{
  "reason": "Engine issue",
  "location": "Near Nugegoda Flyover",
  "notes": "Engine overheating warning signal activated",
  "trip_id": "trip-active-01"
}
```
- **Response Data (`201 Created`):**
```json
{
  "success": true,
  "message": "Emergency breakdown alert broadcasted successfully",
  "data": {
    "alert_id": "alert-98102",
    "admin_notified": true,
    "passengers_notified": true,
    "message": "Emergency breakdown alert broadcasted to admin panel & waiting passengers successfully."
  }
}
```

---

### 🏁 6. Trip Completion (`TripCompletedScreen.tsx`)

- **Endpoint:** `POST /driver/trips/finish`
- **Request Body:**
```json
{
  "trip_id": "trip-active-01"
}
```
- **Response Data (`200 OK`):**
```json
{
  "success": true,
  "message": "Trip completed successfully",
  "data": {
    "trip_id": "trip-active-01",
    "status": "COMPLETED",
    "duration_minutes": 42,
    "completed_halts_count": 8,
    "total_passengers_carried": 38,
    "costs_summary": {
      "today_total": 18500.00,
      "monthly_total": 43200.00
    }
  }
}
```

---

### 📄 7. Compliance & Documents Expiry (`MyDocumentsScreen.tsx`)

#### **A. Fetch Documents List**
- **Endpoint:** `GET /driver/documents`
- **Response Data (`200 OK`):**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "warning_count": 1,
    "has_urgent_warning": true,
    "documents": [
      {
        "document_id": "doc-drv-01",
        "document_type": "Heavy Driving License",
        "expires_at": "2026-08-27",
        "status": "WARNING",
        "days_remaining": 2,
        "category": "DRIVER"
      },
      {
        "document_id": "doc-veh-01",
        "document_type": "Revenue License",
        "expires_at": "2026-09-08",
        "status": "VALID",
        "days_remaining": 14,
        "category": "VEHICLE"
      }
    ]
  }
}
```

#### **B. Upload Renewed Document**
- **Endpoint:** `POST /driver/documents/upload`
- **Request Body:**
```json
{
  "document_type": "Heavy Driving License",
  "expires_at": "2027-08-25",
  "file_url": "https://storage.rapidroute.com/docs/license-drv001.pdf",
  "category": "DRIVER"
}
```

---

### ⛽ 8. Costs & Fuel Log (`FuelLogScreen.tsx`)

#### **A. Fetch Expense Logs**
- **Endpoint:** `GET /driver/costs`
- **Response Data (`200 OK`):**
```json
{
  "success": true,
  "message": "Cost logs retrieved successfully",
  "data": {
    "today_total": 18500.00,
    "monthly_total": 43200.00,
    "recent_logs": [
      {
        "maintenance_id": "maint-01",
        "maintenance_type": "FUEL",
        "amount": "18500.00",
        "liters": "42.50",
        "description": "Ceypetco Filling Station - Maharagama",
        "logged_at": "2026-08-25T00:15:00.000Z"
      }
    ]
  }
}
```

#### **B. Log New Expense**
- **Endpoint:** `POST /driver/costs`
- **Request Body:**
```json
{
  "maintenance_type": "FUEL",
  "amount": 18500,
  "liters": 42.5,
  "description": "Ceypetco Maharagama Station"
}
```

---

### 👤 9. Profile & Settings (`ProfileScreen.tsx`)

#### **A. Fetch Profile**
- **Endpoint:** `GET /driver/profile`

#### **B. Update Profile**
- **Endpoint:** `PUT /driver/profile`
- **Request Body:**
```json
{
  "name": "Kamal Perera",
  "phone": "0771234567"
}
```
