import React from 'react';
import { useLocation } from 'wouter';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from './breadcrumb';
import { ROUTES } from '../../constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faChevronRight,
  faUsers,
  faUserMd,
  faCalendarAlt,
  faHospital,
  faChartLine,
  faFileText,
  faFileAlt,
  faShield,
  faUserCog,
  faUserCheck,
  faCog,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';

// Icon mapping for route icons
const iconMap: { [key: string]: any } = {
  'LayoutDashboard': faHome,
  'Users': faUsers,
  'UserCheck': faUserMd,
  'Calendar': faCalendarAlt,
  'Building2': faBuilding,
  'FileText': faFileText,
  'FileHeart': faFileAlt,
  'Shield': faShield,
  'UserCog': faUserCog,
  'Settings': faCog,
};

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: any;
  isCurrentPage?: boolean;
}

export const BreadcrumbsContainer: React.FC = () => {
  const [location] = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard/Home
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/dashboard',
      icon: faHome,
    });

    // Build breadcrumb trail
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
     const isNumericId = /^\d+$/.test(segment);
      let route = ROUTES.find(r => r.path === currentPath);
      if (!route && isNumericId) {
        const pathWithoutId = currentPath.replace(/\/\d+$/, '/:id');
        route = ROUTES.find(r => r.path === pathWithoutId);
      }
      
      if (route) {
        if (!isNumericId) {
          breadcrumbs.push({
            label: route.name,
            path: currentPath,
            icon: route.icon ? iconMap[route.icon] : undefined,
            isCurrentPage: index === pathSegments.length - 1,
          });
        }
      } else if (!isNumericId) {
        // Handle non-numeric segments that don't match routes
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
          isCurrentPage: index === pathSegments.length - 1,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard page
  if (location === '/dashboard') {
    return null;
  }

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.path}>
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {item.icon && (
                      <FontAwesomeIcon 
                        icon={item.icon} 
                        className="w-4 h-4 text-muted-foreground" 
                      />
                    )}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={item.path}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {item.icon && (
                      <FontAwesomeIcon 
                        icon={item.icon} 
                        className="w-4 h-4" 
                      />
                    )}
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};