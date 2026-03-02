import React from 'react';
import { PriorityBadge, StateBadge, SLABadge, DemandTypeBadge, ScoreBadge } from './FormalBadges';
import { ChevronRight, Target, ExternalLink, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DemandCardRow: Informative Workforce View
 * Redesigned for maximum clarity and logical information grouping.
 */
const DemandCardRow = ({ demand, onView }) => {
    return (
        <div
            className="group flex items-center bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => onView(demand)}
        >
            <div className="flex-1 py-4 grid grid-cols-12 items-center gap-4 px-10">

                {/* 1. Demand Specifications & Context (Expanded) */}
                <div className="col-span-6 flex items-center gap-5 min-w-0">
                    <div className="h-11 w-11 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-all shadow-md">
                        <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                                {demand.projectName}
                            </h3>
                            <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 tracking-tighter">
                                ID: {demand.id?.split('-')[0]}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-600 truncate">{demand.client}</span>
                            </div>
                            <div className="h-3 w-[1px] bg-slate-200" />
                            <div className="flex items-center gap-1.5 min-w-0">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-xs text-slate-500 truncate">{demand.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Priority Score (Raw data emphasis) */}
                <div className="col-span-1 flex justify-center">
                    <div className="text-center group-hover:scale-110 transition-transform">
                        <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">
                            {demand.priorityScore || 0}
                        </span>
                        <div className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5">Points</div>
                    </div>
                </div>

                {/* 3. Governance Priority */}
                <div className="col-span-2 flex justify-center">
                    <PriorityBadge priority={demand.priority} />
                </div>

                {/* 4. SLA Compliance */}
                <div className="col-span-2 flex justify-center">
                    <SLABadge days={demand.slaDays} />
                </div>

                {/* 5. Status */}
                <div className="col-span-1 flex justify-center">
                    <StateBadge state={demand.lifecycleState} />
                </div>
            </div>
        </div>
    );
};

export default DemandCardRow;
