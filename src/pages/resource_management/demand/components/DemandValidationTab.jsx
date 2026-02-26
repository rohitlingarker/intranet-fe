import React from 'react';

const DemandValidationTab = ({ demand }) => {
    const { validation } = demand;

    const validationItems = [
        { key: 'timelineValid', label: 'Timeline Validity', value: validation.timelineValid, desc: 'Project dates within operational window.' },
        { key: 'noDuplicate', label: 'Duplicate Verification', value: validation.noDuplicate, desc: 'No overlapping demands for this project/role.' },
        { key: 'noConflict', label: 'Conflict Assessment', value: validation.noConflict, desc: 'Resource availability and secondary constraints.' },
        { key: 'approvalComplete', label: 'Authorization Status', value: validation.approvalComplete, desc: 'All required management approvals obtained.' },
        { key: 'demandComplete', label: 'Data Integrity', value: validation.demandComplete, desc: 'All mandatory fields and skills correctly defined.' }
    ];

    const allValid = validationItems.every(item => item.value);
    const isReady = allValid && demand.lifecycleState === 'OPEN' && demand.demandType === 'Confirmed' && demand.approvalStage === 'Fully Approved';

    return (
        <div className="max-w-4xl space-y-12">
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100 flex items-center justify-between">
                    Fulfillment Readiness Checklist
                    <span className="h-1 w-12 bg-gray-200" />
                </h3>

                <div className="space-y-4">
                    {validationItems.map((item) => (
                        <div key={item.key} className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-100">
                            <div className="mt-1">
                                {item.value ? (
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={`text-xs font-black uppercase tracking-tight ${item.value ? 'text-gray-900' : 'text-red-600 font-black'}`}>
                                    {item.label}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 font-medium">{item.desc}</p>
                            </div>
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.value ? 'PASSED' : 'FAILED'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Allocation Action Block */}
            <div className="pt-8 border-t border-gray-100">
                <div className="flex items-start justify-between gap-12">
                    <div className="flex-1">
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2">Resource Allocation Protocol</h4>
                        <p className="text-sm text-gray-500 font-normal leading-relaxed">
                            Allocation is only permitted for demands that have successfully passed all governance checks.
                            Once triggered, this demand will move to the fulfillment phase.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <button
                            disabled={!isReady}
                            className={`px-10 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all ${isReady
                                    ? 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200 shadow-none'
                                }`}
                        >
                            Initialize Allocation
                        </button>
                        {!isReady && (
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-tighter italic">
                                {allValid ? 'Awaiting Final Management Approval' : 'Validation Protocol Failed — Resolve Conflicts'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandValidationTab;
