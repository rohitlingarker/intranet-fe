import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  X,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRoleOffReasons } from "@/pages/resource_management/services/roleOffService";
import { toast } from "react-toastify";

const formatReason = (str) => {
  if (typeof str !== 'string') return str;
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const isPendingStatus = (status) =>
  status === "Pending" || status === "Pending Approval";

const impactStyles = {
  Low: "border-teal-200 bg-teal-50 text-teal-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-rose-200 bg-rose-50 text-rose-700",
};

const roleOffStatusStyles = {
  "Not Requested": "border-slate-200 bg-slate-100 text-slate-700",
  "Pending Approval": "border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border-blue-200 bg-blue-50 text-blue-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
  Fulfilled: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const baseForm = {
  type: "Planned",
  effectiveDate: "",
  reason: "",
  replacementRequired: false,
  acknowledgeRisk: false,
  reviewConfirmed: false,
  decisionNotes: "",
  skipReason: "",
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const RoleOffSidePanel = ({
  open,
  mode,
  pmTab = "active",
  record,
  actionType,
  onClose,
  onSubmit,
  onRmApprove,
  onRmReject,
  onApprove,
  onReject,
}) => {
  const [form, setForm] = useState(baseForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [reviewState, setReviewState] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchReasons = async () => {
      try {
        const data = await getRoleOffReasons();
        if (active) {
          setReasons(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load role off reasons:", err);
      }
    };
    fetchReasons();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!record) {
      setForm(baseForm);
      setReviewState(null);
      setError("");
      return;
    }

    setForm({
      type: record.type || "Planned",
      effectiveDate: record.effectiveDateIso || "",
      reason: record.reason || "",
      replacementRequired: Boolean(record.replacementRequired),
      acknowledgeRisk: false,
      reviewConfirmed: false,
      decisionNotes: record.rejectionReason || "",
      skipReason: record.skipReason || "",
    });
    setReviewState(null);
    setError("");
  }, [record, open]);

  if (!open || !record) return null;

  const isPM = mode === "pm";
  const isRM = mode === "rm";
  const isDM = mode === "dm";
  const isReadOnlyPm = isPM && actionType === "view";
  const showRejectedDetails =
    isPM &&
    pmTab === "process" &&
    (
      String(record.roleOffStatus || "").trim() === "Rejected" ||
      Boolean(record.rejectedBy) ||
      Boolean(record.rejectionReason)
    );
  const needsRiskAck = record.impact === "High" && isPM;
  const panelTitle = isPM
    ? actionType === "view"
      ? "View Role-Off"
      : actionType === "update"
        ? "Update Role-Off"
        : "Create Role-Off"
    : isRM
      ? "Request Operations"
      : actionType === "reject"
        ? "Reject Request"
        : "Approval Review";

  const handleSubmit = async () => {
    if (isPM) {
      if (!form.reason || !form.effectiveDate) {
        setError("Reason and effective date are required.");
        return;
      }
      if (
        form.type === "Planned" &&
        !form.replacementRequired &&
        !form.skipReason?.trim()
      ) {
        setError("Skip reason is required for planned role-off.");
        return;
      }
      if (needsRiskAck && !form.acknowledgeRisk) {
        setError("High impact requests require acknowledgement.");
        return;
      }
      if (reviewState?.requiresConfirmation && !form.reviewConfirmed) {
        setError("Please review the role-off impact and confirm to proceed.");
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await onSubmit?.(form);
        if (response?.requiresConfirmation) {
          setReviewState(response);
          setForm((prev) => ({
            ...prev,
            reviewConfirmed: false,
          }));
          setError("");
          return;
        }
      } catch (error) {
        console.error("Error submitting role-off:", error);
        setError("Failed to submit role-off request.");
        toast.error(error.message || "Failed to submit role-off request.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isDM && actionType === "reject") {
      if (!form.decisionNotes.trim()) {
        setError("Rejection reason is required.");
        return;
      }
      setIsSubmitting(true);
      try {
        await onReject?.(record, form.decisionNotes.trim());
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isDM && actionType !== "reject") {
      setIsSubmitting(true);
      try {
        await onApprove?.(record, form.decisionNotes.trim());
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRmApproveClick = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await onRmApprove?.(record);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRmRejectClick = async () => {
    if (!form.decisionNotes.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onRmReject?.(record, form.decisionNotes.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDmApproveClick = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await onApprove?.(record, form.decisionNotes.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDmRejectClick = async () => {
    if (!form.decisionNotes.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onReject?.(record, form.decisionNotes.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-900/20 backdrop-blur-[1px]">
      <button type="button" disabled={isSubmitting} className="flex-1 cursor-default" onClick={onClose} aria-label="Close panel" />
      <div
        className="flex h-full w-full max-w-md flex-col overflow-hidden border-l border-gray-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              {panelTitle}
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#081534]">{record.resource}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {record.project} · {record.role}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-[#081534]">Context</h3>
            </div>
            <div className="space-y-3 text-sm">
              {isPM ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Role-Off Status</span>
                  <Badge
                    className={cn(
                      "text-[11px] font-semibold",
                      roleOffStatusStyles[record.roleOffStatus || "Not Requested"] || "border-slate-200 bg-slate-100 text-slate-700"
                    )}
                  >
                    {record.roleOffStatus || "Not Requested"}
                  </Badge>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Impact</span>
                <Badge className={cn("text-[11px] font-semibold", impactStyles[record.impact])}>
                  {record.impact}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Allocation</span>
                <span className="font-medium text-gray-800">{record.allocationPercent}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Client</span>
                <span className="font-medium text-gray-800">{record.client}</span>
              </div>
              <p className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600">
                {record.impactSummary}
              </p>
              {showRejectedDetails ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <p className="font-semibold">Rejected By</p>
                  <p className="mt-1">{record.rejectedBy || "-"}</p>
                  {showRejectedDetails ? (
                    <>
                      <p className="mt-3 font-semibold">Rejection Reason</p>
                      <p className="mt-1">{record.rejectionReason || "-"}</p>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          {isPM && !isReadOnlyPm ? (
            <>
              <section className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Role-Off Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                    disabled={isReadOnlyPm || isSubmitting}
                    className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    max={record.endDateIso || undefined}
                    value={form.effectiveDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, effectiveDate: event.target.value }))}
                    disabled={isReadOnlyPm || isSubmitting}
                    className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Reason
                  </label>
                  <select
                    value={form.reason}
                    onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                    disabled={isReadOnlyPm || isSubmitting}
                    className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select reason</option>
                    {reasons.map((r, idx) => {
                      const value = r.code || r.id || r.reason || r;
                      const label = r.label || r.name || r.reason || formatReason(r);
                      return (
                        <option key={idx} value={value}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <label className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
                  <span>Replacement required</span>
                  <input
                    type="checkbox"
                    checked={form.replacementRequired}
                    disabled={isReadOnlyPm || isSubmitting}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, replacementRequired: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                {/* 🔥 SHOW SKIP REASON WHEN REPLACEMENT IS NOT REQUIRED */}
                {!form.replacementRequired && (
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Skip Reason
                    </label>
                    <textarea
                      value={form.skipReason || ""}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          skipReason: event.target.value,
                        }))
                      }
                      disabled={isReadOnlyPm || isSubmitting}
                      placeholder="Enter reason for not creating replacement"
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {needsRiskAck ? (
                  <label className="flex gap-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-900">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                    <span className="flex-1">
                      <span className="mb-2 block">
                        High impact request. Acknowledge risk before submission.
                      </span>
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.acknowledgeRisk}
                          disabled={isReadOnlyPm || isSubmitting}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              acknowledgeRisk: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                        />
                        I acknowledge client and delivery impact.
                      </span>
                    </span>
                  </label>
                ) : null}

                {reviewState?.requiresConfirmation ? (
                  <section className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3">
                    <label className="flex items-start gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        checked={form.reviewConfirmed}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            reviewConfirmed: event.target.checked,
                          }))
                        }
                        className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>{reviewState.message || "Please review the role-off impact and confirm to proceed"}</span>
                    </label>
                  </section>
                ) : null}
              </section>
            </>
          ) : null}

          {isPM && isReadOnlyPm ? (
            <section className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Role-Off Type
                  </p>
                  <p className="mt-1 font-medium text-gray-800">{form.type || "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Effective Date
                  </p>
                  <p className="mt-1 font-medium text-gray-800">{record.effectiveDate || "-"}</p>
                </div>
              </div>
            </section>
          ) : null}

          {isRM ? (
            <section className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm font-semibold text-[#081534]">{record.status}</span>
              </div>
              <p className="text-sm text-gray-600">
                Review the role-off request details here, then approve or reject the request using the actions below.
              </p>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Rejection Reason
                </label>
                <textarea
                  rows={4}
                  value={form.decisionNotes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, decisionNotes: event.target.value }))
                  }
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Enter rejection reason if you want to reject this request"
                />
              </div>
            </section>
          ) : null}

          {isDM ? (
            <section className="space-y-4 rounded-lg border border-gray-200 p-4">
              {record.impact === "High" ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                    <span>High impact request. Review continuity, replacement, and transition risk before approval.</span>
                  </div>
                </div>
              ) : null}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Rejection Reason
                </label>
                <textarea
                  rows={5}
                  value={form.decisionNotes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, decisionNotes: event.target.value }))
                  }
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Enter rejection reason if you want to reject this request"
                />
              </div>
            </section>
          ) : null}

          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="border-t border-gray-200 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {!isRM && !isDM ? (
              <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="h-10 border-gray-300 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {isReadOnlyPm ? "Back" : "Close"}
              </Button>
            ) : null}
            {isPM && !isReadOnlyPm ? (
              <Button onClick={handleSubmit} disabled={isSubmitting || (reviewState?.requiresConfirmation && !form.reviewConfirmed)} className="h-10 bg-[#081534] text-sm hover:bg-[#10214f] disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {isSubmitting
                  ? (actionType === "update" ? "Updating..." : "Creating...")
                  : (actionType === "update" ? "Update Request" : "Create Request")}
              </Button>
            ) : null}
            {isRM ? (
              <>
                <Button
                  onClick={handleRmApproveClick}
                  disabled={isSubmitting || !isPendingStatus(record.status)}
                  className={`h-10 bg-[#081534] text-sm hover:bg-[#10214f] disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitting || !isPendingStatus(record.status) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRmRejectClick}
                  disabled={isSubmitting || !isPendingStatus(record.status)}
                  className={`h-10 border-rose-300 bg-white text-sm text-rose-700 hover:bg-rose-50 hover:text-rose-800 disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitting || !isPendingStatus(record.status) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {/* {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} */}
                  Reject
                </Button>
              </>
            ) : null}
            {isDM ? (
              <>
                <Button
                  onClick={handleDmApproveClick}
                  disabled={isSubmitting}
                  className="h-10 bg-[#081534] text-sm hover:bg-[#10214f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Fulfill
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDmRejectClick}
                  disabled={isSubmitting}
                  className="h-10 border-rose-300 bg-white text-sm text-rose-700 hover:bg-rose-50 hover:text-rose-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Reject
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleOffSidePanel;
