import React from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available at this path

const DemandSLATab = ({ demand }) => {
    const isBreached = demand.slaDays < 0;
    const isAtRisk = demand.slaDays > 0 && demand.slaDays <= 5;
    const statusColor = isBreached ? 'text-rose-600' : isAtRisk ? 'text-amber-600' : 'text-slate-600';
    const statusBg = isBreached ? 'bg-rose-500' : isAtRisk ? 'bg-amber-500' : 'bg-slate-400';

    const agingStates = [
        { state: 'Demand Raised', enteredOn: 'Jan 10, 2024', timeSpent: '2 Days', slaActive: 'Yes' },
        { state: 'Validation', enteredOn: 'Jan 12, 2024', timeSpent: '3 Days', slaActive: 'Yes' },
        { state: 'PM Approval', enteredOn: 'Jan 15, 2024', timeSpent: '5 Days', slaActive: 'Yes' },
        { state: 'BU Head Pending', enteredOn: 'Jan 20, 2024', timeSpent: 'Current', slaActive: 'Yes' },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-2">
            {/* 1. SLA SUMMARY — TOP GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        label: 'SLA Status',
                        value: isBreached ? 'Breached' : isAtRisk ? 'At Risk' : 'Healthy',
                        sub: <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className={cn("h-full", statusBg)} style={{ width: isBreached ? '100%' : '60%' }} />
                        </div>
                    },
                    {
                        label: 'Net Aging',
                        value: `${demand.slaDays > 0 ? '+' : ''}${demand.slaDays} Days`,
                        color: statusColor
                    },
                    {
                        label: 'SLA Threshold',
                        value: '30 Days',
                        sub: <span className="text-[10px] font-medium text-slate-400">Standard Fulfillment</span>
                    },
                    {
                        label: isBreached ? 'Overdue' : 'Time Remaining',
                        value: `${Math.abs(demand.slaDays)} Days`,
                        color: statusColor
                    }
                ].map((metric, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                        <div className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
                            <span className={metric.color}>{metric.value}</span>
                        </div>
                        {metric.sub}
                    </div>
                ))}
            </div>

            {/* 2. AGING BREAKDOWN — PER STATE TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Aging by State Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">State</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Entered On</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Time Spent</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">SLA Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agingStates.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-900">{row.state}</td>
                                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">{row.enteredOn}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-700">{row.timeSpent}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-emerald-600">{row.slaActive}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. SLA TIMELINE BAR — ANALYTICAL VERSION */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-2 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">SLA Fulfillment Timeline</h3>
                    <span className="text-[10px] font-bold text-slate-400">T-30 DAY HORIZON</span>
                </div>

                <div className="px-4 py-8 relative">
                    {/* Linear Progress Track */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                        {/* Markers */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300 z-10" />
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-amber-400 z-10" />
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-rose-500 z-10" />

                        {/* Current Position indicator */}
                        <div
                            className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-4 border-white shadow-md z-20 transition-all duration-700", statusBg)}
                            style={{ left: `${Math.min(100, Math.max(0, (30 - demand.slaDays) / 30 * 100))}%` }}
                        >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] font-bold text-white px-2 py-0.5 rounded pointer-events-none whitespace-nowrap">
                                CURRENT DAY {30 - demand.slaDays}
                            </div>
                        </div>

                        {/* Progress Fill */}
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000", statusBg)}
                            style={{ width: `${Math.min(100, Math.max(0, (30 - demand.slaDays) / 30 * 100))}%` }}
                        />
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between mt-4">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-slate-900">Created</span>
                            <span className="text-[9px] font-medium text-slate-400">T-0</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-amber-600">Warning</span>
                            <span className="text-[9px] font-medium text-slate-400">T-15</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-rose-600">Breach</span>
                            <span className="text-[9px] font-medium text-slate-400">T-30</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandSLATab;
