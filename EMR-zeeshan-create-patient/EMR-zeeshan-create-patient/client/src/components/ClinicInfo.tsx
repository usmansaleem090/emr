import React from 'react';
import { useClinic } from '../hooks/useClinic';

export const ClinicInfo: React.FC = () => {
  const { selectedClinic } = useClinic();

  if (!selectedClinic) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Please select a clinic from the header dropdown to view clinic information.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
        Selected Clinic: {selectedClinic.name}
      </h3>
      <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
        <p><strong>ID:</strong> {selectedClinic.id}</p>
        {selectedClinic.address && <p><strong>Address:</strong> {selectedClinic.address}</p>}
        {selectedClinic.phone && <p><strong>Phone:</strong> {selectedClinic.phone}</p>}
        {selectedClinic.email && <p><strong>Email:</strong> {selectedClinic.email}</p>}
        <p><strong>Status:</strong> {selectedClinic.status}</p>
      </div>
    </div>
  );
}; 