import React, { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faUserMd,
  faHospital,
  faCalendarAlt,
  faChartBar,
  faCog,
  faFileAlt,
  faUserShield,
  faShieldAlt,
  faTasks,
  faCalendarPlus,
  faChevronDown,
  faChevronUp,
  faBuilding,
  faCheckSquare
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAppSelector } from "../../redux/hooks";
import { usePermissions } from "../../hooks/usePermissions";
import { getUserAllowedRoutes, getParentRoutes, getSidebarRoutes } from "../../constants/routes";

interface SidebarProps {
  isCollapsed: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  badge?: string;
  children?: MenuItem[];
}

// Icon mapping for menu items
const iconMap: { [key: string]: any } = {
  LayoutDashboard: faTachometerAlt,
  Users: faUsers,
  UserCheck: faUserMd,
  Calendar: faCalendarAlt,
  Building2: faHospital,
  FileText: faChartBar,
  FileHeart: faFileAlt,
  Shield: faShieldAlt,
  UserCog: faUserShield,
  Settings: faCog,
  CheckSquare: faTasks,
};

export const Sidebar: React.FC<SidebarProps> = React.memo(({ isCollapsed }) => {
  const [location] = useLocation();
  const { isDark } = useTheme();
  const { user } = useAppSelector((state: any) => state.auth);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const { userPermissions } = usePermissions();

  const menuItems = useMemo(() => {
    const userType = user?.userType || "Patient";
    
    // Get allowed routes based on user type and permissions
    const allowedRoutes = getUserAllowedRoutes(userType, userPermissions);
    
    // Filter routes that should be shown in sidebar
    const sidebarRoutes = getSidebarRoutes(allowedRoutes);
    const parentRoutes = getParentRoutes(sidebarRoutes);
    
    // Create menu items based on sidebar routes
    const items: MenuItem[] = [];

    // Process each sidebar route
    sidebarRoutes.forEach(route => {
      const menuItem: MenuItem = {
        id: route.path.replace('/', ''),
        label: route.name,
        icon: route.icon ? iconMap[route.icon] : faCog,
        path: route.path,
      };

      // Add children if they exist and should be shown in sidebar
      if (route.children && route.children.length > 0) {
        const sidebarChildren = route.children.filter(child => child.showInSidebar !== false);
        if (sidebarChildren.length > 0) {
          menuItem.children = sidebarChildren.map(child => ({
            id: child.path.replace('/', ''),
            label: child.name,
            icon: child.icon ? iconMap[child.icon] : faCog,
            path: child.path,
          }));
        }
      }

      // Add badge for appointments
      if (route.path === '/appointments') {
        menuItem.badge = "5";
      }

      items.push(menuItem);
    });

    return items;
  }, [user?.userType, userPermissions]);

  // handlers
  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out theme-transition z-30 flex flex-col
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faUserMd} className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              EMR Pro
            </h1>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faUserMd} className="text-white text-sm" />
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = item.path && (location === item.path || location.startsWith(item.path + "/"));
            const isExpanded = expandedMenus.includes(item.id);
            const hasChildren = (item as any).children && (item as any).children.length > 0;

            return (
              <li key={item.id}>
                {hasChildren ? (
                  // Menu item with children (click to toggle)
                  <div
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer
                      ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}
                      hover:bg-gray-100 dark:hover:bg-gray-800
                    `}
                    onClick={() => toggleMenu(item.id)}
                  >
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                      />
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium truncate">{item.label}</span>
                      )}
                    </div>

                    {/* Toggle icon */}
                    {!isCollapsed && (
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        className="w-3 h-3 ml-2 text-gray-400"
                      />
                    )}
                  </div>
                ) : (
                  // Single menu item (click to navigate)
                  <Link href={item.path || "#"}>
                    <div
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer
                        ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}
                        hover:bg-gray-100 dark:hover:bg-gray-800
                      `}
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                        />
                        {!isCollapsed && (
                          <span className="ml-3 text-sm font-medium truncate">{item.label}</span>
                        )}
                      </div>

                      {/* Badge if exists */}
                      {!isCollapsed && (item as any).badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {(item as any).badge}
                        </span>
                      )}
                    </div>
                  </Link>
                )}

                {/* Children: Only show if expanded */}
                {!isCollapsed && hasChildren && isExpanded && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {(item as any).children.map((child: any) => {
                      const isChildActive =
                        location === child.path || location.startsWith(child.path + "/");

                      return (
                        <li key={child.id}>
                          <Link href={child.path}>
                            <div
                              className={`
                                flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all
                                ${isChildActive ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}
                              `}
                            >
                              <FontAwesomeIcon icon={child.icon} className="w-4 h-4" />
                              <span className="ml-2 text-sm">{child.label}</span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.userType === 'SuperAdmin' ? 'SA' : user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>

          {!isCollapsed && (
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.userType || "User"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
