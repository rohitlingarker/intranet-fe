import React from 'react';

const DemandApprovalTab = ({ demand }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return { text: 'text-emerald-600', bg: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700' };
            case 'REJECTED': return { text: 'text-rose-600', bg: 'bg-rose-500', pill: 'bg-rose-50 text-rose-700' };
            case 'PENDING': return { text: 'text-amber-600', bg: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700' };
            default: return { text: 'text-slate-400', bg: 'bg-slate-200', pill: 'bg-slate-50 text-slate-500' };
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-2">
            {/* Approval Workflow Block */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-8 pb-2 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Authorization Workflow</h3>
                </div>

                <div className="space-y-0 relative ml-2">
                    <div className="absolute left-[7px] top-2 bottom-0 w-px bg-slate-100" />
                    {demand.approvals.map((approval, idx) => {
                        const styles = getStatusStyles(approval.status);
                        return (
                            <div key={idx} className="flex gap-10 group relative z-10">
                                <div className="flex flex-col items-center">
                                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100 ${styles.bg}`} />
                                </div>

                                <div className={`pb-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-start gap-8 ${idx === demand.approvals.length - 1 ? 'pb-2' : ''}`}>
                                    {/* Entity Info */}
                                    <div className="lg:col-span-3">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{approval.role}</p>
                                        <p className="text-sm font-bold text-slate-900">{approval.name}</p>
                                    </div>

                                    {/* Status & Timing */}
                                    <div className="lg:col-span-2">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5 ${styles.pill}`}>
                                            {approval.status}
                                        </span>
                                        <p className="text-[11px] text-slate-400 font-semibold">{approval.timestamp || 'Pending'}</p>
                                    </div>

                                    {/* Remarks */}
                                    <div className="lg:col-span-7 bg-slate-50/50 border border-slate-100 p-3 rounded-lg relative">
                                        <div className="absolute -left-1.5 top-4 w-3 h-3 bg-slate-50 border-l border-b border-slate-100 rotate-45" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Authorization remarks</p>
                                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed italic">
                                            "{approval.comments || 'Directives or comments not specified for this stage.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DemandApprovalTab;
