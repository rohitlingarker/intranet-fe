import React from 'react';
import {
    Users, Briefcase, Activity, Clock,
    AlertTriangle, CheckCircle2, ShieldAlert,
    Shield, Zap, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DemandKPIStrip: Workforce Edition
 * Directly matches AvailabilityKPIs.jsx style used in Workforce page.
 */

const KPICard = ({ label, value, icon: Icon, colorClass, active, onClick, suffix, className, isLoading }) => {
    if (isLoading) {
        return (
            <div className="h-24 rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0" />
                <div className="space-y-2 flex-1">
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                    <div className="h-6 w-1/3 bg-slate-100 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition-all shadow-sm",
            active ? "ring-2 ring-indigo-600 bg-indigo-50/10 border-indigo-200" : "border-slate-100 hover:border-slate-200",
            className
        )}>
            <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform",
                colorClass || "bg-slate-100 text-slate-600"
            )}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-0.5 whitespace-nowrap tracking-tight">
                    {label}
                </p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                        {value}
                    </p>
                    {suffix && <span className="text-sm font-bold text-slate-400">{suffix}</span>}
                </div>
            </div>
        </div>
    );
};

const DemandKPIStrip = ({ data, isLoading }) => {
    const kpiConfig = {
        "Active": { icon: Activity, color: "bg-indigo-100 text-indigo-600" },
        "Approved": { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
        "Pending": { icon: Clock, color: "bg-amber-100 text-amber-600" },
        "Soft": { icon: Zap, color: "bg-slate-100 text-slate-600" },
        "SLA At Risk": { icon: AlertTriangle, color: "bg-rose-100 text-orange-600" },
        "SLA Breached": { icon: ShieldAlert, color: "bg-rose-100 text-rose-600" }
    };

    if (isLoading || !data || data.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => <KPICard key={i} isLoading={true} />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {data.map((item, idx) => {
                const config = kpiConfig[item.label] || { icon: Shield, color: "bg-slate-100 text-slate-400" };
                return (
                    <KPICard
                        key={idx}
                        label={item.label}
                        value={item.count}
                        icon={config.icon}
                        colorClass={config.color}
                    />
                );
            })}
        </div>
    );
};

export default DemandKPIStrip;
