import React from 'react';

const SLABadge = ({ days }) => {
    const isBreached = days < 0;
    const isAtRisk = days >= 0 && days <= 5;

    const getColors = () => {
        if (isBreached) return 'bg-red-50 text-red-700 border-red-200';
        if (isAtRisk) return 'bg-orange-50 text-orange-700 border-orange-200';
        return 'bg-green-50 text-green-700 border-green-200';
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getColors()}`}>
                {isBreached ? `Breached (${Math.abs(days)}d)` : `${days}d Remaining`}
            </span>
            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${isBreached ? 'w-full bg-red-500' : isAtRisk ? 'w-2/3 bg-orange-500' : 'w-1/3 bg-green-500'}`}
                />
            </div>
        </div>
    );
};

export default SLABadge;
