import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  Filter,
  Search,
  Users,
  UserRoundMinus,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getResources } from "@/pages/resource_management/services/roleOffService";
import KPISection from "./KPISection";
import RoleOffTable from "./RoleOffTable";
import BulkActionBar from "./BulkActionBar";
import RoleOffFilterPanel from "./RoleOffFilterPanel";
import RoleOffSidePanel from "./RoleOffSidePanel";
import RoleOffSummaryCard from "./RoleOffSummaryCard";
import CancelRoleOffModal from "./CancelRoleOffModal";
import { createRoleOff, pmCancelRoleOff, rmApprove, rmReject, dlFulfill, dlReject, getPendingRoleOffs, getPendingRoleOffsForDM }
  from "../../pages/resource_management/services/roleOffService";

const mapStatus = (item) => {
  if (item.roleOffStatus === "PENDING") return "Pending Approval";
  if (item.roleOffStatus === "APPROVED") return "Approved";
  if (item.roleOffStatus === "REJECTED") return "Rejected";
  if (item.roleOffStatus === "FULFILLED") return "Fulfilled";
  return "Not Requested";
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
    roleOffId: item.roleOffId || null,
    roleOffStatus: mapStatus(item),
    effectiveDate: formatDisplayDate(item.effectiveDate),
    effectiveDateIso: item.effectiveDate || "",
    reason: item.roleOffReason || "",
    rejectionReason: item.rejectionReason || "",
    rejectedBy: item.rejectedBy || "",

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
  const pendingRequests = allocations.filter((item) => item.roleOffStatus === "Pending Approval");
  const totalRoleOffs = allocations.filter((item) => item.roleOffStatus && item.roleOffStatus !== "Not Requested");

  return [
    { label: "Active Allocations", count: activeAllocations.length },
    { label: "Pending Role-Offs", count: pendingRequests.length },
    { label: "High Impact Allocations", count: activeAllocations.filter((item) => item.impact === "High").length },
    { label: "Total RoleOff", count: totalRoleOffs.length },
  ];
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const PM_QUEUE_TABS = [
  { id: "active", label: "Active" },
  { id: "process", label: "Roleoff Process" },
  { id: "fulfilled", label: "Fulfilled Roleoff" },
];

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const RoleOffWorkspace = ({ mode, embedded = false, projectId: projectIdProp, projectName = "" }) => {
  const params = useParams();
  const navigate = useNavigate();
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
  const [pmActiveTab, setPmActiveTab] = useState("active");
  const [panelState, setPanelState] = useState({
    open: false,
    actionType: "create",
    record: null,
  });
  const [cancelModalState, setCancelModalState] = useState({
    open: false,
    record: null,
    isSubmitting: false,
  });

  const loadPmResources = useCallback(async (isActiveRef = () => true) => {
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
      if (!isActiveRef()) return;

      const nextAllocations = Array.isArray(response?.data)
        ? response.data.map(mapResourceToAllocation)
        : [];

      setAllocations(nextAllocations);
    } catch (error) {
      if (!isActiveRef()) return;

      setAllocations([]);
      toast.error("Failed to load role-off resources");
    }
  }, [mode, projectId]);

  useEffect(() => {
    let active = true;
    loadPmResources(() => active);

    return () => {
      active = false;
    };
  }, [loadPmResources]);

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

  const pmTabCounts = useMemo(() => ({
    active: scopedAllocations.filter(
      (item) =>
        item.status === "Active" &&
        (item.roleOffStatus === "Not Requested" || item.roleOffStatus === "Rejected"),
    ).length,
    process: scopedAllocations.filter(
      (item) =>
        item.status === "Active" &&
        item.roleOffStatus !== "Not Requested" &&
        item.roleOffStatus !== "Fulfilled",
    ).length,
    fulfilled: scopedAllocations.filter(
      (item) => item.status === "Active" && item.roleOffStatus === "Fulfilled",
    ).length,
  }), [scopedAllocations]);

  const visibleRows = useMemo(() => {
    const baseRows =
      mode === "pm"
        ? scopedAllocations.filter((item) => {
            if (item.status !== "Active") return false;

            if (pmActiveTab === "fulfilled") {
              return item.roleOffStatus === "Fulfilled";
            }

            if (pmActiveTab === "process") {
              return item.roleOffStatus !== "Not Requested" && item.roleOffStatus !== "Fulfilled";
            }

            return item.roleOffStatus === "Not Requested" || item.roleOffStatus === "Rejected";
          })
        : mode === "rm"
          ? scopedRoleOffRequests
          : scopedRoleOffRequests;

    return baseRows.filter((row) => {
      const searchTarget = [row.resource, row.project, row.role, row.client].join(" ").toLowerCase();
      const matchesSearch = filters.search ? searchTarget.includes(filters.search.toLowerCase()) : true;
      const matchesStatus = filters.status ? row.status === filters.status : true;
      const matchesImpact = filters.impact ? row.impact === filters.impact : true;
      const matchesReason = filters.reason ? row.reason === filters.reason : true;
      return matchesSearch && matchesStatus && matchesImpact && matchesReason;
    });
  }, [scopedAllocations, scopedRoleOffRequests, mode, filters, pmActiveTab]);


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

  const getPmActionType = (row, currentTab = pmActiveTab) => {
    const roleOffStatus = String(row.roleOffStatus || "").trim();

    if (currentTab === "active") {
      return "create";
    }

    if (
      roleOffStatus === "Approved" ||
      roleOffStatus === "Fulfilled" ||
      roleOffStatus === "Rejected"
    ) {
      return "view";
    }

    if (roleOffStatus !== "Not Requested") {
      return "update";
    }

    return "create";
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

    if (mode === "pm" && action === "cancel") {
      setCancelModalState({
        open: true,
        record: row,
        isSubmitting: false,
      });
      return;
    }

    if (mode === "pm" && (action === "roleoff" || action === "edit" || action === "view")) {
      openSidePanel(row, getPmActionType(row, pmActiveTab));
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
      openSidePanel(row, getPmActionType(row, pmActiveTab));
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
        roleOffId: panelState.actionType === "update" ? allocation.roleOffId : undefined,
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
      await loadPmResources();
      toast.success(
        panelState.actionType === "update"
          ? "Role-off request updated"
          : "Role-off request created"
      );

      // await fetchRoleOffs(); // refresh

      setPanelState({ open: false, actionType: "create", record: null });
      return response;

    } catch (err) {
      console.error(err);
      toast.error("Failed to create role-off");
      throw err;
    }
  };

  const handlePmCancelRoleOff = async () => {
    const record = cancelModalState.record;
    if (!record?.roleOffId) {
      toast.error("Role-off ID is missing");
      return;
    }

    setCancelModalState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await pmCancelRoleOff(record.roleOffId);
      await loadPmResources();
      setCancelModalState({ open: false, record: null, isSubmitting: false });
      toast.success("Role-off request cancelled");
    } catch (err) {
      console.error(err);
      setCancelModalState((prev) => ({ ...prev, isSubmitting: false }));
      toast.error(err?.response?.data?.message || "Failed to cancel role-off");
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          {!embedded ? (
            mode !== "pm" ? (
              <div>
                <h1 className="text-2xl font-bold text-[#081534]">{pageCopy.title}</h1>
                <p className="mt-1 text-sm text-gray-500">{pageCopy.subtitle}</p>
              </div>
            ) : null
          ) : (
            mode !== "pm" ? (
              <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-xl font-bold text-[#081534]">{pageCopy.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {projectName
                    ? `${pageCopy.subtitle} Current project: ${projectName}.`
                    : pageCopy.subtitle}
                </p>
              </div>
            ) : null
          )}
        </div>
        <div className="ml-4 shrink-0">
          <button
            onClick={() => navigate('/resource-management/roleoff/report')}
            className="inline-flex items-center gap-2 rounded-md bg-[#081534] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#10214f]"
          >
            <ClipboardCheck className="h-4 w-4" />
            Roleoff Report
          </button>
        </div>
      </div>

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

        <div className="flex flex-col gap-4">
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
                <div className="flex flex-1 justify-end">
                  <div className="flex w-full max-w-md items-center gap-1">
                    <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, search: event.target.value }))
                      }
                      placeholder={mode === "pm" ? "Search resource, client or role" : "Search resource, project, client or role"}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition-colors focus:border-blue-500"
                    />
                    </div>
                    {mode !== "pm" ? (
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setFilterPanelCollapsed((prev) => !prev)}
                          className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
                            filterPanelCollapsed
                              ? "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-[#081534]"
                              : "border-[#081534] bg-[#081534] text-white hover:bg-[#10214f]"
                          }`}
                        >
                          <Filter className="h-4 w-4" />
                          Filters
                        </button>

                        {!filterPanelCollapsed ? (
                          <div className="absolute right-0 top-12 z-20">
                            <RoleOffFilterPanel
                              collapsed={filterPanelCollapsed}
                              filters={filters}
                              onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
                              onReset={() => setFilters({ search: "", status: "", impact: "", reason: "" })}
                              onApply={() => setFilterPanelCollapsed(true)}
                              onClose={() => setFilterPanelCollapsed(true)}
                              mode={mode}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
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

              {mode === "pm" ? (
                <div className="mt-2 pt-1">
                  <div className="flex items-end gap-8 overflow-x-auto px-1">
                  {PM_QUEUE_TABS.map((tab) => {
                    const isActive = pmActiveTab === tab.id;
                    const count = pmTabCounts[tab.id] || 0;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setPmActiveTab(tab.id);
                          setSelectedRows([]);
                        }}
                        className={`group relative inline-flex items-center gap-2 whitespace-nowrap px-1 pb-3 pt-2 text-left transition-colors ${
                          isActive
                            ? "text-[#263383]"
                            : "text-gray-600 hover:text-[#263383]"
                        }`}
                      >
                        <span className={`text-[15px] font-semibold leading-tight ${
                          isActive ? "text-[#263383]" : "text-gray-700"
                        }`}>
                          {tab.label}
                        </span>
                        <span className={`text-xs font-medium ${
                          isActive ? "text-[#263383]" : "text-gray-400 group-hover:text-[#263383]"
                        }`}>
                          {count}
                        </span>
                        <span
                          className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-blue-600 transition-all ${
                            isActive ? "w-full opacity-100" : "w-0 opacity-0"
                          }`}
                        />
                      </button>
                    );
                  })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4">

              <RoleOffTable
                mode={mode}
                pmTab={pmActiveTab}
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
        pmTab={pmActiveTab}
        record={panelState.record}
        actionType={panelState.actionType}
      onClose={() => setPanelState({ open: false, actionType: "view", record: null })}
      onSubmit={handlePanelSubmit}
      onRmApprove={handleRmApprove}
      onRmReject={handleRmReject}
      onApprove={handleApproveRequest}
      onReject={handleRejectRequest}
      />

      <CancelRoleOffModal
        open={cancelModalState.open}
        record={cancelModalState.record}
        isSubmitting={cancelModalState.isSubmitting}
        onClose={() => {
          if (cancelModalState.isSubmitting) return;
          setCancelModalState({ open: false, record: null, isSubmitting: false });
        }}
        onSubmit={handlePmCancelRoleOff}
      />
    </div>
  );
};

export default RoleOffWorkspace;


