import React from 'react';

const DemandOverviewTab = ({ demand }) => {
    return (
        <div className="space-y-6 max-w-6xl mx-auto py-2">
            {/* Main Content Grid: 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Demand Specification Block */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                        <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Demand Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Demand type</span>
                            <span className="text-sm font-bold text-slate-900">{demand.demandType || 'Standard'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Fulfillment intent</span>
                            <span className="text-sm font-bold text-slate-900">{demand.intent || 'Not specified'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Duration</span>
                            <span className="text-sm font-bold text-slate-900">{demand.duration || '6 Months'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Target allocation</span>
                            <span className="text-sm font-bold text-indigo-600 italic">{demand.allocationPercent}%</span>
                        </div>
                        <div className="col-span-2">
                            <div className="h-px bg-slate-50 my-1" />
                        </div>
                        <div className="col-span-2 flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Pipeline status</span>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                <span className="text-sm font-bold text-slate-900 capitalize">{demand.lifecycleState?.toLowerCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Resource Requirements Block */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                        <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Resource Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                        <div className="col-span-2 flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Primary role</span>
                            <span className="text-sm font-bold text-slate-900">{demand.role}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Exp. required</span>
                            <span className="text-sm font-bold text-slate-900">{demand.experienceRequired || '5+ Years'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1">Resource count</span>
                            <span className="text-sm font-bold text-slate-900">01 Unit</span>
                        </div>
                        <div className="col-span-2 flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1.5">Required certificates</span>
                            <div className="flex gap-2">
                                <span className="text-xs font-medium text-slate-400 italic">None specified</span>
                            </div>
                        </div>
                        <div className="col-span-2 flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 mb-1.5">Technical skill tags</span>
                            <div className="flex flex-wrap gap-1.5">
                                {demand.skills?.map((skill, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Priority Rationale — Full Width Block */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Priority Rationalization</h3>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20" />
                    <p className="text-[13px] text-slate-600 leading-relaxed italic font-medium">
                        "{demand.priorityBreakdown || 'No specific rationale provided for this demand priority level.'}"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DemandOverviewTab;
