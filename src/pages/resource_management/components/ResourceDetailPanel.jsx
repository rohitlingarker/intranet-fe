// src/resource_management/components/ResourceDetailPanel.jsx
import React from 'react';
import { X, MapPin, Briefcase, Calendar, Star } from 'lucide-react';

const ResourceDetailPanel = ({ resource, isOpen, onClose }) => {
  if (!resource) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
              {resource.id}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{resource.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-500">{resource.role}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} className="text-gray-400"/> {resource.location}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase size={16} className="text-gray-400"/> {resource.experience} years exp
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} className="text-gray-400"/> Avail: {resource.availableFrom}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star size={16} className="text-gray-400"/> Billable
            </div>
          </div>

          {/* Current Allocation Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-900">Current Allocation</span>
              <span className="font-bold text-gray-900">
                {resource.allocations.reduce((acc, curr) => acc + curr.percentage, 0)}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${resource.allocations.reduce((acc, curr) => acc + curr.percentage, 0)}%` }} 
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
               <span>Project: {resource.allocations[0]?.project || "None"}</span>
               <span className="cursor-pointer hover:text-blue-600 flex items-center">
                 Next: Project Keystone →
               </span>
            </div>
          </div>

          {/* Allocation Timeline (Mini) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Allocation Timeline</h3>
            <div className="h-16 bg-gray-50 rounded border border-gray-100 relative p-2 overflow-hidden flex items-center">
               {/* Just a visual representation of bars */}
               {resource.allocations.map((alloc, i) => (
                 <div 
                   key={i}
                   className={`h-8 rounded ${i % 2 === 0 ? 'bg-red-400' : 'bg-green-500'}`}
                   style={{ 
                     width: `${alloc.percentage}%`, 
                     marginRight: '2px' 
                   }}
                 />
               ))}
               {resource.allocations.length === 0 && <span className="text-xs text-gray-400 w-full text-center">No active allocations</span>}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
              <span>2025-08-10</span>
              <span className="text-blue-500 font-bold">Today</span>
              <span>2026-06-26</span>
            </div>
            {/* List of projects */}
            <div className="mt-3 space-y-2">
              {resource.allocations.map(alloc => (
                <div key={alloc.id} className="flex justify-between text-xs text-gray-600 border-b border-gray-50 pb-1">
                  <span>{alloc.project}</span>
                  <span className="font-medium">{alloc.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
             <h3 className="text-sm font-semibold text-gray-900 mb-3">Skill Match</h3>
             <div className="flex flex-wrap gap-2">
               {resource.skills.map(skill => (
                 <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                   {skill}
                 </span>
               ))}
             </div>
          </div>

          {/* Utilization Trend (Chart) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Utilization Trend (6 months)</h3>
            <div className="flex items-end justify-between h-24 gap-2">
               {resource.utilizationTrend.map((val, idx) => (
                 <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                   <div 
                     className="w-full bg-[#ef4444] rounded-t-sm transition-all duration-500 group-hover:bg-[#dc2626]" 
                     style={{ height: `${val}%`, opacity: val > 0 ? 1 : 0.2 }}
                   />
                   <span className="text-[10px] text-gray-400">
                     {['J','F','M','A','M','J'][idx]}
                   </span>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ResourceDetailPanel;