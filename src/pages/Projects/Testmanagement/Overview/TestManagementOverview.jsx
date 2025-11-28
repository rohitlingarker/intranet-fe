// src/pages/Projects/TestManagement/TestManagementOverview.jsx
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { ArrowUpRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// Mock data for Overview
const COVERAGE_DATA = [
  { name: 'Covered', value: 78, color: '#10b981' }, // Emerald-500
  { name: 'Uncovered', value: 22, color: '#e2e8f0' }, // Slate-200
];

const EXECUTION_DATA = [
  { name: 'Pass', value: 45, color: '#10b981' },
  { name: 'Fail', value: 12, color: '#ef4444' },
  { name: 'Block', value: 5, color: '#f59e0b' },
  { name: 'Pending', value: 38, color: '#94a3b8' },
];

const DEFECT_TREND = [
  { name: 'Day 1', open: 5, closed: 2 },
  { name: 'Day 2', open: 8, closed: 4 },
  { name: 'Day 3', open: 12, closed: 8 },
  { name: 'Day 4', open: 12, closed: 24 },
];

const TestManagementOverview = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Test Coverage</span>
            <span className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-slate-800">78%</div>
          <div className="text-xs text-slate-400 mt-1">Goal: 85% coverage</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Execution</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Clock size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-slate-800">45%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Defects</span>
            <span className="p-1.5 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-slate-800">12</div>
          <div className="flex items-center gap-1 text-xs text-red-500 mt-1 font-medium">
            <ArrowUpRight size={12} /> +2 from yesterday
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Critical Issues</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={16} /></span>
          </div>
          <div className="text-3xl font-bold text-slate-800">2</div>
          <div className="text-xs text-slate-500 mt-1">T-103, T-108</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Execution Progress</h3>
          <div className="flex items-center justify-between">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={EXECUTION_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {EXECUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-slate-800">100</span>
                <span className="text-xs text-slate-400">Total</span>
              </div>
            </div>
            <div className="flex-1 pl-8 space-y-3">
              {EXECUTION_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: item.color }}></span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Defect Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Defect Status Trend</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEFECT_TREND} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="open" fill="#ef4444" radius={[4, 4, 0, 0]} name="Open Defects" barSize={20} />
                <Bar dataKey="closed" fill="#10b981" radius={[4, 4, 0, 0]} name="Closed Defects" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Go to Test Plans', 'Continue Execution', 'View Reports'].map((action, i) => (
          <button key={i} className="py-3 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
            {action} <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestManagementOverview;
