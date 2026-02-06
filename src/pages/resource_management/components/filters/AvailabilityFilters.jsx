import React from 'react';

const FilterSection = ({ title, children, isOpen = true }) => (
  <div className="mb-6 border-b border-gray-100 pb-6 last:border-0">
    <div className="flex justify-between items-center mb-3 cursor-pointer">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <svg className="w-3 h-3 text-slate-400 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
    </div>
    {isOpen && <div>{children}</div>}
  </div>
);

export default function AvailabilityFilters() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
        </h2>
        <button className="text-xs text-blue-600 font-medium hover:underline">Reset</button>
      </div>

      <FilterSection title="Role / Skill">
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
            <option>All Roles</option>
            <option>Technical Lead</option>
            <option>Senior Frontend Engineer</option>
            <option>Backend Engineer</option>
        </select>
        <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 flex items-center gap-1">
                Java <button>×</button>
            </span>
        </div>
      </FilterSection>

      <FilterSection title="Location">
         <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Locations</option>
            <option>Bangalore</option>
            <option>New York</option>
            <option>London</option>
         </select>
      </FilterSection>

      <FilterSection title="Experience: 0–15 yrs">
         <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
         <div className="flex justify-between text-xs text-slate-400 mt-1">
             <span>0</span>
             <span>15+</span>
         </div>
      </FilterSection>

      <FilterSection title="Allocation: 0–100%">
         <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
         <div className="flex justify-between text-xs text-slate-400 mt-1">
             <span>0%</span>
             <span>100%</span>
         </div>
      </FilterSection>

      <FilterSection title="Project / Account">
         <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Projects</option>
            <option>Project Atlas</option>
            <option>Project Beacon</option>
         </select>
      </FilterSection>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors">
          <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
              <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs">!</span>
              1 Issue Found
          </div>
          <span className="text-red-700">×</span>
      </div>
    </div>
  );
}