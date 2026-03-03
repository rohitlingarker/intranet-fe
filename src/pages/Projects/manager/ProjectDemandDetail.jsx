import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Calendar, Target, Clock, Activity,
    FileText, Building2, ShieldCheck, Code2,
    CheckCircle2, Info, AlertTriangle, Shield,
    Zap, Globe, MapPin, UserCheck, Briefcase,
    Layers, MessageSquareQuote, SplitSquareVertical, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import demandService from '../../resource_management/demand/services/demandService';
import { PriorityBadge, StateBadge } from '../../resource_management/demand/components/FormalBadges';

const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2",
            active
                ? "text-indigo-600 border-indigo-600 bg-indigo-50/10"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50/50"
        )}
    >
        {Icon && <Icon className={cn("h-4 w-4", active ? "text-indigo-600" : "text-slate-400")} />}
        {label}
    </button>
);

const DetailCard = ({ title, icon: Icon, children, className }) => (
    <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden", className)}>
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value, icon: Icon, colorClass = "text-slate-900" }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors px-1">
        <div className="flex items-center gap-3">
            {Icon && <Icon className="h-4 w-4 text-slate-400" />}
            <span className="text-xs font-medium text-slate-500">{label}</span>
        </div>
        <span className={cn("text-xs font-semibold tracking-tight", colorClass)}>{value || "—"}</span>
    </div>
);

const ProjectDemandDetail = ({ projectId, demandId, onBack }) => {
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
                console.error("Error fetching demand detail:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        if (demandId) fetchDetail();
    }, [demandId]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-xl">
            <div className="h-10 w-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-400 animate-pulse">Loading Demand Details...</p>
        </div>
    );

    if (error || !data) return (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 m-6">
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Demand Data Not Found</h3>
            <p className="text-sm text-slate-500 mb-6">{error || "The requested record could not be retrieved."}</p>
            <button onClick={onBack} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-md active:scale-95 transition-all">Back to List</button>
        </div>
    );

    const { demand, sla } = data;
    const project = demand.project || {};
    const roleMeta = demand.role || {};
    const actualRole = roleMeta.role || {};
    const skill = roleMeta.skill || {};
    const subSkill = roleMeta.subSkill || {};
    const proficiency = roleMeta.proficiencyLevel || {};

    return (
        <div className="bg-slate-50/50 min-h-screen flex flex-col font-sans">
            {/* Simple Top Header */}
            <div className="px-8 py-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-900">{demand.demandName}</h2>
                            <StateBadge state={demand.demandStatus} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>ID: {demandId.split('-')[0]}</span>
                            <span className="text-slate-300">•</span>
                            <span>{demand.demandType}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right border-r border-slate-200 pr-6">
                        <span className="text-xs font-medium text-slate-500 block">Priority Score</span>
                        <span className="text-lg font-bold text-indigo-600">{demand.priorityScore || 0}</span>
                    </div>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all">
                        Action
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-8 border-b border-slate-200 bg-white flex gap-2">
                <TabButton id="overview" label="Requirement Overview" icon={FileText} active={activeTab === 'overview'} onClick={setActiveTab} />
                <TabButton id="technical" label="Role Blueprint" icon={Code2} active={activeTab === 'technical'} onClick={setActiveTab} />
                <TabButton id="sla" label="SLA & Governance" icon={ShieldCheck} active={activeTab === 'sla'} onClick={setActiveTab} />
            </div>

            {/* Content Area */}
            <div className="p-8 pb-12 animate-in fade-in duration-300">
                <div className="max-w-[1400px] mx-auto">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Demand Summary Card */}
                            <DetailCard title="Demand Summary" icon={Info}>
                                <div className="space-y-1">
                                    <InfoRow label="Demand Start Date" value={new Date(demand.demandStartDate).toLocaleDateString()} icon={Calendar} />
                                    <InfoRow label="Demand End Date" value={new Date(demand.demandEndDate).toLocaleDateString()} icon={Calendar} />
                                    <InfoRow label="Resources Required" value={demand.resourcesRequired} icon={User} />
                                    <InfoRow label="Allocation Percentage" value={`${demand.allocationPercentage}%`} icon={SplitSquareVertical} />
                                    <InfoRow label="Demand Priority" value={<PriorityBadge priority={demand.demandPriority} />} icon={Target} />
                                    <InfoRow label="Demand Commitment" value={demand.demandCommitment} icon={CheckCircle2} />
                                </div>
                            </DetailCard>

                            {/* Project Context Card */}
                            <DetailCard title="Project Association" icon={Building2}>
                                <div className="space-y-1">
                                    <InfoRow label="Project Name" value={project.name} icon={Briefcase} />
                                    <InfoRow label="Delivery Model" value={project.deliveryModel} icon={Globe} />
                                    <InfoRow label="Primary Location" value={project.primaryLocation} icon={MapPin} />
                                    <InfoRow label="Lifecycle Stage" value={project.lifecycleStage} icon={Activity} />
                                    <InfoRow label="Staffing Readiness" value={project.staffingReadinessStatus} icon={CheckCircle2} colorClass="text-emerald-600" />
                                    <InfoRow label="Budget Allocation" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: project.projectBudgetCurrency || 'USD', maximumFractionDigits: 0 }).format(project.projectBudget || 0)} icon={Zap} />
                                </div>
                            </DetailCard>

                            {/* Justification Card */}
                            <DetailCard title="Demand Justification" icon={MessageSquareQuote}>
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 h-full min-h-[160px]">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                        "{demand.demandJustification || "No strategic justification recorded for this requirement."}"
                                    </p>
                                </div>
                            </DetailCard>
                        </div>
                    )}

                    {activeTab === 'technical' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DetailCard title="Technical Blueprint" icon={Layers}>
                                <div className="space-y-1">
                                    <InfoRow label="Designation / Role" value={actualRole.roleName} icon={UserCheck} />
                                    <InfoRow label="Primary Skill" value={skill.name} icon={Zap} />
                                    <InfoRow label="Sub Capability" value={subSkill.name} icon={Layers} />
                                    <InfoRow label="Experience Requirement" value={`${demand.minExp} Years`} icon={Activity} />
                                    <InfoRow label="Proficiency Level" value={proficiency.proficiencyName} icon={Shield} colorClass="text-indigo-600" />
                                    <InfoRow label="Mandatory Requirement" value={roleMeta.mandatoryFlag ? "Yes" : "No"} icon={ShieldCheck} colorClass={roleMeta.mandatoryFlag ? "text-rose-600" : "text-emerald-600"} />
                                </div>
                            </DetailCard>

                            <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute right-0 bottom-0 opacity-5 scale-150"><Code2 className="h-48 w-48" /></div>
                                <div className="relative z-10">
                                    <h4 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2">Role Expectation</h4>
                                    <h3 className="text-3xl font-bold tracking-tight mb-4">{actualRole.roleName || "Unspecified"}</h3>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                                        <div className="h-full bg-indigo-500" style={{ width: '75%' }} />
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-white/40 font-bold mb-1">Availability</span>
                                            <span className="text-lg font-bold">Standard Shift</span>
                                        </div>
                                        <div className="h-8 w-px bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-white/40 font-bold mb-1">Verification</span>
                                            <span className="text-lg font-bold">Structural Validated</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sla' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* SLA Gauge Card */}
                            <DetailCard title="SLA Compliance Health" icon={Clock}>
                                <div className="flex flex-col items-center justify-center pt-4">
                                    <div className="relative h-40 w-40 mb-6">
                                        <svg className="h-40 w-40 transform -rotate-90">
                                            <circle cx="80" cy="80" r="72" fill="none" strokeWidth="6" stroke="#f1f5f9" />
                                            <circle cx="80" cy="80" r="72" fill="none" strokeWidth="6" stroke={(sla?.remainingDays || 0) <= 0 ? "#f43f5e" : (sla?.remainingDays || 0) <= 5 ? "#f59e0b" : "#4f46e5"}
                                                strokeDasharray={`${2 * Math.PI * 72}`}
                                                strokeDashoffset={`${(1 - Math.min(1, Math.max(0, ((sla?.slaDurationDays || 10) - (sla?.remainingDays || 0)) / (sla?.slaDurationDays || 10)))) * 2 * Math.PI * 72}`}
                                                className="transition-all duration-1000 stroke-cap-round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-bold text-slate-800 tracking-tighter">{sla?.remainingDays || 0}</span>
                                            <span className="text-xs font-medium text-slate-400">Days Left</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 italic">
                                        SLA Currently Healthy
                                    </div>
                                </div>
                            </DetailCard>

                            {/* Governance Timeline / Steps */}
                            <DetailCard title="Governance Pipeline" icon={ShieldCheck}>
                                <div className="space-y-6 pt-2">
                                    {[
                                        { label: "Request Created", status: "Done", date: "Initial Sync" },
                                        { label: "Manager Approval", status: demand.demandStatus === "APPROVED" ? "Done" : "Pending" },
                                        { label: "Staffing Orchestration", status: "Current" }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={cn(
                                                    "h-5 w-5 rounded-full flex items-center justify-center border-2",
                                                    step.status === 'Done' ? "bg-emerald-500 border-emerald-500 text-white" :
                                                        step.status === 'Current' ? "bg-white border-indigo-600 text-indigo-600 animate-pulse" :
                                                            "bg-white border-slate-200 text-slate-200"
                                                )}>
                                                    {step.status === 'Done' && <CheckCircle2 className="h-3 w-3" />}
                                                </div>
                                                {idx < 2 && <div className="w-px h-8 bg-slate-100 mt-1" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("text-xs font-semibold", step.status === 'Done' ? "text-slate-800" : "text-slate-400")}>{step.label}</span>
                                                {step.date && <span className="text-[10px] text-slate-400 italic">{step.date}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DetailCard>

                            {/* Detailed SLA KPIs */}
                            <DetailCard title="SLA Enforcement Policy" icon={Calendar}>
                                <div className="space-y-1">
                                    <InfoRow label="Total SLA Window" value={`${sla?.slaDurationDays || 10} Working Days`} icon={Clock} />
                                    <InfoRow label="Breach Deadline" value={sla?.slaDueAt ? new Date(sla.slaDueAt).toLocaleDateString() : 'N/A'} icon={Calendar} />
                                    <InfoRow label="Warning Threshold" value={`${sla?.warningThresholdDays || 5} Days`} icon={AlertTriangle} colorClass="text-amber-600" />
                                    <InfoRow label="Additional Approval" value={demand.requiresAdditionalApproval ? "Required" : "Optional"} icon={Info} colorClass={demand.requiresAdditionalApproval ? "text-amber-600" : "text-slate-400"} />
                                    <InfoRow label="Governance Type" value={sla?.slaType || "Net New"} icon={Shield} />
                                </div>
                            </DetailCard>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDemandDetail;
