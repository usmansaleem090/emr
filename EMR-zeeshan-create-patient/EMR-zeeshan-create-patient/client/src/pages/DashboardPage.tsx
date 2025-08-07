import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserMd,
  faCalendarAlt,
  faHospital,
  faChartLine,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { ClinicInfo } from '../components/ClinicInfo';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 theme-transition">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <FontAwesomeIcon 
              icon={trend.isPositive ? faChartLine : faExclamationTriangle} 
              className="w-3 h-3 mr-1" 
            />
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon} className="text-white text-lg" />
      </div>
    </div>
  </div>
));

interface RecentActivity {
  id: string;
  type: 'appointment' | 'patient' | 'doctor' | 'clinic';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const ActivityItem: React.FC<{ activity: RecentActivity }> = React.memo(({ activity }) => {
  const statusColors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const statusIcons = {
    success: faCheckCircle,
    warning: faExclamationTriangle,
    error: faExclamationTriangle,
    info: faClock,
  };

  return (
    <div className="flex items-start space-x-3 p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className={`flex-shrink-0 ${statusColors[activity.status]}`}>
        <FontAwesomeIcon icon={statusIcons[activity.status]} className="w-4 h-4 mt-1" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {activity.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {activity.timestamp}
        </p>
      </div>
    </div>
  );
});

const DashboardPage: React.FC = React.memo(() => {
  const stats = useMemo(() => [
    {
      title: 'Total Patients',
      value: '2,847',
      icon: faUsers,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Active Doctors',
      value: '127',
      icon: faUserMd,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: { value: 3, isPositive: true },
    },
    {
      title: "Today's Appointments",
      value: '86',
      icon: faCalendarAlt,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      trend: { value: 8, isPositive: false },
    },
    {
      title: 'Total Clinics',
      value: '15',
      icon: faHospital,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      trend: { value: 0, isPositive: true },
    },
  ], []);

  const recentActivities: RecentActivity[] = useMemo(() => [
    {
      id: '1',
      type: 'appointment',
      title: 'New appointment scheduled',
      description: 'Dr. Johnson with Patient #2847 for tomorrow 10:00 AM',
      timestamp: '2 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'patient',
      title: 'Patient registration completed',
      description: 'Emily Davis successfully registered to City General Clinic',
      timestamp: '5 minutes ago',
      status: 'success',
    },
    {
      id: '3',
      type: 'doctor',
      title: 'Doctor availability updated',
      description: 'Dr. Smith updated availability for next week',
      timestamp: '12 minutes ago',
      status: 'info',
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Appointment cancellation',
      description: 'Patient #2145 cancelled appointment for today 3:00 PM',
      timestamp: '18 minutes ago',
      status: 'warning',
    },
    {
      id: '5',
      type: 'clinic',
      title: 'System maintenance alert',
      description: 'Scheduled maintenance for Downtown Clinic at 2:00 AM',
      timestamp: '1 hour ago',
      status: 'info',
    },
  ], []);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening in your EMR system today.
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Clinic Info - Demo of selected clinic */}
      <ClinicInfo />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 theme-transition">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Latest updates from your EMR system
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-4">
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 theme-transition">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Add New Patient</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule Appointment</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserMd} className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Add New Doctor</span>
                </div>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 theme-transition">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Server Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Backup Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Up to Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardPage;