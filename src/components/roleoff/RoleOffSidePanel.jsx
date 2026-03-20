import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const impactStyles = {
  Low: "border-teal-200 bg-teal-50 text-teal-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-rose-200 bg-rose-50 text-rose-700",
};

const baseForm = {
  type: "Planned",
  effectiveDate: "",
  reason: "",
  replacementRequired: false,
  acknowledgeRisk: false,
  decisionNotes: "",
  skipReason: "",
};

const RoleOffSidePanel = ({
  open,
  mode,
  record,
  actionType,
  onClose,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
}) => {
  const [form, setForm] = useState(baseForm);
  const [error, setError] = useState("");

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
      setError("");
      return;
    }

    setForm({
      type: record.type || "Planned",
      effectiveDate: record.effectiveDateIso || "",
      reason: record.reason || "",
      replacementRequired: Boolean(record.replacementRequired),
      acknowledgeRisk: false,
      decisionNotes: record.rejectionReason || "",
      skipReason: record.skipReason || "",
    });
    setError("");
  }, [record, open]);

  if (!open || !record) return null;

  const isPM = mode === "pm";
  const isRM = mode === "rm";
  const isDM = mode === "dm";
  const needsRiskAck = record.impact === "High" && isPM;
  const panelTitle = isPM
    ? actionType === "update"
      ? "Update Role-Off"
      : "Create Role-Off"
    : isRM
      ? "Request Operations"
      : actionType === "reject"
        ? "Reject Request"
        : "Approval Review";

  const handleSubmit = () => {
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
      console.log("Submitting form:", form);
      onSubmit?.(form);
      return;
    }

    if (isDM && actionType === "reject") {
      if (!form.decisionNotes.trim()) {
        setError("Rejection reason is required.");
        return;
      }
      onReject?.(record, form.decisionNotes.trim());
      return;
    }

    if (isDM && actionType !== "reject") {
      onApprove?.(record, form.decisionNotes.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-900/20 backdrop-blur-[1px]">
      <button type="button" className="flex-1 cursor-default" onClick={onClose} aria-label="Close panel" />
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
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
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
            </div>
          </section>

          {isPM ? (
            <>
              <section className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Role-Off Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
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
                    value={form.effectiveDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, effectiveDate: event.target.value }))}
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
                    className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select reason</option>
                    <option value="PROJECT_END">Project End</option>
                    <option value="ATTRITION">Attrition</option>
                    <option value="PERFORMANCE">Performance Issue</option>
                    <option value="CLIENT_REQUEST">Client Request</option>
                  </select>
                </div>

                <label className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
                  <span>Replacement required</span>
                  <input
                    type="checkbox"
                    checked={form.replacementRequired}
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
              </section>
            </>
          ) : null}

          {isRM ? (
            <section className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm font-semibold text-[#081534]">{record.status}</span>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
                <span>Replacement planned</span>
                <input
                  type="checkbox"
                  checked={form.replacementRequired}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, replacementRequired: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <p className="text-sm text-gray-600">
                RM can manage replacement planning and cancel pending requests. Approval remains with DM.
              </p>
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
                  Decision Notes
                </label>
                <textarea
                  rows={5}
                  value={form.decisionNotes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, decisionNotes: event.target.value }))
                  }
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder={actionType === "reject" ? "Provide rejection reason" : "Add review notes"}
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
            <Button variant="outline" onClick={onClose} className="h-10 border-gray-300 bg-white text-sm">
              Close
            </Button>
            {isPM ? (
              <Button onClick={handleSubmit} className="h-10 bg-[#081534] text-sm hover:bg-[#10214f]">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {actionType === "update" ? "Update Request" : "Create Request"}
              </Button>
            ) : null}
            {isRM && record.status === "Pending Approval" ? (
              <Button
                variant="outline"
                onClick={() => onCancel?.(record)}
                className="h-10 border-rose-300 bg-white text-sm text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              >
                Cancel Request
              </Button>
            ) : null}
            {isDM ? (
              <Button onClick={handleSubmit} className="h-10 bg-[#081534] text-sm hover:bg-[#10214f]">
                {actionType === "reject" ? "Reject Request" : "Approve Request"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleOffSidePanel;
