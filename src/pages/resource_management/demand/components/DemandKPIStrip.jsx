import React from 'react';
import { Users, UserCheck, ListFilter, UserPlus, AlertTriangle, XCircle, LayoutDashboard, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function KPICard({ label, value, icon, color, className }) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-xl border bg-white p-4 text-left border-slate-200 shadow-sm transition-all",
                className
            )}
        >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color)}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-0.5 whitespace-nowrap">
                    {label}
                </p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {value}
                </p>
            </div>
        </div>
    );
}

const DemandKPIStrip = ({ data }) => {
    const getIcon = (label) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('active')) return <LayoutDashboard className="h-5 w-5" />;
        if (lowerLabel.includes('pending')) return <Clock className="h-5 w-5" />;
        if (lowerLabel.includes('approved')) return <CheckCircle2 className="h-5 w-5" />;
        if (lowerLabel.includes('risk')) return <AlertTriangle className="h-5 w-5" />;
        if (lowerLabel.includes('breach')) return <XCircle className="h-5 w-5" />;
        if (lowerLabel.includes('emergency')) return <AlertTriangle className="h-5 w-5 animate-pulse" />;
        return <Users className="h-5 w-5" />;
    };

    const getColor = (label) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('active')) return "bg-indigo-50 text-indigo-600";
        if (lowerLabel.includes('pending')) return "bg-amber-50 text-amber-600";
        if (lowerLabel.includes('approved')) return "bg-emerald-50 text-emerald-600";
        if (lowerLabel.includes('risk')) return "bg-orange-50 text-orange-600";
        if (lowerLabel.includes('breach')) return "bg-rose-50 text-rose-600";
        if (lowerLabel.includes('emergency')) return "bg-red-50 text-red-600";
        return "bg-slate-100 text-slate-600";
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {data.map((kpi, idx) => (
                <KPICard
                    key={idx}
                    label={kpi.label}
                    value={kpi.count}
                    icon={getIcon(kpi.label)}
                    color={getColor(kpi.label)}
                />
            ))}
        </div>
    );
};

export default DemandKPIStrip;
