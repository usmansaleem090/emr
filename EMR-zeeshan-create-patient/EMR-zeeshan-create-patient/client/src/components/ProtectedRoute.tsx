import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { usePermissions } from '../hooks/usePermissions';
import { canAccessRoute } from '../constants/routes';
import { LoadingSpinner } from './UI/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPath }) => {
  const { user } = useAppSelector((state: any) => state.auth);
  const { userPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  const userType = user?.userType || 'Patient';
  const hasAccess = canAccessRoute(requiredPath, userType, userPermissions);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};