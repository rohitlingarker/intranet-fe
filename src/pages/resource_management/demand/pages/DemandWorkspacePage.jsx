import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
    Search, Filter, Briefcase, Plus, Activity, LayoutDashboard, Clock, CheckCircle2, AlertTriangle, XCircle, Zap, ShieldAlert,
    ChevronDown, Settings2, Download, Table2, Layers, ArrowUpRight, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import demandService from '../services/demandService';
import DemandKPIStrip from '../components/DemandKPIStrip';
import DemandList from '../components/DemandList';
import DemandFilters from '../components/DemandFilters';

/**
 * DemandWorkspacePage: High-Fidelity Workforce Edition
 * This page mirrors the layout and aesthetic of the Workforce Availability page.
 */
const DemandWorkspacePage = () => {
    const navigate = useNavigate();
    const [demands, setDemands] = useState([]);
    const [kpiData, setKpiData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // breached, at_risk, active, soft

    // Filter states
    const [clientFilter, setClientFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [filterCollapsed, setFilterCollapsed] = useState(true);
    const filterButtonRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [demandsData, kpis] = await Promise.all([
                    demandService.getAllDemands(),
                    demandService.getKPISummary()
                ]);
                setDemands(demandsData || []);
                setKpiData(kpis);
            } catch (error) {
                console.error("Workspace Fetch Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Dropdown Positioning logic for Portal
    useEffect(() => {
        if (!filterCollapsed && filterButtonRef.current) {
            const rect = filterButtonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const popupHeight = 420;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            const align = (spaceBelow < popupHeight && spaceAbove > spaceBelow) ? 'up' : 'down';

            setDropdownPos({
                top: align === 'up' ? (rect.top + window.scrollY - 8) : (rect.bottom + window.scrollY + 8),
                right: window.innerWidth - (rect.right + window.scrollX),
                align,
                maxHeight: Math.min(viewportHeight * 0.7, align === 'up' ? spaceAbove - 24 : spaceBelow - 24)
            });
        }
    }, [filterCollapsed]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setFilterCollapsed(true);
        };
        const handleClickOutside = (event) => {
            if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
                const portal = document.getElementById('filter-workspace-portal');
                if (portal && !portal.contains(event.target)) {
                    setFilterCollapsed(true);
                }
            }
        };
        if (!filterCollapsed) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [filterCollapsed]);

    const filteredDemands = useMemo(() => {
        let list = [...demands];

        // Tab Filtering (Segmented Logic)
        if (activeTab === 'breached') {
            list = list.filter(d => d.remainingDays < 0);
        } else if (activeTab === 'at_risk') {
            list = list.filter(d => d.remainingDays >= 0 && d.remainingDays <= 5);
        } else if (activeTab === 'active') {
            list = list.filter(d => ['APPROVED', 'OPEN', 'ACTIVE'].includes((d.demandStatus || d.lifecycleState)?.toUpperCase()));
        } else if (activeTab === 'soft') {
            list = list.filter(d => ['SOFT', 'REQUESTED'].includes((d.demandStatus || d.lifecycleState)?.toUpperCase()));
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(d =>
                d.projectName?.toLowerCase().includes(query) ||
                d.role?.toLowerCase()?.includes(query) ||
                d.demandName?.toLowerCase().includes(query) ||
                d.clientName?.toLowerCase().includes(query)
            );
        }

        // Advanced Filters
        if (clientFilter !== 'All') {
            list = list.filter(d => d.clientName === clientFilter || d.client === clientFilter);
        }
        if (priorityFilter !== 'All') {
            list = list.filter(d => (d.demandPriority || d.priority)?.toUpperCase() === priorityFilter.toUpperCase());
        }

        return list.map(d => ({
            ...d,
            id: d.demandId || d.id,
            client: d.clientName || d.client,
            role: d.demandName || d.role,
            priority: d.demandPriority || d.priority,
            slaDays: d.remainingDays !== undefined ? d.remainingDays : d.slaDays,
            lifecycleState: d.demandStatus || d.lifecycleState,
            priorityScore: d.priorityScore || 85
        }));
    }, [demands, searchQuery, activeTab, clientFilter, priorityFilter]);

    const activeKPIs = useMemo(() => {
        if (!kpiData) return [];
        return [
            { label: "Active", count: kpiData.active },
            { label: "Approved", count: kpiData.approved },
            { label: "Pending", count: kpiData.pending },
            { label: "Soft", count: kpiData.soft || 0 },
            { label: "SLA At Risk", count: kpiData.slaAtRisk },
            { label: "SLA Breached", count: kpiData.slaBreached }
        ];
    }, [kpiData]);

    const handleViewDetail = (demand) => {
        navigate(`/resource-management/demand/${demand.id}`);
    };

    const activeFilterCount = [
        clientFilter !== 'All',
        priorityFilter !== 'All'
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">

                {/* --- HEADER (Workforce Style) --- */}
                <header className="mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Demand Pipeline Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        A real-time snapshot of resource mandates, SLA compliance, and fulfillment status across the enterprise.
                    </p>
                </header>

                {/* --- KPI RIBBON (Workforce Style) --- */}
                <div className="mb-6 md:mb-8 min-h-[100px]">
                    <DemandKPIStrip data={activeKPIs} isLoading={isLoading} />
                </div>

                {/* --- PIPELINE CONTAINER --- */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

                    {/* Integrated Control Header */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-white">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                            {/* Tabs */}
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pipeline View</h3>
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                                        {filteredDemands.length} Records
                                    </span>
                                </div>

                                <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
                                    {[
                                        { id: 'breached', label: 'Breached', icon: ShieldAlert, color: 'text-rose-600' },
                                        { id: 'at_risk', label: 'At Risk', icon: AlertTriangle, color: 'text-orange-600' },
                                        { id: 'active', label: 'Active', icon: Activity, color: 'text-indigo-600' },
                                        { id: 'soft', label: 'Soft', icon: Zap, color: 'text-slate-600' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                                activeTab === tab.id
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? tab.color : "opacity-40")} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search & Filters */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search pipeline..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 w-[300px] pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    ref={filterButtonRef}
                                    onClick={() => setFilterCollapsed(!filterCollapsed)}
                                    className={cn(
                                        "h-10 px-5 flex items-center gap-2.5 rounded-lg text-xs font-bold transition-all border shadow-sm",
                                        !filterCollapsed
                                            ? "bg-slate-900 border-slate-900 text-white"
                                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filter
                                    {activeFilterCount > 0 && (
                                        <span className="h-4 w-4 rounded-full bg-indigo-600 text-[9px] flex items-center justify-center text-white ring-2 ring-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[1200px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 items-center gap-4 px-10 py-3.5 bg-slate-50/50 border-b border-slate-100">
                                <div className="col-span-6 text-[11px] font-bold text-slate-400 tracking-wider">Demand Specifications & Context</div>
                                <div className="col-span-1 text-[11px] font-bold text-slate-400 tracking-wider text-center">Priority Score</div>
                                <div className="col-span-2 text-[11px] font-bold text-slate-400 tracking-wider text-center">Governance Priority</div>
                                <div className="col-span-2 text-[11px] font-bold text-slate-400 tracking-wider text-center">SLA Compliance</div>
                                <div className="col-span-1 text-[11px] font-bold text-slate-400 tracking-wider text-center">Status</div>
                            </div>

                            {/* Data Rows */}
                            <div className="bg-white">
                                {isLoading ? (
                                    <div className="flex flex-col">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="px-10 py-6 border-b border-slate-50 animate-pulse flex items-center justify-between">
                                                <div className="flex items-center gap-4 w-1/3">
                                                    <div className="h-10 w-10 bg-slate-50 rounded-lg" />
                                                    <div className="space-y-2 flex-1">
                                                        <div className="h-3 w-3/4 bg-slate-50 rounded" />
                                                        <div className="h-2 w-1/2 bg-slate-50 rounded" />
                                                    </div>
                                                </div>
                                                <div className="h-4 w-1/12 bg-slate-50 rounded" />
                                                <div className="h-6 w-1/6 bg-slate-50 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredDemands.length === 0 ? (
                                    <div className="py-24 text-center">
                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Search className="h-8 w-8 text-slate-200" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">No matches found</h3>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                                    </div>
                                ) : (
                                    <DemandList
                                        demands={filteredDemands}
                                        onViewDetail={handleViewDetail}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- FILTER PORTAL --- */}
            {!filterCollapsed && dropdownPos && createPortal(
                <div
                    id="filter-workspace-portal"
                    className={cn(
                        "absolute bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] w-[340px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
                        dropdownPos.align === 'up' ? "origin-bottom" : "origin-top"
                    )}
                    style={{
                        top: dropdownPos.align === 'up' ? 'auto' : `${dropdownPos.top}px`,
                        bottom: dropdownPos.align === 'up' ? `${document.documentElement.scrollHeight - dropdownPos.top}px` : 'auto',
                        right: `${dropdownPos.right}px`,
                        maxHeight: `${dropdownPos.maxHeight}px`
                    }}
                >
                    <div className="p-2">
                        <DemandFilters
                            clientFilter={clientFilter}
                            onClientChange={setClientFilter}
                            priorityFilter={priorityFilter}
                            onPriorityChange={setPriorityFilter}
                            onReset={() => {
                                setClientFilter('All');
                                setPriorityFilter('All');
                            }}
                            activeCount={activeFilterCount}
                            inline={true}
                            onToggleCollapse={() => setFilterCollapsed(true)}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DemandWorkspacePage;
