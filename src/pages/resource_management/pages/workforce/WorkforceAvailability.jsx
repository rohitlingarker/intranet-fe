// src/resource_management/pages/WorkforceAvailability.jsx
import React, { useState } from 'react';
import { 
  Users, CheckCircle, Clock, AlertTriangle, 
  BarChart2, Calendar as CalIcon, Filter, 
  ChevronDown, Search, Bell, Settings, X 
} from 'lucide-react';

import { useAvailability } from '../../hooks/useAvailability';
import AvailabilityTimeline from '../../components/AvailabilityTimeline';
import ResourceDetailPanel from '../../components/ResourceDetailPanel';

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, colorClass, borderClass }) => (
  <div className={`bg-white p-4 rounded-xl border-l-4 shadow-sm flex items-center justify-between ${borderClass}`}>
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
      <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

const WorkforceAvailability = () => {
  // Use Custom Hook for all logic
  const { 
    resources, 
    kpis, 
    filters, 
    updateFilter, 
    selectedResource, 
    isPanelOpen, 
    handleResourceClick, 
    closePanel 
  } = useAvailability();

  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'calendar', 'table'

  return (
    <div className="p-6 bg-[#f8f9fc] min-h-screen font-sans">
      
      {/* 1. Header Area */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a174e]">RMS</h1>
          <p className="text-sm text-gray-500">Workforce Availability</p>
        </div>
        
        {/* Top Right Actions */}
        <div className="flex items-center gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search resources..." 
               className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
             />
           </div>
           <button className="p-2 text-gray-500 hover:bg-white rounded-lg transition"><Bell size={20}/></button>
           <button className="p-2 text-gray-500 hover:bg-white rounded-lg transition"><Settings size={20}/></button>
           <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">DM</div>
        </div>
      </div>

      {/* 2. KPI Cards Row - Dynamic Data */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        <StatCard icon={Users} title="Total Resources" value={kpis.total} colorClass="bg-blue-600" borderClass="border-blue-600" />
        <StatCard icon={CheckCircle} title="Fully Available" value={kpis.fullyAvailable} colorClass="bg-green-500" borderClass="border-green-500" />
        <StatCard icon={Users} title="Partially Available" value={kpis.partiallyAvailable} colorClass="bg-yellow-500" borderClass="border-yellow-500" />
        <StatCard icon={Users} title="Fully Allocated" value={kpis.fullyAllocated} colorClass="bg-red-500" borderClass="border-red-500" />
        <StatCard icon={Clock} title="Available (30d)" value={kpis.available30d} colorClass="bg-blue-400" borderClass="border-blue-400" />
        <StatCard icon={BarChart2} title="Bench Capacity" value={kpis.benchCapacity} colorClass="bg-indigo-500" borderClass="border-indigo-500" />
        <StatCard icon={AlertTriangle} title="Over-allocated" value={kpis.overAllocated} colorClass="bg-rose-600" borderClass="border-rose-600" />
      </div>

      <div className="flex gap-6 items-start">
        
        {/* 3. Sidebar Filters - Functional */}
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <Filter size={18}/> Filters
             </h3>
             {/* Simple reset for demo */}
             <button onClick={() => window.location.reload()} className="text-xs text-blue-600 hover:underline">Reset</button>
          </div>

          <div className="space-y-5">
            {/* Role Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Role / Skill</label>
              <div className="relative">
                <select 
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm appearance-none focus:outline-none focus:border-blue-500"
                  value={filters.role}
                  onChange={(e) => updateFilter('role', e.target.value)}
                >
                  <option>All Roles</option>
                  <option>Technical Lead</option>
                  <option>Senior Frontend Engineer</option>
                  <option>Backend Engineer</option>
                  <option>QA Lead</option>
                  <option>Cloud Architect</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-gray-400 pointer-events-none"/>
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Location</label>
              <div className="relative">
                <select 
                   className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm appearance-none focus:outline-none focus:border-blue-500"
                   value={filters.location}
                   onChange={(e) => updateFilter('location', e.target.value)}
                >
                  <option>All Locations</option>
                  <option>Bangalore</option>
                  <option>New York</option>
                  <option>London</option>
                  <option>Berlin</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-gray-400 pointer-events-none"/>
              </div>
            </div>

            {/* Sliders */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-gray-500">Experience</label>
                <span className="text-blue-600 font-bold">{filters.experience}+ yrs</span>
              </div>
              <input 
                type="range" min="0" max="20" 
                value={filters.experience}
                onChange={(e) => updateFilter('experience', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
               <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-gray-500">Max Allocation</label>
                <span className="text-blue-600 font-bold">{filters.allocationMax}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={filters.allocationMax}
                onChange={(e) => updateFilter('allocationMax', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Action Button */}
             <div className="pt-2">
               <button className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-2">
                  <AlertTriangle size={16}/> 1 Issue Found
               </button>
             </div>
          </div>
        </div>

        {/* 4. Main Content Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-200px)]">
           
           {/* View Toggle Tabs */}
           <div className="flex justify-between items-center mb-4">
             <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
               <button 
                 className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition ${viewMode === 'calendar' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                 onClick={() => setViewMode('calendar')}
               >
                 <CalIcon size={16}/> Calendar View
               </button>
               <button 
                 className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition ${viewMode === 'timeline' ? 'bg-white shadow text-[#263383]' : 'text-gray-500 hover:text-gray-700'}`}
                 onClick={() => setViewMode('timeline')}
               >
                 <BarChart2 size={16} className="rotate-90"/> Timeline
               </button>
               <button 
                 className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                 onClick={() => setViewMode('table')}
               >
                 Table View
               </button>
             </div>

             {/* Time Scale Toggles (Visual Only for now) */}
             <div className="flex bg-white rounded-lg border border-gray-200 text-xs font-medium overflow-hidden">
                <button className="px-3 py-1.5 hover:bg-gray-50 border-r border-gray-200">Resource</button>
                <button className="px-3 py-1.5 hover:bg-gray-50 border-r border-gray-200 text-gray-400">Role</button>
                <button className="px-3 py-1.5 hover:bg-gray-50 border-r border-gray-200">Week</button>
                <button className="px-3 py-1.5 bg-[#263383] text-white">Month</button>
                <button className="px-3 py-1.5 hover:bg-gray-50 border-l border-gray-200">Quarter</button>
                <button className="px-3 py-1.5 hover:bg-gray-50 border-l border-gray-200 ml-2">Today</button>
             </div>

             {/* Legend */}
             <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500"></span> Partial</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500"></span> Allocated</span>
             </div>
           </div>

           {/* Timeline Component */}
           {viewMode === 'timeline' ? (
             <AvailabilityTimeline resources={resources} onViewProfile={handleResourceClick} />
           ) : (
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center h-full text-gray-400">
               {viewMode} view logic not implemented in this enhancement phase.
             </div>
           )}

        </div>
      </div>

      {/* 5. Slide-Over Panel */}
      <ResourceDetailPanel 
        isOpen={isPanelOpen} 
        resource={selectedResource} 
        onClose={closePanel} 
      />

    </div>
  );
};

export default WorkforceAvailability;