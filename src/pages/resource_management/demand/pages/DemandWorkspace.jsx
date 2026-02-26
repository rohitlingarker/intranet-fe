import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import DemandKPIStrip from '../components/DemandKPIStrip';
import DemandList from '../components/DemandList';
import DemandFilters from '../components/DemandFilters';
import { MOCK_DEMANDS, KPI_DATA } from '../models/demand.mock';
import { ListFilter, Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Redefined KPIs for Demand Workspace
const DEMAND_KPIS = [
    { label: "Active Demands", count: 24, color: "bg-indigo-50 text-indigo-600" },
    { label: "Pending", count: 8, color: "bg-amber-50 text-amber-600" },
    { label: "Approved", count: 12, color: "bg-emerald-50 text-emerald-600" },
    { label: "SLA At Risk", count: 3, color: "bg-orange-50 text-orange-600" },
    { label: "SLA Breached", count: 2, color: "bg-rose-50 text-rose-600" },
    { label: "Emergency", count: 1, color: "bg-red-50 text-red-600" }
];

const DemandWorkspace = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCollapsed, setFilterCollapsed] = useState(true); // Default to collapsed
    const filterButtonRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState(null);

    // Advanced Filter States
    const [clientFilter, setClientFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    // Handle dropdown positioning ONLY at opening time
    useEffect(() => {
        if (!filterCollapsed && filterButtonRef.current) {
            const rect = filterButtonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const popupHeight = 420; // Enterprise height estimate
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Decide alignment ONCE at opening
            const align = (spaceBelow < popupHeight && spaceAbove > spaceBelow) ? 'up' : 'down';

            setDropdownPos({
                // Absolute page coordinates
                top: align === 'up' ? (rect.top + window.scrollY - 8) : (rect.bottom + window.scrollY + 8),
                right: window.innerWidth - (rect.right + window.scrollX),
                align,
                maxHeight: Math.min(viewportHeight * 0.7, align === 'up' ? spaceAbove - 24 : spaceBelow - 24)
            });
        }

        // Recalculate if window resizes while open
        const handleResize = () => {
            if (!filterCollapsed) setFilterCollapsed(true);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [filterCollapsed]);

    // Keyboard and click outside handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setFilterCollapsed(true);
        };

        const handleClickOutside = (event) => {
            if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
                const portal = document.getElementById('filter-portal-root');
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


    const handleViewDetail = (demand) => {
        navigate(`/resource-management/demand/${demand.id}`);
    };

    const filteredDemands = useMemo(() => {
        let list = [...MOCK_DEMANDS];

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(d =>
                d.projectName.toLowerCase().includes(query) ||
                d.role.toLowerCase().includes(query)
            );
        }

        // Default filter: exclude cancelled/closed
        list = list.filter(d => d.lifecycleState !== 'CANCELLED' && d.lifecycleState !== 'CLOSED');


        // Advanced Filters
        if (clientFilter !== 'All') {
            list = list.filter(d => d.client === clientFilter);
        }
        if (priorityFilter !== 'All') {
            list = list.filter(d => d.priority === priorityFilter.toUpperCase());
        }

        return list;
    }, [searchQuery, clientFilter, priorityFilter]);

    const activeFilterCount = [
        clientFilter !== 'All',
        priorityFilter !== 'All'
    ].filter(Boolean).length;

    const resetFilters = () => {
        setSearchQuery('');
        setClientFilter('All');
        setPriorityFilter('All');
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto">
                {/* Header Section - Matching Workforce Typography */}
                <div className="mb-4 md:mb-6">
                    <h1 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                        Demand Workspace Overview
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage and validate resource demands and real-time SLA tracking.
                    </p>
                </div>

                <div className="mb-4 md:mb-6">
                    <DemandKPIStrip data={DEMAND_KPIS} />
                </div>

                {/* Main Content Area - Split Layout like Workforce */}
                <div className="flex flex-col gap-4">
                    {/* Primary Content Container */}
                    <div className="flex-1 min-w-0 w-full bg-card rounded-lg border shadow-sm overflow-hidden flex flex-col">
                        {/* Header Bar - Matching Workforce Tab List Area */}
                        <div className="p-3 sm:p-4 border-b bg-white">
                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-sm font-heading font-bold text-slate-900">
                                        Demand Pipeline
                                    </h3>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {filteredDemands.length} records
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Search Input - Matching Admin Panel FilterBar */}
                                    <div className="relative group">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search demands..."
                                            className="w-72 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all placeholder:text-slate-400"
                                        />
                                    </div>

                                    {/* Filter Toggle Button - Matching Admin Panel FilterBar */}
                                    <button
                                        ref={filterButtonRef}
                                        onClick={() => setFilterCollapsed(!filterCollapsed)}
                                        className={cn(
                                            "relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-[0.98] shadow-sm",
                                            !filterCollapsed
                                                ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/20"
                                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                        )}
                                    >
                                        <Filter className={cn("h-3.5 w-3.5", !filterCollapsed ? "text-white" : "text-slate-500")} />
                                        Filters

                                        {/* Notification Badge - Identical to Admin Panel */}
                                        {filterCollapsed && activeFilterCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in duration-200">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Overlay Filter Panel - Absolute Page Anchor with Snap-to-Open logic */}
                                {!filterCollapsed && dropdownPos && createPortal(
                                    <div
                                        id="filter-portal-root"
                                        className={cn(
                                            "absolute bg-white border border-slate-200 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] z-[100] w-[280px] flex flex-col overflow-hidden animate-in fade-in duration-200",
                                            dropdownPos.align === 'up' ? "slide-in-from-bottom-2 origin-bottom" : "slide-in-from-top-2 origin-top"
                                        )}
                                        style={{
                                            top: dropdownPos.align === 'up' ? 'auto' : `${dropdownPos.top}px`,
                                            bottom: dropdownPos.align === 'up' ? `${document.documentElement.scrollHeight - dropdownPos.top}px` : 'auto',
                                            right: `${dropdownPos.right}px`,
                                            maxHeight: `${dropdownPos.maxHeight}px`
                                        }}
                                    >
                                        <DemandFilters
                                            clientFilter={clientFilter}
                                            onClientChange={setClientFilter}
                                            priorityFilter={priorityFilter}
                                            onPriorityChange={setPriorityFilter}
                                            onReset={resetFilters}
                                            activeCount={activeFilterCount}
                                            inline={true}
                                            onToggleCollapse={() => setFilterCollapsed(true)}
                                        />
                                    </div>,
                                    document.body
                                )}
                            </div>
                        </div>

                        {/* Structured Table Header */}
                        <div className="grid grid-cols-12 items-center gap-4 px-4 py-2.5 bg-slate-50 border-b">
                            <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demand</div>
                            <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Priority</div>
                            <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA status</div>
                            <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
                            <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</div>
                            <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</div>
                        </div>

                        {/* List Content Area */}
                        <div className="p-0 min-h-[600px] relative">
                            <div className="flex flex-col">
                                {filteredDemands.length > 0 ? (
                                    <DemandList
                                        demands={filteredDemands}
                                        onViewDetail={handleViewDetail}
                                    />
                                ) : (
                                    <div className="py-24 text-center">
                                        <p className="text-sm font-medium text-slate-400">No demands found matching current criteria.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DemandWorkspace;
