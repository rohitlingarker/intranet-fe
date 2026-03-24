import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  Search,
  Users,
  UserRoundMinus,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getResources } from "@/pages/resource_management/services/roleOffService";
import KPISection from "./KPISection";
import RoleOffTable from "./RoleOffTable";
import BulkActionBar from "./BulkActionBar";
import RoleOffFilterPanel from "./RoleOffFilterPanel";
import RoleOffSidePanel from "./RoleOffSidePanel";
import RoleOffSummaryCard from "./RoleOffSummaryCard";
import { createRoleOff, rmApprove, rmReject, dlFulfill, dlReject, getPendingRoleOffs, getPendingRoleOffsForDM }
  from "../../pages/resource_management/services/roleOffService";

const mapStatus = (item) => {
  if (item.roleOffStatus === "PENDING") return "Pending Approval";
  if (item.roleOffStatus === "APPROVED") return "Approved";
  if (item.roleOffStatus === "REJECTED") return "Rejected";
  if (item.roleOffStatus === "FULFILLED") return "Fulfilled";
  return "Pending Approval";
};

const TODAY = new Date().toISOString().slice(0, 10);

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

const formatDisplayDate = (dateIso) => {
  if (!dateIso) return "-";

  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeStatus = (status) => {
  if (!status) return "Active";

  const upperStatus = String(status).toUpperCase();
  if (upperStatus === "ACTIVE") return "Active";
  if (upperStatus === "PENDING_APPROVAL") return "Pending Approval";
  if (upperStatus === "APPROVED") return "Approved";
  if (upperStatus === "REJECTED") return "Rejected";
  if (upperStatus === "CANCELLED") return "Cancelled";

  return status;
};

const normalizeImpact = (impact) => {
  if (!impact) return "Low";

  const upperImpact = String(impact).toUpperCase();
  if (upperImpact === "LOW") return "Low";
  if (upperImpact === "MEDIUM") return "Medium";
  if (upperImpact === "HIGH") return "High";

  return impact;
};

const mapResourceToAllocation = (item, index) => {
  const allocation = {
    // 🔥 CRITICAL FIXES
    id: item.id || item.allocationId,          // ✅ UUID (MANDATORY)
    allocationId: item.id || item.allocationId, // ✅ backup
    projectId: item.projectId,                // ✅ REQUIRED
    resourceId: item.resourceId,              // ✅ REQUIRED
    deliveryRoleId: item.deliveryRoleId,      // ✅ REQUIRED FOR DEMAND

    // ✅ UI FIELDS (keep flexible)
    resource:
      item.name ||
      item.resourceName ||
      item.resource?.name ||
      "-",

    project:
      item.projectName ||
      item.project?.name ||
      "-",

    client:
      item.clientName ||
      item.project?.client?.name ||
      "-",

    department: item.department || "-",

    role:
      item.demandName ||
      item.roleName ||
      item.role?.name ||
      "-",

    skill:
      [...(item.skills || []), ...(item.subSkills || [])]
        .filter(Boolean)
        .join(", ") || "-",

    allocationPercent: Number(item.allocationPercentage || 0),

    endDate: formatDisplayDate(item.endDate),
    endDateIso: item.endDate || "",

    status: normalizeStatus(item.status),

    businessCritical: Number(item.allocationPercentage || 0) >= 90,
    keyPosition: false,
    backupReady: Number(item.allocationPercentage || 0) < 70,
    backfillWindowDays: 30,
  };

  return {
    ...enrichAllocation(allocation),
    impact: normalizeImpact(item.impact),
  };
};

const mapPendingRoleOffToRequest = (item) => ({
  id: item.roleOffId || item.id || item.allocationId,
  roleOffId: item.roleOffId || item.id || item.allocationId,
  allocationId: item.allocationId,
  resourceId: item.resourceId,
  deliveryRoleId: item.deliveryRoleId,
  resource:
    item.name ||
    item.resourceName ||
    item.resource?.name ||
    "-",
  project:
    item.projectName ||
    item.project?.name ||
    "-",
  client:
    item.clientName ||
    item.project?.client?.name ||
    "-",
  department: item.department || "-",
  role:
    item.demandName ||
    item.roleName ||
    item.role?.name ||
    "-",
  skill:
    [...(item.skills || []), ...(item.subSkills || [])]
      .filter(Boolean)
      .join(", ") || "-",
  impact: normalizeImpact(item.impact),
  impactSummary: `Pending role-off request for ${item.projectName || "the current project"} with ${Number(item.allocationPercentage || 0)}% allocation.`,
  status: mapStatus(item),
  allocationPercent: Number(item.allocationPercentage || 0),
  effectiveDate: formatDisplayDate(item.effectiveDate),
  effectiveDateIso: item.effectiveDate || "",
  endDate: formatDisplayDate(item.endDate),
  endDateIso: item.endDate || "",
  replacementRequired: Boolean(item.demandName),
  reason: item.roleOffReason || item.demandName || "",
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
        icon: <Check className="h-5 w-5" />,
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
        icon: <Check className="h-5 w-5" />,
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
      icon: <Check className="h-5 w-5" />,
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

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const RoleOffWorkspace = ({ mode, embedded = false, projectId: projectIdProp, projectName = "" }) => {
  const params = useParams();
  const projectId = projectIdProp || params.projectId;
  const [allocations, setAllocations] = useState([]);
  const [roleOffRequests, setRoleOffRequests] = useState([]);
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

  useEffect(() => {
    let active = true;

    const loadResources = async () => {
      if (mode !== "pm") {
        setAllocations([]);
        return;
      }

      if (!projectId) {
        setAllocations([]);
        return;
      }

      try {
        const response = await getResources(projectId);
        if (!active) return;

        const nextAllocations = Array.isArray(response?.data)
          ? response.data.map(mapResourceToAllocation)
          : [];

        setAllocations(nextAllocations);
      } catch (error) {
        if (!active) return;

        setAllocations([]);
        toast.error("Failed to load role-off resources");
      }
    };

    loadResources();

    return () => {
      active = false;
    };
  }, [mode, projectId]);

  useEffect(() => {
    let active = true;

    const loadPendingRoleOffRequests = async () => {
      if (mode !== "rm" && mode !== "dm") {
        setRoleOffRequests([]);
        return;
      }

      try {
        const response = mode === "dm"
          ? await getPendingRoleOffsForDM()
          : await getPendingRoleOffs();
        if (!active) return;

        const data = extractArrayPayload(response);
        setRoleOffRequests(data.map(mapPendingRoleOffToRequest));
      } catch (error) {
        if (!active) return;

        setRoleOffRequests([]);
        toast.error(
          mode === "dm"
            ? "Failed to load DM role-off requests"
            : "Failed to load pending role-off requests",
        );
      }
    };

    loadPendingRoleOffRequests();

    return () => {
      active = false;
    };
  }, [mode]);

  // useEffect(() => {
  //   fetchRoleOffs();
  // }, []);

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
          : scopedRoleOffRequests;

    return baseRows.filter((row) => {
      const searchTarget = [row.resource, row.project, row.role, row.client].join(" ").toLowerCase();
      const matchesSearch = filters.search ? searchTarget.includes(filters.search.toLowerCase()) : true;
      const matchesStatus = filters.status ? row.status === filters.status : true;
      const matchesImpact = filters.impact ? row.impact === filters.impact : true;
      const matchesReason =
        filters.reason && row.reason ? row.reason === filters.reason : true;
      return matchesSearch && matchesStatus && matchesImpact && matchesReason;
    });
  }, [scopedAllocations, scopedRoleOffRequests, mode, filters]);


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

  const handleRmApprove = async (request) => {
    try {
      await rmApprove(request.id);
      setRoleOffRequests((prev) =>
        prev.map((item) =>
          item.id === request.id ? { ...item, status: "Approved" } : item,
        ),
      );
      setPanelState({ open: false, actionType: "view", record: null });
      toast.success("Approved by RM");
      // await fetchRoleOffs();
    } catch (err) {
      console.error(err);
      toast.error("RM approval failed");
    }
  };

  const handleRmReject = async (request, rejectionReason) => {
    try {
      await rmReject(request.id, rejectionReason);
      setRoleOffRequests((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, status: "Rejected", rejectionReason }
            : item,
        ),
      );
      setPanelState({ open: false, actionType: "view", record: null });
      toast.error("Rejected by RM");
      // await fetchRoleOffs();
    } catch (err) {
      console.error(err);
      toast.error("RM rejection failed");
    }
  };

  const handleTableAction = async (action, row) => {

    // PM (NO CHANGE)
    if (mode === "pm" && action === "roleoff") {
      openSidePanel(row, "create");
      return;
    }

    // RM VIEW
    if (mode === "rm" && action === "view") {
      openSidePanel(row, "view");
      return;
    }

    if (mode === "dm" && action === "view") {
      openSidePanel(row, "view");
      return;
    }

    // 🔥 RM APPROVE
    if (mode === "rm" && action === "approve") {
      try {
        await rmApprove(row.id);
        toast.success("Approved by RM");
        // await fetchRoleOffs();
      } catch (err) {
        console.error(err);
        toast.error("RM approval failed");
      }
      return;
    }

    // 🔥 RM REJECT
    if (mode === "rm" && action === "reject") {
      try {
        await rmReject(row.id, "Rejected by RM");
        toast.error("Rejected by RM");
        // await fetchRoleOffs();
      } catch (err) {
        console.error(err);
        toast.error("RM rejection failed");
      }
      return;
    }

    // 🔥 DM APPROVE (FULFILL)
    if (mode === "dm" && action === "approve") {
      try {
        await dlFulfill(row.id);
        toast.success("DL Approved");
        // await fetchRoleOffs();
      } catch (err) {
        console.error(err);
        toast.error("DL approval failed");
      }
      return;
    }

    // 🔥 DM REJECT
    if (mode === "dm" && action === "reject") {
      try {
        await dlReject(row.id, "Rejected by DL");
        toast.error("DL Rejected");
        // await fetchRoleOffs();
      } catch (err) {
        console.error(err);
        toast.error("DL rejection failed");
      }
      return;
    }
  };


  const handleRowClick = (row) => {
    if (mode === "pm") {
      openSidePanel(row, "create");
      return;
    }

    openSidePanel(row, "view");
  };

  const handlePanelSubmit = async (formState) => {
    try {
      const allocation = panelState.record;

      const payload = {
        projectId: projectId,
        resourceId: allocation.resourceId,
        allocationId: allocation.id,
        roleOffType: formState.type.toUpperCase(),
        effectiveRoleOffDate: formState.effectiveDate,
        roleOffReason: formState.reason,
        autoReplacementRequired: formState.replacementRequired,
        skipReason: formState.replacementRequired ? null : formState.skipReason,
        confirmed: Boolean(formState.reviewConfirmed),
        deliveryRoleId: formState.replacementRequired ? allocation.deliveryRoleId : null,
      };

      const response = await createRoleOff(payload);
      if (response?.requiresConfirmation && !formState.reviewConfirmed) {
        return response;
      }
      toast.success("Role-off request created");

      // await fetchRoleOffs(); // refresh

      setPanelState({ open: false, actionType: "create", record: null });
      return response;

    } catch (err) {
      console.error(err);
      toast.error("Failed to create role-off");
      throw err;
    }
  };

  // const fetchRoleOffs = async () => {
  //   try {
  //     const response = await getAllRoleOffs();
  //     const data = extractArrayPayload(response);

  //     const mapped = data.map((item) => ({
  //       id: item.id,
  //       allocationId: item.allocation?.id,
  //       resource: item.resource?.name,
  //       project: item.project?.name,
  //       role: item.role?.name || "N/A",
  //       impact: "Medium",
  //       status: mapStatus(item),
  //       effectiveDate: item.effectiveRoleOffDate,
  //       effectiveDateIso: item.effectiveRoleOffDate,
  //       reason: item.roleOffReason,
  //     }));

  //     setRoleOffRequests(mapped);

  //   } catch (err) {
  //     setRoleOffRequests([]);
  //     if (err.response?.status === 403) {
  //       toast.error("You do not have access to view role-off requests");
  //     } else {
  //       toast.error("Failed to load role-off requests");
  //     }
  //     console.error(err);
  //   }
  // };


  // const handleBulkCreate = () => {
  //   if (selectedRows.length === 0) return;

  //   const requests = scopedAllocations
  //     .filter((item) => selectedRows.includes(item.id))
  //     .map((allocation) =>
  //       createRoleOffRequest(allocation, {
  //         type: allocation.impact === "High" ? "Emergency" : "Planned",
  //         reason: allocation.impact === "High" ? "Critical Dependency" : "Project Completion",
  //         replacementRequired: allocation.impact !== "Low",
  //         effectiveDate: TODAY,
  //       }),
  //     );

  //   setRoleOffRequests((prev) => [...requests, ...prev]);
  //   setSelectedRows([]);
  //   toast.success(`${requests.length} role-off requests created`);
  // };

  const handleApproveRequest = async (request) => {
    try {
      await dlFulfill(request.id);
      setRoleOffRequests((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, status: "Approved" }
            : item,
        ),
      );
      setPanelState({ open: false, actionType: "view", record: null });
      toast.success(`${request.resource} role-off approved`);
    } catch (err) {
      console.error(err);
      toast.error("DL approval failed");
    }
  };

  const handleRejectRequest = async (request, reason) => {
    try {
      await dlReject(request.id, reason);
      setRoleOffRequests((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, status: "Rejected", rejectionReason: reason }
            : item,
        ),
      );
      setPanelState({ open: false, actionType: "view", record: null });
      toast.error(`${request.resource} role-off rejected`);
    } catch (err) {
      console.error(err);
      toast.error("DL rejection failed");
    }
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
        onRmApprove={handleRmApprove}
        onRmReject={handleRmReject}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
    </div>
  );
};

export default RoleOffWorkspace;


