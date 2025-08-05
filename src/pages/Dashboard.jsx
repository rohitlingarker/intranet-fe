import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, PlaneTakeoff, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const moduleCards = [
    {
      title: 'User Management',
      description: 'Manage employees, roles, and permissions',
      icon: Users,
      href: '/users',
      color: 'bg-[#263383]',
      stats: '245 active users'
    },
    {
      title: 'Project Management',
      description: 'Track projects, deadlines, and team progress',
      icon: FolderKanban,
      href: '/projects',
      color: 'bg-[#3548b6]',
      stats: '12 active projects'
    },
    {
      title: 'Leave Management',
      description: 'Handle leave requests and approvals',
      icon: PlaneTakeoff,
      href: '/leave',
      color: 'bg-[#b22a4f]',
      stats: '8 pending requests'
    },
    {
      title: 'Timesheets',
      description: 'Track time and generate reports',
      icon: Clock,
      href: '/timesheets',
      color: 'bg-[#ff3d72]',
      stats: 'Today: 6.5 hours'
    },
    {
      title: 'Calendar',
      description: 'View events, meetings, and deadlines',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-[#d23369]',
      stats: '5 events today'
    }
  ];

  const quickStats = [
    { label: 'Total Employees', value: '245', change: '+12', icon: Users, positive: true },
    { label: 'Active Projects', value: '12', change: '+2', icon: FolderKanban, positive: true },
    { label: 'Pending Approvals', value: '8', change: '-3', icon: AlertCircle, positive: false },
    { label: 'Completed Tasks', value: '89%', change: '+5%', icon: CheckCircle, positive: true }
  ];

  const recentActivity = [
    { action: 'New user registration', user: 'Sarah Johnson', time: '2 hours ago', type: 'user' },
    { action: 'Project deadline updated', user: 'Mike Chen', time: '4 hours ago', type: 'project' },
    { action: 'Leave request approved', user: 'Emily Davis', time: '6 hours ago', type: 'leave' },
    { action: 'Timesheet submitted', user: 'David Wilson', time: '1 day ago', type: 'timesheet' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className={`h-4 w-4 ${stat.positive ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm ml-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <stat.icon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Cards */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleCards.map((card, index) => (
              <Link
                key={index}
                to={card.href}
                className="group bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-[#263383]"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${card.color} group-hover:scale-105 transition-transform`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#263383] transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">{card.description}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">{card.stats}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-[#ff3d72] rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">by {activity.user}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3">System Announcements</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  System maintenance scheduled for this weekend.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  New employee onboarding process updated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;