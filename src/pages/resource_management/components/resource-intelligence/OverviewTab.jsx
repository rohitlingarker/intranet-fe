import { useState, useEffect, useMemo } from "react";
import {
    Users, MapPin, Briefcase, Calendar, Percent,
    TrendingUp, FolderKanban, ArrowRight, Shield,
    CheckCircle2, AlertTriangle, Award, Building2, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getUtilization } from "../../services/workforceService";
import Pagination from "../../../../components/Pagination/pagination";

// ── Mini Info Row ──────────────────────────────────────────────────────────
function MiniInfoRow({ label, value, icon: Icon }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0 font-sans">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium text-slate-500">{label}</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{value || "—"}</span>
        </div>
    );
}

// ── Utilization Chart ──────────────────────────────────────────────────────
function UtilizationChart({ data }) {
    const list = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);

    if (!list || list.length === 0) {
        return <div className="flex items-center justify-center h-full text-[10px] text-slate-400 font-medium font-sans">No trend data available</div>;
    }
    const maxVal = Math.max(...list.map(d => (d.billable || 0) + (d.nonBillable || 0)), 100);

    return (
        <div className="flex items-end gap-1.5 h-full">
            {list.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full flex flex-col justify-end h-16">
                        <div
                            className="w-full bg-emerald-400 rounded-t-[2px] transition-all hover:brightness-95"
                            style={{ height: `${((d.billable || 0) / maxVal) * 100}%` }}
                        />
                        <div
                            className="w-full bg-slate-100 rounded-b-[2px]"
                            style={{ height: `${((d.nonBillable || 0) / maxVal) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function OverviewTab({ resource }) {
    const [utilization, setUtilization] = useState(null);
    const [utilLoading, setUtilLoading] = useState(true);

    // Pagination for Quick Views
    const [certPage, setCertPage] = useState(1);
    const [projPage, setProjPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setUtilLoading(true);
            try {
                const id = resource.resourceId || resource.id;
                const data = await getUtilization(id);
                if (!cancelled) setUtilization(data);
            } catch {
                if (!cancelled) setUtilization(null);
            } finally {
                if (!cancelled) setUtilLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [resource.resourceId, resource.id]);

    const isNotice = resource.noticeInfo?.isNoticePeriod;
    const currentProjects = useMemo(() => {
        if (!resource.currentProject) return [];
        if (Array.isArray(resource.currentProject)) return resource.currentProject;
        if (typeof resource.currentProject === "string") {
            return resource.currentProject.split(",").map(p => p.trim()).filter(Boolean);
        }
        return [];
    }, [resource.currentProject]);

    const hasExpiredCerts = useMemo(() => {
        return resource.certifications?.some(c => c.expiryDate && new Date(c.expiryDate) < new Date());
    }, [resource.certifications]);

    // Paginated Computations
    const paginatedCerts = useMemo(() => {
        if (!resource.certifications) return [];
        const start = (certPage - 1) * ITEMS_PER_PAGE;
        return resource.certifications.slice(start, start + ITEMS_PER_PAGE);
    }, [resource.certifications, certPage]);

    const totalCertPages = Math.ceil((resource.certifications?.length || 0) / ITEMS_PER_PAGE);

    const paginatedProjs = useMemo(() => {
        const start = (projPage - 1) * ITEMS_PER_PAGE;
        return currentProjects.slice(start, start + ITEMS_PER_PAGE);
    }, [currentProjects, projPage]);

    const totalProjPages = Math.ceil(currentProjects.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 font-sans">

            {/* ── TOP METRICS GRID (3-Columns) ───────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-sans">

                {/* COLUMN 1: Profile Summary (25%) */}
                <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-full flex flex-col transition-all hover:shadow-md">
                    <h3 className="text-sm font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500" /> Profile Summary
                    </h3>
                    <div className="space-y-2">
                        <MiniInfoRow icon={MapPin} label="Location" value={resource.location} />
                        <MiniInfoRow icon={Briefcase} label="Experience" value={`${resource.experience || 0} Yrs`} />
                        <MiniInfoRow icon={Calendar} label="Available From" value={resource.availableFrom} />
                        <MiniInfoRow icon={Percent} label="Employment" value={resource.employmentType} />
                    </div>
                </div>

                {/* COLUMN 2: Allocation Metrics (45%) */}
                <div className="md:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-full transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" /> Performance & Utilization
                        </h3>
                        {!utilLoading && (
                            <div className="flex gap-4 text-[10px] font-bold font-sans">
                                <span className="flex items-center gap-1.5 text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Billable</span>
                                <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-full bg-slate-200" /> Non-Billable</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-bold text-slate-500 font-sans">Active Workload</span>
                                <span className="text-2xl font-bold text-indigo-600 font-sans">{resource.currentAllocation || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${Math.min(resource.currentAllocation || 0, 100)}%` }} />
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 font-sans">Current monthly capacity balance</p>
                        </div>

                        <div className="h-24">
                            {utilLoading ? (
                                <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg" />
                            ) : (
                                <UtilizationChart data={utilization} />
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Risk & Actions (30%) */}
                <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-full flex flex-col transition-all hover:shadow-md">
                    <h3 className="text-sm font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-indigo-500" /> Risk Assessment
                    </h3>

                    <div className="flex-1 space-y-4">
                        {isNotice ? (
                            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-rose-600 mb-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-xs font-bold font-sans">Critical Exit</span>
                                </div>
                                <p className="text-[11px] font-medium text-rose-500 leading-tight font-sans">Serving notice period. Immediate bench risk upon completion.</p>
                            </div>
                        ) : resource.currentAllocation === 0 ? (
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-amber-600 mb-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-xs font-bold font-sans">Bench Risk</span>
                                </div>
                                <p className="text-[11px] font-medium text-amber-500 leading-tight font-sans">Resource unallocated. Prioritize project matching.</p>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-xs font-bold font-sans">Healthy Stable</span>
                                </div>
                                <p className="text-[11px] font-medium text-emerald-500 leading-tight font-sans">Active allocation within optimal performance range.</p>
                            </div>
                        )}

                        {hasExpiredCerts && (
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-amber-600 mb-1">
                                    <Award className="h-4 w-4" />
                                    <span className="text-xs font-bold font-sans">Cert Renewal</span>
                                </div>
                                <p className="text-[11px] font-medium text-amber-500 leading-tight font-sans">One or more critical certifications have expired.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <Button variant="outline" className="h-9 text-xs font-bold border-slate-200 hover:bg-slate-50 font-sans shadow-sm">
                                Create Demand
                            </Button>
                            <Button variant="outline" className="h-9 text-xs font-bold border-slate-200 hover:bg-slate-50 font-sans shadow-sm">
                                Reserve
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SECONDARY METRICS ────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">

                {/* Certifications Quick View */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
                            <Award className="h-4.5 w-4.5 text-indigo-500" /> Certification Inventory
                        </h3>
                        <Badge className="bg-indigo-50 text-indigo-600 text-[10px] font-bold border-none px-2.5 font-sans">{resource.certifications?.length || 0} Records</Badge>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        {paginatedCerts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                                    {paginatedCerts.map((c, i) => {
                                        const name = typeof c === 'string' ? c : (c.certificateName || c.name);
                                        const provider = typeof c === 'string' ? 'Verified' : c.providerName;
                                        const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();

                                        return (
                                            <div key={i} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/30 group hover:border-indigo-200 hover:bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-indigo-500 shrink-0 border border-slate-100 shadow-sm transition-colors group-hover:bg-indigo-50">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 leading-snug truncate font-sans">{name}</p>
                                                    <p className={cn("text-[10px] font-medium mt-0.5 font-sans", isExpired ? "text-rose-500" : "text-slate-500")}>
                                                        {isExpired ? "Expired" : provider}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {totalCertPages > 1 && (
                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                        <Pagination
                                            currentPage={certPage}
                                            totalPages={totalCertPages}
                                            onPrevious={() => setCertPage(p => Math.max(1, p - 1))}
                                            onNext={() => setCertPage(p => Math.min(totalCertPages, p + 1))}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-8 text-slate-300 font-sans">
                                <Award className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-xs font-bold">No active records found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Projects Quick View */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
                            <FolderKanban className="h-4.5 w-4.5 text-indigo-500" /> Current Engagements
                        </h3>
                        <Badge className="bg-slate-100 text-slate-600 text-[10px] font-bold border-none px-2.5 font-sans">{currentProjects.length} Projects</Badge>
                    </div>
                    <div className="p-0 flex-1 flex flex-col">
                        {paginatedProjs.length > 0 ? (
                            <>
                                <div className="divide-y divide-slate-100 flex-1">
                                    {paginatedProjs.map((projectName, i) => (
                                        <div key={i} className="px-5 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between group font-sans">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                    <FolderKanban className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 font-sans">{projectName}</p>
                                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 whitespace-nowrap font-sans">Active client engagement</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                {totalProjPages > 1 && (
                                    <div className="p-4 border-t border-slate-50">
                                        <Pagination
                                            currentPage={projPage}
                                            totalPages={totalProjPages}
                                            onPrevious={() => setProjPage(p => Math.max(1, p - 1))}
                                            onNext={() => setProjPage(p => Math.min(totalProjPages, p + 1))}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-16 text-center font-sans">
                                <FolderKanban className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-xs font-bold text-slate-400">No active project engagements found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
