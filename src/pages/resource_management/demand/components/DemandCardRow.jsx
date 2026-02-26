import React from 'react';
import { PriorityBadge, StateBadge, SLABadge, DemandTypeBadge } from './DemandBadges';
import { ChevronRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const DemandCardRow = ({ demand, onView }) => {
    return (
        <div
            className="group flex items-center bg-white border-b border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer px-4"
            onClick={() => onView(demand)}
        >
            <div className="flex-1 py-3.5 grid grid-cols-12 items-center gap-4">
                {/* 1. DEMAND SUMMARY */}
                <div className="col-span-5 flex items-center gap-4 min-w-0">
                    <div className="h-9 w-9 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                        <Briefcase className="h-4.5 w-4.5 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[13px] font-bold text-slate-900 leading-none truncate">
                            {demand.projectName}
                        </h3>
                        <div className="mt-1.5 flex flex-col gap-0.5">
                            <span className="text-[11px] font-medium text-slate-500 leading-none">{demand.client}</span>
                            <span className="text-[10px] text-slate-400 font-medium leading-none">{demand.role}</span>
                        </div>
                    </div>
                </div>

                {/* 2. PRIORITY */}
                <div className="col-span-2">
                    <PriorityBadge priority={demand.priority} />
                </div>

                {/* 3. SLA */}
                <div className="col-span-2">
                    <SLABadge days={demand.slaDays} />
                </div>

                {/* 4. STATUS */}
                <div className="col-span-1">
                    <StateBadge state={demand.lifecycleState} />
                </div>

                {/* 5. TYPE */}
                <div className="col-span-1">
                    <DemandTypeBadge type={demand.intent} />
                </div>

                {/* 6. ACTION */}
                <div className="col-span-1 flex justify-end">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                        <ChevronRight className="h-4.5 w-4.5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandCardRow;
