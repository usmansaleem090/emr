import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export interface User {
  id: number;
  username: string;
  email: string;
  userType: string;
  clinicId?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const useAuth = () => {
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return {
    user: user as User | null,
    token,
    isAuthenticated,
  };
};