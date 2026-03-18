import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCheck,
  ClipboardCheck,
  Search,
  Users,
  UserRoundMinus,
} from "lucide-react";
import { toast } from "react-toastify";
import KPISection from "./KPISection";
import RoleOffTable from "./RoleOffTable";
import BulkActionBar from "./BulkActionBar";
import RoleOffFilterPanel from "./RoleOffFilterPanel";
import RoleOffSidePanel from "./RoleOffSidePanel";
import RoleOffSummaryCard from "./RoleOffSummaryCard";

const TODAY = "2026-03-17";

const seedAllocations = [
  {
    id: "AL-1001",
    resource: "Ananya Rao",
    project: "Mercury ERP Rollout",
    client: "Asterix Manufacturing",
    department: "Enterprise Delivery",
    role: "Lead Frontend Engineer",
    skill: "React / UI Architecture",
    allocationPercent: 100,
    startDate: "Jan 15, 2026",
    startDateIso: "2026-01-15",
    endDate: "Apr 30, 2026",
    endDateIso: "2026-04-30",
    status: "Active",
    businessCritical: true,
    keyPosition: true,
    backupReady: false,
    backfillWindowDays: 5,
  },
  {
    id: "AL-1002",
    resource: "Rahul Menon",
    project: "Northwind Data Platform",
    client: "Northwind Retail",
    department: "Data Engineering",
    role: "Data Engineer",
    skill: "Databricks / SQL",
    allocationPercent: 80,
    startDate: "Feb 01, 2026",
    startDateIso: "2026-02-01",
    endDate: "Jun 15, 2026",
    endDateIso: "2026-06-15",
    status: "Active",
    businessCritical: false,
    keyPosition: false,
    backupReady: true,
    backfillWindowDays: 20,
  },
  {
    id: "AL-1003",
    resource: "Meera Iyer",
    project: "Orion Support Transition",
    client: "Orion Health",
    department: "Managed Services",
    role: "Support Analyst",
    skill: "ITSM / Service Ops",
    allocationPercent: 60,
    startDate: "Jan 20, 2026",
    startDateIso: "2026-01-20",
    endDate: "Mar 28, 2026",
    endDateIso: "2026-03-28",
    status: "Active",
    businessCritical: false,
    keyPosition: false,
    backupReady: true,
    backfillWindowDays: 30,
  },
  {
    id: "AL-1004",
    resource: "Karan Verma",
    project: "Summit Banking Portal",
    client: "Summit Bank",
    department: "Digital Delivery",
    role: "QA Lead",
    skill: "Automation / Release Quality",
    allocationPercent: 90,
    startDate: "Dec 01, 2025",
    startDateIso: "2025-12-01",
    endDate: "May 31, 2026",
    endDateIso: "2026-05-31",
    status: "Active",
    businessCritical: true,
    keyPosition: false,
    backupReady: false,
    backfillWindowDays: 10,
  },
  {
    id: "AL-1005",
    resource: "Priya Nair",
    project: "Vertex Mobile Modernization",
    client: "Vertex Logistics",
    department: "Mobile Engineering",
    role: "Android Engineer",
    skill: "Kotlin / CI-CD",
    allocationPercent: 70,
    startDate: "Feb 18, 2026",
    startDateIso: "2026-02-18",
    endDate: "Jul 15, 2026",
    endDateIso: "2026-07-15",
    status: "Active",
    businessCritical: false,
    keyPosition: false,
    backupReady: true,
    backfillWindowDays: 18,
  },
];

const deriveImpact = (allocation) => {
  if (
    allocation.businessCritical ||
    allocation.keyPosition ||
    allocation.allocationPercent >= 90 ||
    !allocation.backupReady ||
    allocation.backfillWindowDays <= 7
  ) {
    return "High";
  }

  if (allocation.allocationPercent >= 70 || allocation.backfillWindowDays <= 21) {
    return "Medium";
  }

  return "Low";
};

const buildImpactSummary = (allocation) => {
  const reasons = [];

  if (allocation.businessCritical) reasons.push("project milestone dependency");
  if (allocation.keyPosition) reasons.push("single-point ownership");
  if (!allocation.backupReady) reasons.push("no active backup identified");
  if (allocation.allocationPercent >= 90) reasons.push("high utilization on allocation");

  if (reasons.length === 0) {
    return "Delivery impact is contained with available backup coverage and standard transition window.";
  }

  return `Delivery impact is elevated due to ${reasons.join(", ")}.`;
};

const enrichAllocation = (allocation) => ({
  ...allocation,
  impact: deriveImpact(allocation),
  impactSummary: buildImpactSummary(allocation),
});

const seedRoleOffRequests = seedAllocations.slice(0, 4).map((allocation, index) => {
  const enriched = enrichAllocation(allocation);

  const preset = [
    {
      roleOffId: "RO-2401",
      type: "Planned",
      reason: "Project Completion",
      status: "Pending Approval",
      effectiveDate: "Mar 22, 2026",
      effectiveDateIso: "2026-03-22",
      replacementRequired: false,
      submittedBy: "PM Office",
      requestedOn: "Mar 15, 2026",
    },
    {
      roleOffId: "RO-2402",
      type: "Emergency",
      reason: "Critical Dependency",
      status: "Pending Approval",
      effectiveDate: "Mar 24, 2026",
      effectiveDateIso: "2026-03-24",
      replacementRequired: true,
      submittedBy: "PM Office",
      requestedOn: "Mar 16, 2026",
    },
    {
      roleOffId: "RO-2403",
      type: "Planned",
      reason: "Budget Realignment",
      status: "Approved",
      effectiveDate: "Mar 17, 2026",
      effectiveDateIso: TODAY,
      replacementRequired: true,
      submittedBy: "PM Office",
      requestedOn: "Mar 11, 2026",
      approvedDateIso: TODAY,
    },
    {
      roleOffId: "RO-2404",
      type: "Planned",
      reason: "Client Ramp Down",
      status: "Cancelled",
      effectiveDate: "Mar 26, 2026",
      effectiveDateIso: "2026-03-26",
      replacementRequired: false,
      submittedBy: "PM Office",
      requestedOn: "Mar 12, 2026",
    },
  ][index];

  return {
    id: preset.roleOffId,
    roleOffId: preset.roleOffId,
    role_off_id: preset.roleOffId,
    allocationId: enriched.id,
    allocation_id: enriched.id,
    resource: enriched.resource,
    project: enriched.project,
    client: enriched.client,
    department: enriched.department,
    role: enriched.role,
    skill: enriched.skill,
    impact: enriched.impact,
    impactSummary: enriched.impactSummary,
    allocationPercent: enriched.allocationPercent,
    effectiveDate: preset.effectiveDate,
    effectiveDateIso: preset.effectiveDateIso,
    type: preset.type,
    reason: preset.reason,
    status: preset.status,
    replacementRequired: preset.replacementRequired,
    submittedBy: preset.submittedBy,
    requestedOn: preset.requestedOn,
    approvedDateIso: preset.approvedDateIso || "",
  };
});

const titleMap = {
  pm: {
    title: "Role-Off Management",
    subtitle: "Project Manager workspace for initiating and tracking role-off requests on active allocations.",
  },
  rm: {
    title: "Role-Off Operations",
    subtitle: "Resource Manager view across all role-off requests, replacement planning, and cancellation controls.",
  },
  dm: {
    title: "Role-Off Approvals",
    subtitle: "Delivery Manager approval queue for pending role-off decisions and high impact review handling.",
  },
};

const formatDisplayDate = (dateIso) =>
  new Date(dateIso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const buildKpis = (mode, allocations, roleOffRequests, selectedRows) => {
  const activeAllocations = allocations.filter((item) => item.status === "Active");
  const pendingRequests = roleOffRequests.filter((item) => item.status === "Pending Approval");
  const highImpactPending = pendingRequests.filter((item) => item.impact === "High");

  if (mode === "pm") {
    return [
      {
        label: "Active Allocations",
        value: activeAllocations.length,
        icon: <Users className="h-5 w-5" />,
        iconWrapperClassName: "border-blue-100 bg-blue-50 text-blue-700",
      },
      {
        label: "Pending Role-Offs",
        value: pendingRequests.length,
        icon: <UserRoundMinus className="h-5 w-5" />,
        iconWrapperClassName: "border-amber-100 bg-amber-50 text-amber-700",
      },
      {
        label: "At Risk",
        value: activeAllocations.filter((item) => item.impact === "High").length,
        icon: <AlertTriangle className="h-5 w-5" />,
        iconWrapperClassName: "border-rose-100 bg-rose-50 text-rose-700",
      },
      {
        label: "Selected Count",
        value: selectedRows.length,
        icon: <CheckCheck className="h-5 w-5" />,
        iconWrapperClassName: "border-slate-100 bg-slate-100 text-slate-700",
      },
    ];
  }

  if (mode === "rm") {
    return [
      {
        label: "Active Allocations",
        value: activeAllocations.length,
        icon: <Users className="h-5 w-5" />,
        iconWrapperClassName: "border-blue-100 bg-blue-50 text-blue-700",
      },
      {
        label: "Pending Requests",
        value: pendingRequests.length,
        icon: <ClipboardCheck className="h-5 w-5" />,
        iconWrapperClassName: "border-amber-100 bg-amber-50 text-amber-700",
      },
      {
        label: "At Risk",
        value: highImpactPending.length,
        icon: <AlertTriangle className="h-5 w-5" />,
        iconWrapperClassName: "border-rose-100 bg-rose-50 text-rose-700",
      },
      {
        label: "Replacement Created",
        value: roleOffRequests.filter((item) => item.replacementRequired).length,
        icon: <CheckCheck className="h-5 w-5" />,
        iconWrapperClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
      },
    ];
  }

  return [
    {
      label: "Pending Approvals",
      value: pendingRequests.length,
      icon: <ClipboardCheck className="h-5 w-5" />,
      iconWrapperClassName: "border-amber-100 bg-amber-50 text-amber-700",
    },
    {
      label: "High Impact Requests",
      value: highImpactPending.length,
      icon: <AlertTriangle className="h-5 w-5" />,
      iconWrapperClassName: "border-rose-100 bg-rose-50 text-rose-700",
    },
    {
      label: "Approved Today",
      value: roleOffRequests.filter((item) => item.approvedDateIso === TODAY).length,
      icon: <CheckCheck className="h-5 w-5" />,
      iconWrapperClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
  ];
};

const buildPmDemandStyleKpis = (allocations, roleOffRequests, selectedRows) => {
  const activeAllocations = allocations.filter((item) => item.status === "Active");
  const pendingRequests = roleOffRequests.filter((item) => item.status === "Pending Approval");

  return [
    { label: "Active Allocations", count: activeAllocations.length },
    { label: "Pending Role-Offs", count: pendingRequests.length },
    { label: "High Impact Allocations", count: activeAllocations.filter((item) => item.impact === "High").length },
    { label: "Total RoleOff", count: roleOffRequests.length },
  ];
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const RoleOffWorkspace = ({ mode, embedded = false, projectName = "" }) => {
  const [allocations] = useState(seedAllocations.map(enrichAllocation));
  const [roleOffRequests, setRoleOffRequests] = useState(seedRoleOffRequests);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    impact: "",
    reason: "",
  });
  const [panelState, setPanelState] = useState({
    open: false,
    actionType: "create",
    record: null,
  });

  const pageCopy = titleMap[mode];
  const scopedAllocations = useMemo(() => {
    if (!projectName) return allocations;

    const normalizedProjectName = normalizeText(projectName);
    const matches = allocations.filter(
      (item) => normalizeText(item.project) === normalizedProjectName,
    );

    return matches.length > 0 ? matches : allocations;
  }, [allocations, projectName]);

  const scopedRoleOffRequests = useMemo(() => {
    if (!projectName) return roleOffRequests;

    const normalizedProjectName = normalizeText(projectName);
    const matches = roleOffRequests.filter(
      (item) => normalizeText(item.project) === normalizedProjectName,
    );

    return matches.length > 0 ? matches : roleOffRequests;
  }, [roleOffRequests, projectName]);

  const kpis = useMemo(
    () => buildKpis(mode, scopedAllocations, scopedRoleOffRequests, selectedRows),
    [mode, scopedAllocations, scopedRoleOffRequests, selectedRows],
  );
  const pmKpis = useMemo(
    () => buildPmDemandStyleKpis(scopedAllocations, scopedRoleOffRequests, selectedRows),
    [scopedAllocations, scopedRoleOffRequests, selectedRows],
  );

  const visibleRows = useMemo(() => {
    const baseRows =
      mode === "pm"
        ? scopedAllocations.filter((item) => item.status === "Active")
        : mode === "rm"
          ? scopedRoleOffRequests
          : scopedRoleOffRequests.filter((item) => item.status === "Pending Approval");

    return baseRows.filter((row) => {
      const searchTarget = [row.resource, row.project, row.role, row.client].join(" ").toLowerCase();
      const matchesSearch = filters.search ? searchTarget.includes(filters.search.toLowerCase()) : true;
      const matchesStatus = filters.status ? row.status === filters.status : true;
      const matchesImpact = filters.impact ? row.impact === filters.impact : true;
      const matchesReason = filters.reason ? row.reason === filters.reason : true;
      return matchesSearch && matchesStatus && matchesImpact && matchesReason;
    });
  }, [scopedAllocations, scopedRoleOffRequests, mode, filters]);

  const createRoleOffRequest = (allocation, formState) => {
    const nextId = `RO-${Date.now().toString().slice(-6)}-${allocation.id.slice(-2)}`;

    return {
      id: nextId,
      roleOffId: nextId,
      role_off_id: nextId,
      allocationId: allocation.id,
      allocation_id: allocation.id,
      resource: allocation.resource,
      project: allocation.project,
      client: allocation.client,
      department: allocation.department,
      role: allocation.role,
      skill: allocation.skill,
      impact: allocation.impact,
      impactSummary: allocation.impactSummary,
      allocationPercent: allocation.allocationPercent,
      type: formState.type,
      reason: formState.reason,
      status: "Pending Approval",
      effectiveDate: formatDisplayDate(formState.effectiveDate),
      effectiveDateIso: formState.effectiveDate,
      replacementRequired: formState.replacementRequired,
      submittedBy: "Project Manager",
      requestedOn: formatDisplayDate(TODAY),
      approvedDateIso: "",
    };
  };

  const handleToggleRow = (id, checked) => {
    setSelectedRows((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const handleToggleAll = (checked) => {
    setSelectedRows(checked ? visibleRows.map((item) => item.id) : []);
  };

  const openSidePanel = (record, actionType = "view") => {
    setPanelState({
      open: true,
      actionType,
      record,
    });
  };

  const handleCancelRequest = (request) => {
    setRoleOffRequests((prev) =>
      prev.map((item) =>
        item.id === request.id ? { ...item, status: "Cancelled" } : item,
      ),
    );
    setPanelState({ open: false, actionType: "view", record: null });
    toast.info(`${request.resource} request cancelled`);
  };

  const handleTableAction = (action, row) => {
    if (mode === "pm" && action === "roleoff") {
      openSidePanel(row, "create");
      return;
    }

    if (mode === "rm" && action === "view") {
      openSidePanel(row, "view");
      return;
    }

    if (mode === "rm" && action === "cancel") {
      handleCancelRequest(row);
      return;
    }

    if (mode === "dm" && action === "approve") {
      setRoleOffRequests((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, status: "Approved", approvedDateIso: TODAY }
            : item,
        ),
      );
      toast.success(`${row.resource} role-off approved`);
      return;
    }

    if (mode === "dm" && (action === "review" || action === "reject")) {
      openSidePanel(row, action === "reject" ? "reject" : "approve");
    }
  };

  const handleRowClick = (row) => {
    if (mode === "pm") {
      openSidePanel(row, "create");
      return;
    }

    if (mode === "rm") {
      openSidePanel(row, "view");
      return;
    }

    openSidePanel(row, row.impact === "High" ? "approve" : "approve");
  };

  const handlePanelSubmit = (formState) => {
    const existingRequest = roleOffRequests.find(
      (item) => item.allocationId === panelState.record?.id && item.status === "Pending Approval",
    );

    if (existingRequest) {
      setRoleOffRequests((prev) =>
        prev.map((item) =>
          item.id === existingRequest.id
            ? {
              ...item,
              type: formState.type,
              reason: formState.reason,
              effectiveDate: formatDisplayDate(formState.effectiveDate),
              effectiveDateIso: formState.effectiveDate,
              replacementRequired: formState.replacementRequired,
            }
            : item,
        ),
      );
      toast.success(`${panelState.record.resource} role-off request updated`);
    } else {
      const request = createRoleOffRequest(panelState.record, formState);
      setRoleOffRequests((prev) => [request, ...prev]);
      toast.success(`${request.resource} role-off request created`);
    }

    setPanelState({ open: false, actionType: "create", record: null });
    setSelectedRows((prev) => prev.filter((id) => id !== panelState.record?.id));
  };

  const handleBulkCreate = () => {
    if (selectedRows.length === 0) return;

    const requests = scopedAllocations
      .filter((item) => selectedRows.includes(item.id))
      .map((allocation) =>
        createRoleOffRequest(allocation, {
          type: allocation.impact === "High" ? "Emergency" : "Planned",
          reason: allocation.impact === "High" ? "Critical Dependency" : "Project Completion",
          replacementRequired: allocation.impact !== "Low",
          effectiveDate: TODAY,
        }),
      );

    setRoleOffRequests((prev) => [...requests, ...prev]);
    setSelectedRows([]);
    toast.success(`${requests.length} role-off requests created`);
  };

  const handleApproveRequest = (request) => {
    setRoleOffRequests((prev) =>
      prev.map((item) =>
        item.id === request.id
          ? { ...item, status: "Approved", approvedDateIso: TODAY }
          : item,
      ),
    );
    setPanelState({ open: false, actionType: "approve", record: null });
    toast.success(`${request.resource} role-off approved`);
  };

  const handleRejectRequest = (request, reason) => {
    setRoleOffRequests((prev) =>
      prev.map((item) =>
        item.id === request.id
          ? { ...item, status: "Rejected", rejectionReason: reason }
          : item,
      ),
    );
    setPanelState({ open: false, actionType: "reject", record: null });
    toast.error(`${request.resource} role-off rejected`);
  };

  return (
    <div className={embedded ? "bg-gray-50 p-0" : "min-h-screen bg-gray-50 p-6"}>
      {!embedded ? (
        mode !== "pm" ? (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#081534]">{pageCopy.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{pageCopy.subtitle}</p>
          </div>
        ) : null
      ) : (
        mode !== "pm" ? (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-xl font-bold text-[#081534]">{pageCopy.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {projectName
                ? `${pageCopy.subtitle} Current project: ${projectName}.`
                : pageCopy.subtitle}
            </p>
          </div>
        ) : null
      )}

      <div className="space-y-6">
        {mode === "pm" ? (
          <RoleOffSummaryCard
            title="Role-Off Management"
            description={
              projectName
                ? `Project Manager workspace for initiating and tracking role-off requests on active allocations. Current project: ${projectName}.`
                : "Project Manager workspace for initiating and tracking role-off requests on active allocations."
            }
            metrics={pmKpis}
          />
        ) : (
          <KPISection items={kpis} />
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {mode !== "pm" ? (
            <RoleOffFilterPanel
              collapsed={filterPanelCollapsed}
              onToggle={() => setFilterPanelCollapsed((prev) => !prev)}
              filters={filters}
              onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
              onReset={() => setFilters({ search: "", status: "", impact: "", reason: "" })}
              mode={mode}
            />
          ) : null}

          <div className="flex-1 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4">
              <div className="flex items-center w-full gap-4">

                {/* LEFT - TITLE */}
                <div className="shrink-0">
                  <h3 className="text-lg font-bold text-[#081534] whitespace-nowrap">
                    Role-Off Queue
                  </h3>
                </div>

                {/* CENTER - SEARCH */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, search: event.target.value }))
                      }
                      placeholder="Search resource, project, client or role"
                      className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition-colors focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* RIGHT - FILTERS */}
                {mode === "pm" ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={filters.impact}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, impact: event.target.value }))
                      }
                      className="h-10 min-w-[140px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Impact</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <select
                      value={filters.reason}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, reason: event.target.value }))
                      }
                      className="h-10 min-w-[160px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Reason</option>
                      <option value="Project Completion">Project Completion</option>
                      <option value="Client Ramp Down">Client Ramp Down</option>
                      <option value="Performance Issue">Performance Issue</option>
                      <option value="Budget Realignment">Budget Realignment</option>
                      <option value="Critical Dependency">Critical Dependency</option>
                      <option value="Emergency Transition">Emergency Transition</option>
                    </select>
                  </div>
                ) : null}

              </div>
            </div>

            <div className="p-4">
              {mode === "pm" ? (
                <div className="mb-4">
                  <BulkActionBar
                    count={selectedRows.length}
                    onClear={() => setSelectedRows([])}
                    onCreate={handleBulkCreate}
                  />
                </div>
              ) : null}

              <RoleOffTable
                mode={mode}
                rows={visibleRows}
                selectedRows={selectedRows}
                activeRowId={panelState.record?.id}
                onToggleRow={handleToggleRow}
                onToggleAll={handleToggleAll}
                onAction={handleTableAction}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </div>
      </div>

      <RoleOffSidePanel
        open={panelState.open}
        mode={mode}
        record={panelState.record}
        actionType={panelState.actionType}
        onClose={() => setPanelState({ open: false, actionType: "view", record: null })}
        onSubmit={handlePanelSubmit}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        onCancel={handleCancelRequest}
      />
    </div>
  );
};

export default RoleOffWorkspace;
