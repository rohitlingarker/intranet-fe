import React from 'react';
import DemandCardRow from './DemandCardRow';

const DemandList = ({ demands, onViewDetail, onEdit, activeTab }) => {
    return (
        <div className="flex flex-col bg-white">
            {demands.map((demand) => (
                <DemandCardRow
                    key={demand.id}
                    demand={demand}
                    onView={onViewDetail}
                    onEdit={onEdit}
                    activeTab={activeTab}
                />
            ))}
        </div>
    );
};

export default DemandList;
