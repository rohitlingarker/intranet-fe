import React from 'react';
import { cn } from "@/lib/utils";

const toTitleCase = (str) => {
    if (!str) return str;
    const s = str.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const PriorityBadge = ({ priority }) => {
    const map = {
        CRITICAL: "bg-rose-50 text-rose-700 border-rose-100",
        HIGH: "bg-amber-50 text-amber-700 border-amber-100",
        MEDIUM: "bg-blue-50 text-blue-700 border-blue-100",
        LOW: "bg-slate-50 text-slate-700 border-slate-100"
    };

    const styles = map[priority.toUpperCase()] || "bg-slate-50 text-slate-700 border-slate-100";

    return (
        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", styles)}>
            {toTitleCase(priority)}
        </span>
    );
};

export const StateBadge = ({ state }) => {
    const map = {
        OPEN: { class: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Approved" },
        SOFT: { class: "bg-amber-50 text-amber-700 border-amber-100", label: "Pending" },
        CANCELLED: { class: "bg-rose-50 text-rose-700 border-rose-100", label: "Cancelled" },
        CLOSED: { class: "bg-slate-50 text-slate-700 border-slate-100", label: "Rejected" },
        // Actual mapped statuses based on instructions
        REQUESTED: { class: "bg-amber-50 text-amber-700 border-amber-100", label: "Pending" },
        APPROVED: { class: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Approved" },
        REJECTED: { class: "bg-slate-50 text-slate-700 border-slate-100", label: "Rejected" },
    };

    const config = map[state?.toUpperCase()] || { class: "bg-slate-50 text-slate-700 border-slate-100", label: toTitleCase(state) };

    return (
        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", config.class)}>
            {config.label}
        </span>
    );
};

export const SLABadge = ({ days }) => {
    const isBreached = days < 0;
    const isAtRisk = days >= 0 && days <= 5;

    if (isBreached) {
        return (
            <div className="flex flex-col gap-1 w-24">
                <span className="text-[10px] font-bold text-rose-600">
                    {Math.abs(days)}d overdue
                </span>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '100%' }} />
                </div>
            </div>
        );
    }

    if (isAtRisk) {
        return (
            <div className="inline-flex flex-col">
                <span className="text-[10px] font-bold text-amber-600">
                    {days}d remaining
                </span>
                <div className="h-0.5 w-full bg-amber-400 mt-0.5" />
            </div>
        );
    }

    return (
        <div className="inline-flex flex-col">
            <span className="text-[10px] font-bold text-slate-500">
                {days}d remaining
            </span>
            <div className="h-0.5 w-full bg-slate-200 mt-0.5" />
        </div>
    );
};

export const DemandTypeBadge = ({ type }) => {
    return (
        <span className="text-[10px] font-bold text-slate-600 tracking-tight">
            {toTitleCase(type)}
        </span>
    );
};
