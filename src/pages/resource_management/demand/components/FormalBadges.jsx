import React from 'react';

export const PriorityBadge = ({ priority }) => {
    const getColors = () => {
        switch (priority.toUpperCase()) {
            case 'CRITICAL': return 'text-red-600';
            case 'HIGH': return 'text-amber-600';
            case 'MEDIUM': return 'text-slate-600';
            default: return 'text-slate-500';
        }
    };

    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${getColors()}`}>
            {priority}
        </span>
    );
};

export const StateBadge = ({ state }) => {
    const getColors = () => {
        switch (state.toUpperCase()) {
            case 'OPEN': return 'text-green-600';
            case 'SOFT': return 'text-amber-600';
            case 'CANCELLED': return 'text-red-600';
            case 'CLOSED': return 'text-slate-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${getColors()}`}>
            {state}
        </span>
    );
};

export const SLABadge = ({ days }) => {
    const isBreached = days < 0;
    const isAtRisk = days >= 0 && days <= 5;
    const color = isBreached ? 'bg-red-500' : isAtRisk ? 'bg-amber-500' : 'bg-green-500';
    const textColor = isBreached ? 'text-red-600' : isAtRisk ? 'text-amber-600' : 'text-green-600';

    return (
        <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>
                {isBreached ? `${Math.abs(days)}d Overdue` : `${days}d Remaining`}
            </span>
            <div className="w-16 h-0.5 bg-gray-100 mt-0.5">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${Math.min(100, Math.max(10, (30 - days) / 30 * 100))}%` }}
                />
            </div>
        </div>
    );
};
