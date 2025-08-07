# Clinic Selector Feature

## Overview
The clinic selector replaces the search bar in the header with a dropdown that allows users to select a clinic. The selected clinic is stored in Redux state and is available throughout the entire application.

## Implementation Details

### Redux Setup
- **Clinic Slice**: `client/src/redux/slices/clinicSlice.ts`
  - Manages clinics list, selected clinic, loading state, and errors
  - Uses async thunk to fetch clinics from API
  - Provides actions to set selected clinic

### Custom Hook
- **useClinic Hook**: `client/src/hooks/useClinic.ts`
  - Provides easy access to clinic state throughout the app
  - Returns: `{ clinics, selectedClinic, loading, error, loadClinics, selectClinic }`

### Components
- **Header Component**: `client/src/components/Layout/Header.tsx`
  - Contains the clinic selector dropdown
  - Fetches clinics on mount
  - Updates selected clinic when user makes selection

- **ClinicInfo Component**: `client/src/components/ClinicInfo.tsx`
  - Demo component showing how to access selected clinic
  - Displays clinic information when a clinic is selected

## Usage

### Accessing Selected Clinic in Any Component
```tsx
import { useClinic } from '../hooks/useClinic';

const MyComponent = () => {
  const { selectedClinic } = useClinic();
  
  if (!selectedClinic) {
    return <div>Please select a clinic</div>;
  }
  
  return <div>Current clinic: {selectedClinic.name}</div>;
};
```

### API Endpoint
- **URL**: `http://localhost:5010/api/clinics`
- **Method**: GET
- **Response**: Array of clinic objects with properties:
  - `id`: number
  - `name`: string
  - `address`: string (optional)
  - `phone`: string (optional)
  - `email`: string (optional)
  - `status`: string
  - `createdAt`: string
  - `updatedAt`: string

## Features
- ✅ Fetches clinics from API using Redux Toolkit thunk
- ✅ Stores selected clinic in Redux state
- ✅ Available throughout the entire application
- ✅ Loading states and error handling
- ✅ Responsive design with dark mode support
- ✅ TypeScript support with proper typing

## State Management
The clinic state is managed in Redux with the following structure:
```typescript
interface ClinicState {
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  loading: boolean;
  error: string | null;
}
```

## Demo
The `ClinicInfo` component on the Dashboard page demonstrates how to access and display the selected clinic information. 