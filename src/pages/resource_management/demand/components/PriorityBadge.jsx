import React from 'react';

const PriorityBadge = ({ priority }) => {
    const getStyles = () => {
        switch (priority.toUpperCase()) {
            case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
            case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'MEDIUM': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'LOW': return 'bg-gray-50 text-gray-700 border-gray-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStyles()}`}>
            {priority}
        </span>
    );
};

export default PriorityBadge;
