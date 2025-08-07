import React, { useState, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { LocationSelector } from '../clinic/LocationSelector';
import { BreadcrumbsContainer } from '../UI/BreadcrumbsContainer';
import { useLocation } from '../../context/LocationContext';
import { useAppSelector } from '../../redux/store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = React.memo(({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { selectedLocation, setSelectedLocation } = useLocation();
  const { user } = useAppSelector((state: any) => state.auth);

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <Header isCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
        
        {/* Page Content */}
        <main className="p-4">
          {/* Breadcrumbs */}
          <BreadcrumbsContainer />
          
          {/* Location Selector for clinic users */}
          {/* <LocationSelector 
            currentUser={user}
            selectedLocation={selectedLocation}
            onLocationSelected={setSelectedLocation}
          />
           */}
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          },
        }}
      />
    </div>
  );
});