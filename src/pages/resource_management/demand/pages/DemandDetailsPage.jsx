import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Clock, CheckCircle2,
    ArrowLeft, UserPlus
} from "lucide-react";
import { MOCK_DEMANDS } from '../models/demand.mock';
import DemandOverviewTab from '../components/DemandOverviewTab';
import DemandSLATab from '../components/DemandSLATab';
import DemandApprovalTab from '../components/DemandApprovalTab';
import { PriorityBadge, SLABadge } from '../components/DemandBadges';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sla', label: 'SLA & Aging', icon: Clock },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2 }
];

export default function DemandDetailsPage() {
    const { demandId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const demand = useMemo(() => {
        return MOCK_DEMANDS.find(d => d.id === parseInt(demandId));
    }, [demandId]);

    useEffect(() => {
        if (!demand) {
            const timer = setTimeout(() => {
                navigate('/resource-management/demand', { replace: true });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [demand, navigate]);

    if (!demand) return null;

    const isApproved = demand.lifecycleState?.toUpperCase() === 'APPROVED';

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-indigo-100">
            {/* ─── DECISION ZONE HEADER ─────────────────────────────────── */}
            <header className="sticky top-0 bg-white border-b border-slate-200 z-40 shadow-sm">
                <div className="max-w-[1600px] mx-auto">
                    {/* Main Band */}
                    <div className="px-4 py-3 flex items-center justify-between gap-6">
                        {/* LEFT: Identity */}
                        <div className="flex items-center gap-4 min-w-0">
                            <button
                                onClick={() => navigate("/resource-management/demand")}
                                className="group h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 transition-all shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4 text-slate-500 group-hover:text-slate-900" />
                            </button>

                            <div className="h-8 w-px bg-slate-100 hidden sm:block" />

                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-slate-900 truncate tracking-tight flex items-center gap-2">
                                    {demand.projectName}
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="text-[13px] font-semibold text-indigo-600">{demand.client}</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-medium text-slate-500">{demand.role}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                        ID-{demand.id.toString().padStart(4, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Decision Metrics & Action */}
                        <div className="hidden lg:flex items-center gap-8 shrink-0">
                            {/* SLA status */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA status</span>
                                <SLABadge days={demand.slaDays} />
                            </div>

                            {/* Priority */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
                                <PriorityBadge priority={demand.priority} />
                            </div>

                            {/* Allocation */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alloc. target</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-bold text-slate-900">{demand.allocationPercent}%</span>
                                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500"
                                            style={{ width: `${Math.min(demand.allocationPercent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <Button
                                disabled={!isApproved}
                                className={cn(
                                    "h-10 px-5 text-xs font-bold shadow-md transition-all active:scale-[0.98]",
                                    isApproved
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "bg-slate-100 text-slate-400 grayscale"
                                )}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Allocate Resource
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-4 flex gap-1 border-t border-slate-50">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "px-4 py-3 text-xs font-bold transition-all border-b-2 relative -mb-px",
                                        isActive
                                            ? "text-indigo-600 border-indigo-600"
                                            : "text-slate-400 border-transparent hover:text-slate-700"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ─── COMPACT CONTENT AREA ─────────────────────────────── */}
            <main className="flex-1 overflow-y-auto bg-slate-50/40">
                <div className="max-w-[1600px] mx-auto px-4 py-6">
                    <div className="max-w-6xl mx-auto">
                        {activeTab === 'overview' && <DemandOverviewTab demand={demand} />}
                        {activeTab === 'sla' && <DemandSLATab demand={demand} />}
                        {activeTab === 'approvals' && <DemandApprovalTab demand={demand} />}
                    </div>
                </div>
            </main>
        </div>
    );
}
