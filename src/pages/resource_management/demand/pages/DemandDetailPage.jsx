import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, UserPlus, ShieldAlert, ShieldCheck,
    Globe, Database, Briefcase, MapPin,
    Target, Clock, ChevronRight, Activity,
    LayoutDashboard, CheckCircle2, MoreVertical,
    FileText, Zap, Shield, AlertTriangle,
    Mail, ExternalLink, PenTool, XCircle, Info,
    UserCheck, FileSearch, History, Star, Settings2, Download,
    TrendingUp, Award, Layers, Hash, Building2, GitCompare, Code2, Percent, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import demandService from '../services/demandService';
import { PriorityBadge, StateBadge } from '../components/FormalBadges';
import { Button } from "@/components/ui/button";

/**
 * --- INTERNAL SUB-COMPONENTS ---
 */

const DetailCard = ({ title, icon: Icon, children, className, rightElement }) => (
    <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md", className)}>
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                {Icon && <Icon className="h-4 w-4 text-indigo-500" />} {title}
            </h3>
            {rightElement}
        </div>
        <div className="p-6 flex-1">
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value, icon: Icon, colorClass = "text-slate-900" }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-2 text-slate-400">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span className="text-[10px] font-bold text-slate-500 tracking-tight">{label}</span>
        </div>
        <span className={cn("text-xs font-bold text-right ml-4", colorClass)}>{value || "—"}</span>
    </div>
);

/**
 * --- TAB 1: OVERVIEW ---
 */
const OverviewTab = ({ demand, project, sla }) => {
    const warningThreshold = 5;
    const remainingDays = sla?.remainingDays ?? 0;
    const progress = Math.min(100, Math.max(0, ((sla?.slaDurationDays - remainingDays) / sla?.slaDurationDays) * 100)) || 0;

    let slaColor = "bg-emerald-500";
    if (remainingDays < 0) slaColor = "bg-rose-500";
    else if (remainingDays <= warningThreshold) slaColor = "bg-orange-500";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Card 1: Demand Summary */}
            <DetailCard title="Demand Summary" icon={FileText}>
                <div className="space-y-1">
                    <InfoRow label="Demand Name" value={demand.demandName} />
                    <InfoRow label="Demand Type" value={demand.demandType} />
                    <InfoRow label="Priority" value={<PriorityBadge priority={demand.demandPriority} />} />
                    <InfoRow label="Resources Required" value="1" />
                    <InfoRow label="Min Experience" value={`${demand.minExp || 0} Years`} />
                    <InfoRow label="Commitment Status" value="CONFIRMED" colorClass="text-indigo-600" />
                </div>
            </DetailCard>

            {/* Card 2: Project & Client Info */}
            <DetailCard title="Project & Client Info" icon={Building2}>
                <div className="space-y-1">
                    <InfoRow label="Project Name" value={project.name || "N/A"} icon={Briefcase} />
                    <InfoRow label="Client" value={demand.clientName} icon={UserCheck} />
                    <InfoRow label="Delivery Model" value={project.deliveryModel || "Onsite"} icon={Globe} />
                    <InfoRow label="Location" value={project.primaryLocation || "Chennai"} icon={MapPin} />
                    <InfoRow label="Lifecycle" value="Initiation" colorClass="text-emerald-600" />
                    <InfoRow label="Risk Level" value={<div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold border border-emerald-100">Low</div>} />
                    <InfoRow label="Staffing Readiness" value="Ready" colorClass="text-indigo-600" />
                </div>
            </DetailCard>

            {/* Card 3: SLA Health Indicator */}
            <DetailCard title="SLA Health Indicator" icon={Activity} rightElement={
                <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold border border-emerald-100">Healthy Stable</div>
            }>
                <div className="flex flex-col h-full">
                    <div className="text-center py-4 mb-4">
                        <span className={cn("text-3xl font-black tracking-tighter", remainingDays < 0 ? "text-rose-600" : remainingDays <= 5 ? "text-orange-600" : "text-emerald-600")}>
                            {remainingDays < 0 ? `${Math.abs(remainingDays)} Days Over` : `${remainingDays} Days Remaining`}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[9px] font-black text-slate-400 block mb-1">Created</span>
                                <span className="text-xs font-bold text-slate-900 block">Feb 28</span>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[9px] font-black text-slate-400 block mb-1">Due Date</span>
                                <span className="text-xs font-bold text-slate-900 block">Mar 10</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-slate-400">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className={cn("h-full transition-all duration-1000", slaColor)} style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                                <span>Threshold: {warningThreshold} Days</span>
                                <span>SLA Target: {sla?.slaDurationDays || 30} Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DetailCard>
        </div>
    );
};

/**
 * --- TAB 2: DELIVERY ROLE INFO ---
 */
const RoleInfoTab = ({ demand, role }) => {
    // Group skills for the table
    const skills = useMemo(() => {
        if (!role.skill) return [];
        return [{
            primary: role.skill.name || "Java",
            sub: role.subSkill?.name || "JDBC",
            proficiency: role.proficiencyLevel?.proficiencyName || "Intermediate (L-2)",
            mandatory: true,
            status: "Active"
        }];
    }, [role]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Role Header */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute right-0 top-0 p-8 opacity-5 scale-150"><Target className="h-32 w-32" /></div>
                <div className="flex flex-wrap items-center justify-between gap-6 relative">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                            <Code2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{role.roleName || "Java Tester"}</h2>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black text-indigo-400 tracking-widest">Allocation: 40%</span>
                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                <span className="text-[10px] font-black text-white/40 tracking-widest">Min Exp: {demand.minExp || 0} Years</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-indigo-400">Mandatory: Yes</div>
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-indigo-400">Structural Valid</div>
                    </div>
                </div>
            </div>

            {/* Skills Table */}
            <DetailCard title="Technical Blueprint & Skills Matrix" icon={Award}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 tracking-widest">Primary Skill</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 tracking-widest">Sub Skill</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 tracking-widest">Proficiency</th>
                                <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 tracking-widest">Mandatory</th>
                                <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {skills.map((skill, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="text-xs font-black text-slate-900 tracking-tight">{skill.primary}</span>
                                    </td>
                                    <td className="py-4 px-4 text-xs font-bold text-slate-500 tracking-tight">{skill.sub}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1.5 w-32">
                                            <span className="text-[9px] font-black text-indigo-600 italic">{skill.proficiency}</span>
                                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: '60%' }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center">
                                            {skill.mandatory ? (
                                                <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" title="Mandatory" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-slate-200" title="Optional" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black border border-emerald-100">Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DetailCard>
        </div>
    );
};

/**
 * --- TAB 3: APPROVAL FLOW ---
 */
const ApprovalFlowTab = ({ demand }) => {
    const steps = [
        { label: "Created", status: "complete", date: "Feb 28" },
        { label: "Resource Manager Approved", status: "complete", date: "Mar 01" },
        { label: "Additional Approval Required", status: "pending" },
        { label: "Final Confirmation", status: "future" }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DetailCard title="Sequential Governance Pipeline" icon={ShieldCheck}>
                <div className="py-12 px-6">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Lines */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

                        {steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 relative z-10 w-1/4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all shadow-sm",
                                    step.status === 'complete' ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-emerald-500/10" :
                                        step.status === 'pending' ? "bg-amber-50 border-amber-500 text-amber-600 animate-pulse shadow-amber-500/10" :
                                            "bg-white border-slate-200 text-slate-300"
                                )}>
                                    {step.status === 'complete' ? <CheckCircle2 className="h-5 w-5" /> :
                                        step.status === 'pending' ? <History className="h-5 w-5" /> :
                                            <div className="h-2 w-2 rounded-full bg-slate-200" />}
                                </div>
                                <div className="text-center px-4">
                                    <p className={cn(
                                        "text-[10px] font-black tracking-tight mb-1",
                                        step.status === 'complete' ? "text-slate-900" :
                                            step.status === 'pending' ? "text-amber-600" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </p>
                                    {step.date && <p className="text-[9px] font-bold text-slate-400 tracking-widest font-mono">{step.date}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DetailCard>

            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 text-amber-700">
                    <Info className="h-5 w-5" />
                    <span className="text-[11px] font-bold tracking-wider">Action Required: This demand currently awaits parallel verification from structural leads.</span>
                </div>
                <div className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black tracking-[0.15em] shadow-lg shadow-amber-600/20">Requires Additional Approval: Yes</div>
            </div>
        </div>
    );
};

/**
 * --- TAB 4: SLA INSIGHTS ---
 */
const SLAInsightsTab = ({ sla }) => {
    const totalDays = sla?.slaDurationDays || 30;
    const remaining = sla?.remainingDays || 0;
    const warningDays = 5;

    // Position marker for "Today"
    const todayPos = ((totalDays - remaining) / totalDays) * 100;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DetailCard title="SLA Compliance Vision" icon={Clock}>
                <div className="p-4">
                    <div className="relative mb-6 py-6">
                        {/* Timeline Track */}
                        <div className="h-1 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                            <div className="h-full bg-emerald-500" style={{ width: `${((totalDays - warningDays) / totalDays) * 100}%` }} />
                            <div className="h-full bg-orange-500" style={{ width: `${(warningDays / totalDays) * 100}%` }} />
                        </div>

                        {/* Threshold Labels */}
                        <div className="absolute top-0 right-0 translate-y-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-400 tracking-widest mb-1">Breach Zone</span>
                                <div className="h-8 w-px bg-rose-200 border-l border-dashed border-rose-300" />
                            </div>
                        </div>

                        {/* Today Marker */}
                        <div className="absolute top-0" style={{ left: `${todayPos}%`, transform: 'translateX(-50%)' }}>
                            <div className="flex flex-col items-center">
                                <div className="px-0.5 py-0.5 bg-indigo-600 text-white rounded text-[6px] font-black mb-0.5 shadow-lg ring-4 ring-white">Today</div>
                                <div className="h-8 w-1 bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)]" />
                            </div>
                        </div>

                        {/* Endpoints */}
                        <div className="flex justify-between items-center mt-2 text-[7px] font-black tracking-widest text-slate-400">
                            <div className="flex flex-col">
                                <span className="text-slate-900">Created</span>
                                <span className="font-mono">T+0</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-rose-600">SLA Due</span>
                                <span className="font-mono">T+{totalDays}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                        <div className="text-center">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">{remaining}</span>
                            <p className="text-[8px] font-bold text-slate-400 tracking-widest mt-1">Days Remaining</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-black text-amber-600 tracking-tighter">{warningDays}</span>
                            <p className="text-[8px] font-bold text-slate-400 tracking-widest mt-1">Warning Threshold</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-black text-rose-600 tracking-tighter">{remaining < 0 ? Math.abs(remaining) : 0}</span>
                            <p className="text-[8px] font-bold text-slate-400 tracking-widest mt-1">Current Overdue</p>
                        </div>
                    </div>
                </div>
            </DetailCard>
        </div>
    );
};

/**
 * --- MAIN PAGE COMPONENT ---
 */

const DemandDetailPage = () => {
    const { demandId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const result = await demandService.getDemandById(demandId);
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        if (demandId) fetchDetail();
    }, [demandId]);

    // Loading & Error States
    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] animate-pulse italic">Synchronizing data, please wait...</span>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="bg-white p-12 border border-slate-200 rounded-3xl shadow-2xl max-w-lg text-center">
                <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-100">
                    <ShieldAlert className="h-10 w-10 text-rose-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Record Not Found</h2>
                <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed">The requested demand record is currently offline or could not be reached. Please try again.</p>
                <Button onClick={() => navigate('/resource-management/demand')} className="w-full h-12 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold tracking-wide shadow-xl">Back to Demand Pipeline</Button>
            </div>
        </div>
    );

    const { demand, sla } = data;
    const project = demand.project || {};
    const role = demand.role || {};
    const isApproved = ['APPROVED', 'OPEN', 'ACTIVE'].includes(demand.demandStatus?.toUpperCase());

    const TABS = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'roleInfo', label: 'Delivery Role Info', icon: Code2 },
        { id: 'approvalFlow', label: 'Approval Flow', icon: ShieldCheck },
        { id: 'slaInsights', label: 'SLA Insights', icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-indigo-100">

            {/* --- TOP HEADER (Resource Profile Style) --- */}
            <header className="bg-white border-b border-slate-200 sticky top-0 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1500px] mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">

                        {/* Header Left */}
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/resource-management/demand')}
                                className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-all"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shrink-0 group hover:bg-indigo-600 transition-colors">
                                    <Target className="h-7 w-7 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">{demand.demandName || "Java Tester Requirement"}</h1>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-black text-indigo-600 tracking-widest">{role.roleName || "Java Tester"}</span>
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-[11px] font-black text-slate-500 tracking-widest">{project.name || "Stable Coin"}</span>
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-[11px] font-black text-slate-400 tracking-widest">{project.primaryLocation || "Chennai"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Right */}
                        <div className="flex items-center gap-10">
                            <div className="flex flex-col items-end gap-1.5 ml-auto">
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Allocation</span>
                                    <span className="text-[10px] font-black text-slate-900 tracking-widest">{demand.allocation?.percentage || 40}%</span>
                                </div>
                                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${demand.allocation?.percentage || 40}%` }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-slate-100 pl-10">
                                <StateBadge state={demand.demandStatus} className="px-5 py-2.5 rounded-xl font-black text-[11px]" />

                                <div className="flex items-center gap-4 p-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="flex flex-col items-end pr-2 border-r border-slate-200 text-right">
                                        <span className="text-[9px] font-black text-slate-400 tracking-tight">SLA Health</span>
                                        <span className={cn("text-xs font-black whitespace-nowrap", (sla?.remainingDays || 0) < 0 ? "text-rose-600" : (sla?.remainingDays || 0) <= 5 ? "text-orange-600" : "text-emerald-600")}>
                                            {sla?.remainingDays || 0} Days Remaining
                                        </span>
                                    </div>
                                    <div className="relative h-10 w-10 flex items-center justify-center">
                                        <svg className="h-10 w-10 transform -rotate-90">
                                            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" stroke="#e2e8f0" />
                                            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" stroke={(sla?.remainingDays || 0) < 0 ? "#f43f5e" : (sla?.remainingDays || 0) <= 5 ? "#f59e0b" : "#10b981"}
                                                strokeDasharray={`${(100)} 100`}
                                                strokeDashoffset={100 - (Math.min(100, Math.max(0, ((sla?.slaDurationDays - sla?.remainingDays) / sla?.slaDurationDays) * 100)) || 0)}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <button className="px-6 py-3 ml-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 border border-indigo-500">
                                    <Plus className="h-4 w-4" />
                                    Allocate Resource
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex gap-10 mt-6 -mb-[21px]">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "group flex items-center gap-3 pb-4 text-[11px] font-black transition-all border-b-4 relative tracking-[0.1em]",
                                        isActive
                                            ? "text-indigo-600 border-indigo-600"
                                            : "text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400")} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header >

            {/* --- MAIN CONTENT AREA --- */}
            < main className="flex-1 overflow-y-auto bg-slate-50/80" >
                <div className="max-w-[1500px] mx-auto px-6 py-10 font-sans">
                    {activeTab === 'overview' && <OverviewTab demand={demand} project={project} sla={sla} />}
                    {activeTab === 'roleInfo' && <RoleInfoTab demand={demand} role={role} />}
                    {activeTab === 'approvalFlow' && <ApprovalFlowTab demand={demand} />}
                    {activeTab === 'slaInsights' && <SLAInsightsTab sla={sla} />}
                </div>
            </main >
        </div >
    );
};

export default DemandDetailPage;
