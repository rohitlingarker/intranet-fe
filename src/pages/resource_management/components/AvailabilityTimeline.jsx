// src/resource_management/components/AvailabilityTimeline.jsx
import React from 'react';

const AvailabilityTimeline = ({ resources, onViewProfile }) => {
  // Timeline Date Range Logic (Mocked for current view: Today - 30 to Today + 60)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30); // Start 30 days ago
  const totalDays = 90; // Show 90 days total window

  const getPosition = (dateStr) => {
    const date = new Date(dateStr);
    const diffTime = date - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays / totalDays) * 100;
  };

  const getBarColor = (percentage, type) => {
    if (type === 'Tentative') return 'bg-gray-300 border-gray-400 text-gray-600 pattern-diagonal-lines'; // Mock pattern class
    if (percentage >= 100) return 'bg-[#ef4444]'; // Red
    if (percentage >= 70) return 'bg-[#f59e0b]'; // Yellow
    if (percentage > 0) return 'bg-[#eab308]'; // Yellow-ish
    return 'bg-[#22c55e]'; // Green
  };
  
  const getBarWidth = (start, end) => {
     let w = getPosition(end) - getPosition(start);
     if(w < 0) return 0;
     return w;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Timeline Header */}
      <div className="flex border-b border-gray-200 text-xs font-semibold text-gray-500 bg-gray-50">
        <div className="w-64 p-3 border-r border-gray-200 shrink-0 uppercase tracking-wider">Resource</div>
        <div className="flex-1 relative h-10">
            {/* Simple Date Markers */}
            <div className="absolute left-0 top-3">Jan 26</div>
            <div className="absolute left-[33%] top-3 font-bold text-blue-600">Today</div>
            <div className="absolute left-[33%] top-0 bottom-0 border-l-2 border-blue-500 border-dashed h-full z-10 pointer-events-none"></div>
            <div className="absolute left-[66%] top-3">Mar 26</div>
            <div className="absolute right-0 top-3">Apr 26</div>
        </div>
      </div>

      {/* Timeline Rows */}
      <div className="overflow-y-auto flex-1">
        {resources.map((res) => (
          <div 
            key={res.id} 
            className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors group h-14"
            onClick={() => onViewProfile(res)}
          >
            {/* Resource Info Column */}
            <div className="w-64 p-3 border-r border-gray-200 shrink-0 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                  {res.id}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 leading-none group-hover:text-[#263383]">
                    {res.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">{res.role}</p>
                </div>
              </div>
            </div>

            {/* Timeline Bars Area */}
            <div className="flex-1 relative items-center flex px-2 cursor-pointer">
               {/* Today Line (Repeating for visual alignment across rows) */}
               <div className="absolute left-[33%] top-0 bottom-0 border-l border-gray-100 pointer-events-none"></div>

               {res.allocations.length === 0 ? (
                 <div className="w-full text-center text-xs text-gray-400 italic">Available on Bench</div>
               ) : (
                 res.allocations.map((alloc) => {
                   const left = getPosition(alloc.start);
                   const width = getBarWidth(alloc.start, alloc.end);
                   
                   // Don't render if out of view (simple check)
                   if (left + width < 0 || left > 100) return null;

                   return (
                     <div
                       key={alloc.id}
                       className={`absolute h-6 rounded-md text-[10px] text-white flex items-center justify-center px-2 truncate shadow-sm transition-transform hover:scale-105 hover:z-20 ${getBarColor(alloc.percentage, alloc.type)}`}
                       style={{ 
                         left: `${Math.max(0, left)}%`, 
                         width: `${Math.min(100 - Math.max(0, left), width)}%` 
                       }}
                       title={`${alloc.project}: ${alloc.start} to ${alloc.end} (${alloc.percentage}%)`}
                     >
                       {alloc.project} ({alloc.percentage}%)
                     </div>
                   );
                 })
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityTimeline;