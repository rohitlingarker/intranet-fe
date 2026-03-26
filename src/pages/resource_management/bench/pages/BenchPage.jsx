import React, { useEffect, useMemo, useState } from "react";
import { Download, Filter, Layers, Search, Users } from "lucide-react";
import BenchKPI from "../components/BenchKPI";
import BenchFilters from "../components/BenchFilters";
import BenchTable from "../components/BenchTable";
import BenchDrawer from "../components/BenchDrawer";
import AllocateModal from "../components/AllocateModal";
import MoveToPoolModal from "../components/MoveToPoolModal";
import {
  BENCH_STORAGE_KEY,
  BENCH_TABS,
  CATEGORY_OPTIONS,
  FILTER_DEFAULTS,
} from "../constants/benchConstants";
import {
  filterResources,
  getBenchMetrics,
  getUniqueValues,
  sanitizeResources,
  toCsv,
  updateCategory,
} from "../models/benchModel";
import { getBenchResources } from "../services/benchService";

const getStoredState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(BENCH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const downloadCsv = (filename, content) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const BenchPage = () => {
  const stored = getStoredState();
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState(stored?.search || "");
  const [activeTab, setActiveTab] = useState(stored?.activeTab || "bench");
  const [filters, setFilters] = useState(stored?.filters || FILTER_DEFAULTS);
  const [draftFilters, setDraftFilters] = useState(stored?.filters || FILTER_DEFAULTS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState(stored?.selectedResourceId || null);
  const [drawerOpen, setDrawerOpen] = useState(Boolean(stored?.selectedResourceId));
  const [allocateTargets, setAllocateTargets] = useState([]);
  const [moveToPoolTargets, setMoveToPoolTargets] = useState([]);
  const [bulkCategory, setBulkCategory] = useState(CATEGORY_OPTIONS[0]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const response = await getBenchResources();
      if (!active) return;
      setResources(sanitizeResources(response?.data || []));
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
      BENCH_STORAGE_KEY,
      JSON.stringify({
        search,
        activeTab,
        filters,
        selectedResourceId,
      }),
    );
  }, [search, activeTab, filters, selectedResourceId]);

  const visibleRows = useMemo(
    () => filterResources(resources, search, filters, activeTab),
    [resources, search, filters, activeTab],
  );
  const selectedResource = useMemo(
    () => resources.find((item) => item.id === selectedResourceId) || null,
    [resources, selectedResourceId],
  );
  const metrics = useMemo(() => getBenchMetrics(resources), [resources]);
  const filterOptions = useMemo(
    () => ({
      categories: CATEGORY_OPTIONS,
      locations: getUniqueValues(resources, "location"),
    }),
    [resources],
  );
  const tabCounts = useMemo(
    () => ({
      bench: filterResources(resources, "", FILTER_DEFAULTS, "bench").length,
      pool: filterResources(resources, "", FILTER_DEFAULTS, "pool").length,
    }),
    [resources],
  );

  const baseVisibleCount = activeTab === "bench" ? tabCounts.bench : tabCounts.pool;
  const selectedItems = resources.filter((item) => selectedRows.includes(item.id));

  const setResourceCategory = (resourceIds, category) => {
    if (!CATEGORY_OPTIONS.includes(category)) return;
    setResources((prev) =>
      prev.map((item) => (resourceIds.includes(item.id) ? updateCategory(item, category) : item)),
    );
  };

  const handleToggleAll = (checked) => {
    setSelectedRows(checked ? visibleRows.map((item) => item.id) : []);
  };

  const handleToggleRow = (id, checked) => {
    setSelectedRows((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id),
    );
  };

  const handleView = (resource) => {
    setSelectedResourceId(resource.id);
    setDrawerOpen(true);
  };

  const handleAllocate = (targets) => {
    setAllocateTargets(Array.isArray(targets) ? targets : [targets]);
  };

  const handleMoveToPool = (targets) => {
    setMoveToPoolTargets(Array.isArray(targets) ? targets : [targets]);
  };

  const applyAllocation = ({ project, allocation, startDate }) => {
    const ids = allocateTargets.map((item) => item.id);

    setResources((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              allocation,
              availability: Math.max(0, 100 - allocation),
              lastAllocationDate: startDate,
              poolType: "",
              category: "Not Available",
              lastProject: {
                name: project,
                client: "Assigned",
                endDate: startDate,
                reason: "Allocated from bench management",
              },
            }
          : item,
      ),
    );

    setSelectedRows((prev) => prev.filter((id) => !ids.includes(id)));
    setAllocateTargets([]);
    if (selectedResourceId && ids.includes(selectedResourceId)) {
      setDrawerOpen(false);
      setSelectedResourceId(null);
    }
  };

  const applyMoveToPool = ({ poolType, reason }) => {
    const ids = moveToPoolTargets.map((item) => item.id);
    const poolCategory = poolType === "Training" ? "Training" : "Shadow";

    setResources((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              poolType,
              category: poolCategory,
              transitionReason: reason,
              lastProject: {
                ...item.lastProject,
                reason,
              },
            }
          : item,
      ),
    );

    setSelectedRows((prev) => prev.filter((id) => !ids.includes(id)));
    setMoveToPoolTargets([]);
  };

  const handleExport = () => {
    downloadCsv(`bench-${activeTab}-view.csv`, toCsv(visibleRows));
  };

  const emptyState = baseVisibleCount === 0
    ? "No bench records available."
    : "No results match the current search and filters.";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#081534]">Bench Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Auto-detected bench supply, internal pool movement, and simulated allocation control in one workspace.
        </p>
      </div>

      <BenchKPI items={metrics} />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-8 overflow-x-auto px-1">
              {BENCH_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.id === "bench" ? Users : Layers;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedRows([]);
                    }}
                    className={`group relative inline-flex items-center gap-2 whitespace-nowrap px-1 pb-3 pt-2 text-left transition-colors ${
                      isActive ? "text-[#263383]" : "text-gray-600 hover:text-[#263383]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className={`text-[15px] font-semibold leading-tight ${isActive ? "text-[#263383]" : "text-gray-700"}`}>
                      {tab.label}
                    </span>
                    <span className={`text-xs font-medium ${isActive ? "text-[#263383]" : "text-gray-400 group-hover:text-[#263383]"}`}>
                      {tabCounts[tab.id] || 0}
                    </span>
                    <span className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-blue-600 transition-all ${isActive ? "w-full opacity-100" : "w-0 opacity-0"}`} />
                  </button>
                );
              })}
            </div>

            <div className="flex w-full max-w-2xl items-center justify-end gap-1">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, role, skill or location"
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div className="relative shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFilterPanelOpen((prev) => !prev)}
                    className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
                      filterPanelOpen
                        ? "border-[#081534] bg-[#081534] text-white hover:bg-[#10214f]"
                        : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-[#081534]"
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-[#081534]"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>

                {filterPanelOpen ? (
                  <div className="absolute right-0 top-12 z-20">
                    <BenchFilters
                      open={filterPanelOpen}
                      draftFilters={draftFilters}
                      filterOptions={filterOptions}
                      onChange={(key, value) => setDraftFilters((prev) => ({ ...prev, [key]: value }))}
                      onReset={() => {
                        setDraftFilters(FILTER_DEFAULTS);
                        setFilters(FILTER_DEFAULTS);
                        setFilterPanelOpen(false);
                      }}
                      onApply={() => {
                        setFilters(draftFilters);
                        setFilterPanelOpen(false);
                      }}
                      onClose={() => setFilterPanelOpen(false)}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#081534]">Bench Queue</p>
              <p className="text-xs text-slate-500">
                {activeTab === "bench"
                  ? "Visible records are unallocated and eligible for immediate bench operations."
                  : "Internal pool records remain outside the available bench supply until allocated back to delivery."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bulkCategory}
                onChange={(event) => setBulkCategory(event.target.value)}
                className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={() => setResourceCategory(selectedRows, bulkCategory)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Layers className="h-4 w-4" />
                Change Category
              </button>
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={() => handleAllocate(selectedItems)}
                className="h-9 rounded-md bg-[#081534] px-3 text-sm font-medium text-white transition-colors hover:bg-[#10214f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Allocate
              </button>
              {activeTab === "bench" ? (
                <button
                  type="button"
                  disabled={selectedItems.length === 0}
                  onClick={() => handleMoveToPool(selectedItems)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Move To Pool
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-4">
          <BenchTable
            rows={visibleRows}
            selectedRows={selectedRows}
            activeRowId={selectedResourceId}
            emptyState={emptyState}
            onToggleAll={handleToggleAll}
            onToggleRow={handleToggleRow}
            onView={handleView}
            onCategoryChange={(id, category) => setResourceCategory([id], category)}
          />
        </div>
      </div>

      <BenchDrawer
        open={drawerOpen}
        resource={selectedResource}
        onClose={() => setDrawerOpen(false)}
        onAllocate={(resource) => handleAllocate(resource)}
        onMoveToPool={(resource) => handleMoveToPool(resource)}
      />

      <AllocateModal
        open={allocateTargets.length > 0}
        resources={allocateTargets}
        onClose={() => setAllocateTargets([])}
        onSubmit={applyAllocation}
      />

      <MoveToPoolModal
        open={moveToPoolTargets.length > 0}
        resources={moveToPoolTargets}
        onClose={() => setMoveToPoolTargets([])}
        onSubmit={applyMoveToPool}
      />
    </div>
  );
};

export default BenchPage;
