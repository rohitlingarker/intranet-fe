import React from 'react';
import { X } from 'lucide-react';
import DemandOverviewTab from './DemandOverviewTab';
import DemandSLATab from './DemandSLATab';
import DemandApprovalTab from './DemandApprovalTab';
import DemandValidationTab from './DemandValidationTab';
import { PriorityBadge, StateBadge } from './FormalBadges';

const DemandDetailDrawer = ({ demand, isOpen, onClose }) => {
    if (!demand) return null;

    const [activeTab, setActiveTab] = React.useState('Overview');

    const tabs = [
        { id: 'Overview', label: 'Overview' },
        { id: 'SLA', label: 'SLA' },
        { id: 'Approvals', label: 'Authorization' },
        { id: 'Validation', label: 'Governance' }
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-[45%] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 font-black uppercase tracking-widest">Case ID: {demand.id}</span>
                            <StateBadge state={demand.lifecycleState} />
                            <PriorityBadge priority={demand.priority} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{demand.projectName}</h2>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{demand.client} — {demand.role}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 -mb-[1px] ${activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {activeTab === 'Overview' && <DemandOverviewTab demand={demand} />}
                        {activeTab === 'SLA' && <DemandSLATab demand={demand} />}
                        {activeTab === 'Approvals' && <DemandApprovalTab demand={demand} />}
                        {activeTab === 'Validation' && <DemandValidationTab demand={demand} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DemandDetailDrawer;
