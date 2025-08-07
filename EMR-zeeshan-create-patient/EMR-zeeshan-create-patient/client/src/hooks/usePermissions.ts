import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { getUserAllowedRoutes, canAccessRoute, type RoutePermission } from '@/constants/routes';
import { api } from '@/utils/apiClient';

export const usePermissions = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.id) {
        setUserPermissions([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await api.get(`/api/users/${user.id}/permissions`);
        setUserPermissions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
        setUserPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id]);

  const userType = user?.userType || '';
  const allowedRoutes: RoutePermission[] = getUserAllowedRoutes(userType, userPermissions);

  const hasRouteAccess = (path: string): boolean => {
    return canAccessRoute(path, userType, userPermissions);
  };

  const hasPermission = (moduleName: string, operationName: string): boolean => {
    // Check specific permissions rather than assuming all permissions for any user type
    return userPermissions?.some((permission: any) => 
      permission.moduleName === moduleName && 
      permission.operationName === operationName
    ) ?? false;
  };

  return {
    userType,
    userPermissions,
    allowedRoutes,
    hasRouteAccess,
    hasPermission,
    isLoading,
  };
};