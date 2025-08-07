import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faSun,
  faMoon,
  faBell,
  faSearch,
  faSignOutAlt,
  faUser,
  faCog,
  faChevronDown,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../context/ThemeContext';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useClinic } from '../../hooks/useClinic';
import { SearchableDropdown } from '../UI/SearchableDropdown';

interface HeaderProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ isCollapsed, onToggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess } = useToastNotification();
  
  // Get clinic state using custom hook
  const { clinics, selectedClinic, loading, loadClinics, selectClinic } = useClinic();

  const handleLogout = React.useCallback(() => {
    dispatch(logoutUser());
    showSuccess('Logged out successfully');
  }, [dispatch, showSuccess]);

  // Fetch clinics on component mount - only run once
  React.useEffect(() => {
    // Only fetch if clinics array is empty
    if (clinics.length === 0) {
      loadClinics();
    }
  }, []); // Empty dependency array to run only once

  const handleClinicSelect = React.useCallback((clinic: any) => {
    selectClinic(clinic);
  }, [selectClinic]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 theme-transition">
      <div className="flex items-center justify-between h-16 px-4">
        
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>

          {/* Clinic Selector */}
          <div className="hidden md:block">
            <SearchableDropdown
              options={clinics}
              value={selectedClinic}
              onSelect={handleClinicSelect}
              placeholder="Select a clinic"
              loading={loading}
              className="w-80"
              icon={faBuilding}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
              <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">Super Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-3" />
                  Profile Settings
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-3" />
                  Account Settings
                </a>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});