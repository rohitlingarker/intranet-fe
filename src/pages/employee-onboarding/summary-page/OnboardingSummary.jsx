import React, { useState } from 'react';
import {
  Users, CheckCircle, Clock, AlertCircle, FileText,
  ShieldCheck, Calendar, Filter, Search, ChevronDown,
  MoreVertical, Activity, Briefcase
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Mock Data
const metrics = [
  { title: 'Total Candidates', value: '1,248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Completed', value: '856', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { title: 'In Progress', value: '342', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { title: 'Pending Actions', value: '45', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  { title: 'Docs Pending', value: '28', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
  { title: 'BGV In Progress', value: '112', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
  { title: 'Upcoming (7 Days)', value: '34', icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-100' },
];

const funnelData = [
  { stage: 'Offer Accepted', count: 450 },
  { stage: 'Doc Submission', count: 380 },
  { stage: 'HR Verification', count: 320 },
  { stage: 'BGV Verification', count: 280 },
  { stage: 'Employee Creation', count: 250 },
  { stage: 'Completed', count: 210 }
];

const completionRateData = [
  { name: 'Jan', rate: 65, total: 100 }, { name: 'Feb', rate: 70, total: 120 }, { name: 'Mar', rate: 72, total: 115 },
  { name: 'Apr', rate: 80, total: 130 }, { name: 'May', rate: 85, total: 140 }, { name: 'Jun', rate: 88, total: 150 }
];

const documentVerificationData = [
  { name: 'Verified', value: 650, color: '#10B981' },
  { name: 'Pending', value: 240, color: '#F59E0B' },
  { name: 'Rejected', value: 45, color: '#EF4444' }
];

const deptData = [
  { name: 'Engineering', completed: 85, inProgress: 40 },
  { name: 'Sales', completed: 45, inProgress: 20 },
  { name: 'Marketing', completed: 30, inProgress: 15 },
  { name: 'HR', completed: 15, inProgress: 5 },
  { name: 'Finance', completed: 25, inProgress: 10 }
];

const pendingActions = [
  { action: 'Documents pending verification', count: 28, urgency: 'high', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
  { action: 'HR approvals pending', count: 12, urgency: 'medium', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { action: 'Background verification pending', count: 18, urgency: 'high', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-100' },
  { action: 'Employee ID generation pending', count: 8, urgency: 'medium', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  { action: 'Company email creation pending', count: 14, urgency: 'low', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
];

const recentActivities = [
  { candidate: 'Sarah Jenkins', role: 'Frontend Developer', action: 'Candidate uploaded documents', time: '10 mins ago' },
  { candidate: 'Michael Chen', role: 'Product Manager', action: 'HR verified documents', time: '45 mins ago' },
  { candidate: 'David Smith', role: 'UX Designer', action: 'Background verification initiated', time: '2 hours ago' },
  { candidate: 'Emily Patel', role: 'Software Engineer', action: 'Employee record created', time: '3 hours ago' },
];

const upcomingJoineries = [
  { candidate: 'Alex Rodriguez', role: 'Data Scientist', department: 'Engineering', date: 'Oct 15, 2024', status: 'All Clear' },
  { candidate: 'Jessica Wong', role: 'Marketing Lead', department: 'Marketing', date: 'Oct 16, 2024', status: 'Pending BGV' },
  { candidate: 'David Lee', role: 'Sales Executive', department: 'Sales', date: 'Oct 18, 2024', status: 'All Clear' },
  { candidate: 'Robert Taylor', role: 'DevOps Engineer', department: 'Engineering', date: 'Oct 18, 2024', status: 'Pending IT' },
];

const alerts = [
  { type: 'warning', text: 'Missing documents for 12 candidates in Engineering.', icon: FileText, bg: 'bg-amber-50', border: 'border-amber-200', textCol: 'text-amber-800' },
  { type: 'danger', text: 'SLA breached: HR Verification pending for 5 candidates over 48 hours.', icon: AlertCircle, bg: 'bg-rose-50', border: 'border-rose-200', textCol: 'text-rose-800' },
  { type: 'danger', text: 'Background verification delays detected for Sales department.', icon: ShieldCheck, bg: 'bg-rose-50', border: 'border-rose-200', textCol: 'text-rose-800' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between items-center text-sm gap-4">
            <span className="flex items-center text-slate-600">
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-800">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function OnboardingSummary() {
  const [activeFilter, setActiveFilter] = useState('All Departments');

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 font-sans">

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Onboarding Dashboard</h1>
          <p className="text-slate-500 mt-1">Company-wide overview of candidate onboarding</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-48"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200">
            Export Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        {['Department', 'Joining Date', 'Onboarding Stage', 'Status'].map((filter, i) => (
          <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-transparent">
            {filter} <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Metric Cards - 4 Column Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.slice(0, 4).map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-2.5 rounded-xl ${metric.bg}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-slate-500 text-sm font-medium">{metric.title}</h4>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">{metric.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {metrics.slice(4).map((metric, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${metric.bg}`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <div>
              <h4 className="text-slate-500 text-sm font-medium">{metric.title}</h4>
              <h2 className="text-2xl font-semibold text-slate-800 mt-0.5">{metric.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="flex flex-col gap-3 mb-8">
        {alerts.map((alert, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.bg} ${alert.border} ${alert.textCol}`}>
            <alert.icon className={`w-5 h-5 shrink-0 mt-0.5`} />
            <span className="text-sm font-medium">{alert.text}</span>
          </div>
        ))}
      </div>

      {/* Funnel & Area Chart row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

        {/* Onboarding Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Onboarding Pipeline</h3>
            <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} width={120} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={28}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(238, 70%, ${55 + (index * 6)}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Rate Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Completion Rate Trend</h3>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12% vs Last Month</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rate" name="Completion Rate (%)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Document Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Document Status</h3>
          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={documentVerificationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {documentVerificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">935</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {documentVerificationData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Department Progress</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View All</button>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} barSize={36} />
                <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#DBEAFE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4 - Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Action Required</h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-full">18 High</span>
          </div>
          <div className="space-y-3">
            {pendingActions.map((task, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className={`p-2 rounded-lg shrink-0 h-fit ${task.bg}`}>
                  <task.icon className={`w-4 h-4 ${task.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.action}</h4>
                  <div className="flex items-center mt-1 gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {task.count} items pending
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${task.urgency === 'high' ? 'bg-rose-500' : task.urgency === 'medium' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          </div>
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            {recentActivities.map((activity, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-500"></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{activity.action}</h4>
                  <p className="text-xs text-slate-500 mt-1"><span className="font-medium text-slate-700">{activity.candidate}</span> • {activity.role}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Joinings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Joining This Week</h3>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">{upcomingJoineries.length} Total</span>
          </div>
          <div className="space-y-3">
            {upcomingJoineries.map((person, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{person.candidate}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{person.role}</p>
                  <p className="text-xs text-slate-400 mt-1">{person.date}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${person.status === 'All Clear' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {person.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            View Calendar
          </button>
        </div>

      </div>

    </div>
  );
}