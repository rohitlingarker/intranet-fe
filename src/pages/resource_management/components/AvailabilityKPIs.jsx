import React from 'react';

// Simplified icon component for reuse
const KpiIcon = ({ colorClass, path }) => (
  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} bg-opacity-10 mr-3`}>
    <svg className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
       {path}
    </svg>
  </div>
);

const KPICard = ({ label, value, color, iconPath, subtext }) => {
    // Map basic color names to Tailwind classes
    const colorMap = {
        blue: 'bg-blue-600',
        green: 'bg-emerald-500',
        amber: 'bg-amber-400',
        red: 'bg-red-500',
        indigo: 'bg-indigo-500',
        orange: 'bg-orange-500'
    };
    
    const baseColor = colorMap[color] || 'bg-blue-600';

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center min-w-[180px]">
            <KpiIcon colorClass={baseColor} path={iconPath} />
            <div>
                <div className="text-sm text-slate-500 font-medium whitespace-nowrap">{label}</div>
                <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {value}
                    {subtext && <span className="text-xs font-normal text-slate-400">{subtext}</span>}
                </div>
            </div>
        </div>
    );
};

export default function AvailabilityKPIs({ data }) {
    // SVG Paths
    const icons = {
        users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
        check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
        clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
        alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            <KPICard label="Total Resources" value={data.total} color="blue" iconPath={icons.users} />
            <KPICard label="Fully Available" value={data.available} color="green" iconPath={icons.check} />
            <KPICard label="Partially Available" value={data.partial} color="amber" iconPath={icons.users} />
            <KPICard label="Fully Allocated" value={data.allocated} color="red" iconPath={icons.users} />
            <KPICard label="Available (30d)" value={data.available30d} color="indigo" iconPath={icons.clock} />
            <KPICard label="Bench Capacity" value={`${data.bench}%`} color="blue" iconPath={icons.chart} />
            <KPICard label="Over-allocated" value={data.overAllocated} color="red" iconPath={icons.alert} />
            <KPICard label="Utilization" value={`${data.utilization}%`} color="blue" iconPath={icons.chart} />
        </div>
    );
}