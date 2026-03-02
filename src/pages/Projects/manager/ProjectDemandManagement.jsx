import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import DemandKPIStrip from '../../resource_management/demand/components/DemandKPIStrip';
import DemandList from '../../resource_management/demand/components/DemandList';
import DemandFilters from '../../resource_management/demand/components/DemandFilters';
import { Search, Filter, Plus, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { getProjectById, checkDemandCreation } from '../../resource_management/services/projectService';
import { getSkillCategoriesTree, getProficiencyLevels } from "../../resource_management/services/workforceService";
import DemandModal from "../../resource_management/models/DemandModal";
import AddDeliverableRoleModal from "../../resource_management/models/AddDeliverableRoleModal";

const ProjectDemandManagement = ({ projectId, projectName }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCollapsed, setFilterCollapsed] = useState(true);
    const filterButtonRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState(null);

    // Advanced Filter States
    const [clientFilter, setClientFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('active');

    // Project & Modal states
    const [project, setProject] = useState(null);
    const [loadingProject, setLoadingProject] = useState(true);
    const [demandResponse, setDemandResponse] = useState(null);
    const [loadingDemand, setLoadingDemand] = useState(false);
    const [demandModalOpen, setDemandModalOpen] = useState(false);
    const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);

    // Deliverable Role Data
    const [categories, setCategories] = useState([]);
    const [skills, setSkills] = useState([]);
    const [subSkills, setSubSkills] = useState([]);
    const [proficiencyLevels, setProficiencyLevels] = useState([]);
    const [deliverableForm, setDeliverableForm] = useState({
        deliveryName: "",
        skillId: "",
        subSkillId: "",
        proficiencyId: "",
        mandatoryFlag: true,
    });

    // Fetch Project and Demand Check
    useEffect(() => {
        const fetchContext = async () => {
            try {
                setLoadingProject(true);
                const [projRes, demandRes] = await Promise.all([
                    getProjectById(projectId),
                    checkDemandCreation(projectId)
                ]);
                setProject(projRes.data);
                setDemandResponse(demandRes.data);
            } catch (err) {
                console.error("Failed to fetch project context", err);
                toast.error("Failed to load project details for demand creation");
            } finally {
                setLoadingProject(false);
            }
        };

        if (projectId) fetchContext();
    }, [projectId]);

    // Load Deliverable Role master data
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [catRes, profRes] = await Promise.all([
                    getSkillCategoriesTree(),
                    getProficiencyLevels()
                ]);
                setCategories(catRes.data || []);
                setProficiencyLevels(profRes.data?.data || []);
            } catch (err) {
                console.error("Failed to load master data", err);
            }
        };
        loadMasterData();
    }, []);

    const handleSaveDeliverable = () => {
        toast.success("Deliverable role draft saved");
        setDeliverableModalOpen(false);
    };

    // Handle dropdown positioning
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

    // Filter demands for this specific project (Empty until API linked)
    const projectDemands = useMemo(() => {
        return [];
    }, [projectName]);

    // Calculate dynamic KPIs for this project
    const projectKPIs = useMemo(() => {
        const active = projectDemands.filter(d => d.lifecycleState === 'ACTIVE').length;
        const fulfilled = projectDemands.filter(d => d.lifecycleState === 'FULFILLED').length;
        const soft = projectDemands.filter(d => d.lifecycleState === 'SOFT' || d.lifecycleState === 'REQUESTED').length;
        const pending = projectDemands.filter(d => d.lifecycleState === 'PENDING').length;
        const approved = projectDemands.filter(d => d.lifecycleState === 'APPROVED').length;

        return [
            { label: "Active", count: active, color: "bg-indigo-50 text-indigo-600" },
            { label: "Fulfilled", count: fulfilled, color: "bg-emerald-50 text-emerald-600" },
            { label: "Soft", count: soft, color: "bg-red-50 text-red-600" },
            { label: "Pending", count: pending, color: "bg-amber-50 text-amber-600" },
            { label: "Approved", count: approved, color: "bg-blue-50 text-blue-600" }
        ];
    }, [projectDemands]);

    const filteredDemands = useMemo(() => {
        let list = [...projectDemands];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(d =>
                d.projectName.toLowerCase().includes(query) ||
                d.role.toLowerCase().includes(query)
            );
        }

        list = list.filter(d => d.lifecycleState !== 'CANCELLED' && d.lifecycleState !== 'CLOSED');

        if (activeTab === 'fulfilled') {
            list = list.filter(d => d.lifecycleState === 'FULFILLED');
        } else if (activeTab === 'active') {
            list = list.filter(d => d.lifecycleState === 'ACTIVE' || d.lifecycleState === 'APPROVED');
        } else if (activeTab === 'soft') {
            list = list.filter(d => d.lifecycleState === 'SOFT' || d.lifecycleState === 'REQUESTED');
        }

        if (clientFilter !== 'All') {
            list = list.filter(d => d.client === clientFilter);
        }
        if (priorityFilter !== 'All') {
            list = list.filter(d => d.priority === priorityFilter.toUpperCase());
        }

        return list;
    }, [projectDemands, searchQuery, clientFilter, priorityFilter, activeTab]);

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
        <div className="bg-white min-h-[600px] border rounded-lg shadow-sm">
            <div className="p-4 border-b">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-800">Demand Management</h2>
                            <p className="text-sm text-slate-500">View and manage resource demands for {projectName}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDeliverableModalOpen(true)}
                                className="flex items-center gap-2 bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Deliverable Role
                            </button>

                            <button
                                disabled={!demandResponse?.create || loadingDemand}
                                onClick={() => setDemandModalOpen(true)}
                                title={!demandResponse?.create ? demandResponse?.reason : ""}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] shadow-sm",
                                    demandResponse?.create
                                        ? "bg-indigo-600 hover:bg-indigo-700"
                                        : "bg-slate-300 cursor-not-allowed opacity-70"
                                )}
                            >
                                <FilePlus className="w-3.5 h-3.5" />
                                Create Demand
                            </button>
                        </div>
                    </div>

                    <DemandKPIStrip data={projectKPIs} />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-slate-900">
                                Project Demand Pipeline
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                {filteredDemands.length} records
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search project demands..."
                                    className="w-72 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all placeholder:text-slate-400"
                                />
                            </div>

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
                                {filterCollapsed && activeFilterCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in duration-200">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-start gap-1 border-b -mx-4 px-4 pt-2">
                        {[
                            { id: 'fulfilled', label: 'Fullfilled' },
                            { id: 'active', label: 'Active' },
                            { id: 'soft', label: 'Soft demands' }
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "px-4 py-3 text-xs font-bold transition-all border-b-2 relative -mb-px flex-shrink-0",
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
            </div>

            {/* List Content Area */}
            <div className="p-0 relative">
                <div className="grid grid-cols-12 items-center gap-4 px-4 py-2.5 bg-slate-50 border-b">
                    <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demand</div>
                    <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Priority</div>
                    <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA status</div>
                    <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
                    <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</div>
                    <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</div>
                </div>

                <div className="flex flex-col">
                    {filteredDemands.length > 0 ? (
                        <DemandList
                            demands={filteredDemands}
                            onViewDetail={handleViewDetail}
                        />
                    ) : (
                        <div className="py-24 text-center">
                            <p className="text-sm font-medium text-slate-400">No demands found for this project matching criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay Filter Panel */}
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

            {/* Modals */}
            {demandModalOpen && (
                <DemandModal
                    open={demandModalOpen}
                    onClose={() => setDemandModalOpen(false)}
                    projectDetails={project}
                    onSuccess={() => {
                        setDemandModalOpen(false);
                        // Optional: trigger list refresh
                    }}
                />
            )}

            <AddDeliverableRoleModal
                open={deliverableModalOpen}
                onClose={() => setDeliverableModalOpen(false)}
                deliverableForm={deliverableForm}
                setDeliverableForm={setDeliverableForm}
                categories={categories}
                skills={skills}
                subSkills={subSkills}
                setSkills={setSkills}
                setSubSkills={setSubSkills}
                proficiencyLevels={proficiencyLevels}
                onSave={handleSaveDeliverable}
            />
        </div>
    );
};

export default ProjectDemandManagement;
