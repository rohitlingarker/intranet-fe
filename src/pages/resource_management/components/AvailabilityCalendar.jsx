import React from 'react';

export default function AvailabilityCalendar() {
  // Calendar Grid Generation (Mock for Feb 2026)
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const startOffset = 0; // Starts on Sunday for simplicity of mock

  // Mock aggregated data per day
  const getDayStatus = (day) => {
    // Randomize slightly for visual variance
    const r = (day * 9301 + 49297) % 233280;
    const available = (r % 5) + 2;
    const partial = (r % 7) + 2;
    const allocated = 20 - available - partial;
    
    // Highlight specific day logic
    const isToday = day === 6;
    
    return { available, partial, allocated, isToday };
  };

  return (
    <div className="p-4">
      {/* Header controls would go here (Month selector), handled in parent for layout */}
      <div className="flex justify-between items-center mb-4">
         <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-gray-100 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
            <h2 className="text-lg font-bold text-slate-800">February 2026</h2>
            <button className="p-1 hover:bg-gray-100 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
         </div>
         <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Available</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Partial</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Allocated</span>
         </div>
      </div>

      <div className="grid grid-cols-7 gap-4 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-xs font-semibold text-slate-400 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 h-[500px]">
        {days.map(day => {
            const status = getDayStatus(day);
            return (
                <div 
                    key={day} 
                    className={`
                        relative border rounded-lg p-2 flex flex-col items-center justify-between transition-all hover:shadow-md cursor-pointer
                        ${status.isToday ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-red-50/30 border-gray-100'}
                    `}
                >
                    <span className={`text-sm font-medium ${status.isToday ? 'text-blue-700' : 'text-slate-600'}`}>{day}</span>
                    
                    {/* Status Dots Visualization */}
                    <div className="flex gap-1 mb-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="w-8 h-1 bg-emerald-400 rounded-full opacity-80" style={{width: `${status.available * 3}px`}}></div>
                            <div className="w-6 h-1 bg-amber-400 rounded-full opacity-80" style={{width: `${status.partial * 3}px`}}></div>
                            <div className="w-10 h-1 bg-red-400 rounded-full opacity-80" style={{width: `${status.allocated * 3}px`}}></div>
                        </div>
                    </div>
                    
                    {/* Hover tooltip structure (simplified visually here) */}
                    <div className="text-[10px] text-slate-500 font-mono">
                       {status.available}/{status.partial}/{status.allocated}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}