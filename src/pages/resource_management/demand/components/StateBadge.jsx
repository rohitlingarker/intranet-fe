import React from 'react';

const StateBadge = ({ state }) => {
    const getStyles = () => {
        switch (state.toUpperCase()) {
            case 'OPEN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'SOFT': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-300';
            case 'CLOSED': return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getStyles()}`}>
            {state}
        </span>
    );
};

export default StateBadge;
