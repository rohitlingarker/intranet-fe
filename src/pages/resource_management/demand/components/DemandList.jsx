import React from 'react';
import DemandCardRow from './DemandCardRow';

const DemandList = ({ demands, onViewDetail }) => {
    return (
        <div className="flex flex-col bg-white">
            {demands.map((demand) => (
                <DemandCardRow
                    key={demand.id}
                    demand={demand}
                    onView={onViewDetail}
                />
            ))}
        </div>
    );
};

export default DemandList;
