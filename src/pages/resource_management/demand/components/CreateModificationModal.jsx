import React, { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, Percent, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const emptyForm = {
  allocationId: "",
  currentAllocationPercentage: "",
  requestedAllocationPercentage: "",
  effectiveDate: "",
  reason: "",
};

const CreateModificationModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  resourceOptions,
  demand,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    setForm(emptyForm);
    setErrors({});
  }, [isOpen]);

  const selectedResource = useMemo(
    () =>
      resourceOptions.find(
        (resource) => String(resource.allocationId) === String(form.allocationId)
      ) || null,
    [form.allocationId, resourceOptions]
  );

  useEffect(() => {
    if (!selectedResource) {
      setForm((currentForm) => ({
        ...currentForm,
        currentAllocationPercentage: "",
      }));
      return;
    }

    const currentAllocation =
      selectedResource.currentAllocationPercentage ?? selectedResource.allocationPercentage ?? 0;

    setForm((currentForm) => ({
      ...currentForm,
      currentAllocationPercentage: String(currentAllocation),
    }));
  }, [selectedResource]);

  const validate = () => {
    const nextErrors = {};

    if (!form.allocationId) nextErrors.allocationId = "Resource is required";

    const requestedAllocation = Number(form.requestedAllocationPercentage);
    if (!Number.isFinite(requestedAllocation) || requestedAllocation < 0 || requestedAllocation > 100) {
      nextErrors.requestedAllocationPercentage =
        "Requested allocation must be between 0 and 100";
    }

    if (!form.effectiveDate) nextErrors.effectiveDate = "Effective date is required";
    if (!form.reason.trim()) nextErrors.reason = "Reason is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event?.preventDefault?.();

    if (!validate() || !selectedResource) return;

    await onSubmit({
      allocationId: selectedResource.allocationId,
      requestedAllocationPercentage: Number(form.requestedAllocationPercentage),
      effectiveDate: form.effectiveDate,
      reason: form.reason.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black leading-none tracking-tight text-slate-900">
                Create Modification
              </h2>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Allocation Change Request
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Demand
              </label>
              <Input
                readOnly
                value={demand?.demandName || "N/A"}
                className="h-10 cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <User className="h-3 w-3 text-indigo-500" />
                Resource
              </label>
              <select
                value={form.allocationId}
                onChange={(event) => {
                  const nextAllocationId = event.target.value;
                  const nextSelectedResource = resourceOptions.find(
                    (resource) => String(resource.allocationId) === String(nextAllocationId)
                  );
                  const nextCurrentAllocation =
                    nextSelectedResource?.currentAllocationPercentage ??
                    nextSelectedResource?.allocationPercentage ??
                    "";

                  setForm((currentForm) => ({
                    ...currentForm,
                    allocationId: nextAllocationId,
                    currentAllocationPercentage:
                      nextCurrentAllocation === "" ? "" : String(nextCurrentAllocation),
                    requestedAllocationPercentage:
                      nextCurrentAllocation === ""
                        ? ""
                        : String(nextCurrentAllocation),
                  }));
                }}
                className={cn(
                  "h-10 w-full rounded-xl border bg-white px-3 text-xs font-bold text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-indigo-400",
                  errors.allocationId ? "border-rose-500" : "border-slate-200"
                )}
              >
                <option value="">Select allocated resource</option>
                {resourceOptions.map((resource) => (
                  <option
                    key={resource.allocationId || resource.resourceId}
                    value={resource.allocationId || ""}
                  >
                    {String(form.allocationId) === String(resource.allocationId)
                      ? resource.resourceName
                      : `${resource.resourceName} | ${resource.allocationPercentage}% | ${
                          resource.allocationStartDate || "N/A"
                        } to ${resource.allocationEndDate || "N/A"}`}
                  </option>
                ))}
              </select>
              {errors.allocationId && (
                <p className="text-[9px] font-bold text-rose-500">{errors.allocationId}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Current Allocation %
              </label>
              <Input
                readOnly
                value={form.currentAllocationPercentage ? `${form.currentAllocationPercentage}%` : ""}
                className="h-10 cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <Percent className="h-3 w-3 text-indigo-500" />
                Requested Allocation %
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.requestedAllocationPercentage}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    requestedAllocationPercentage: event.target.value,
                  }))
                }
                className={cn(
                  "h-10 rounded-xl border-slate-200 text-xs font-bold text-slate-900",
                  errors.requestedAllocationPercentage && "border-rose-500"
                )}
              />
              {errors.requestedAllocationPercentage && (
                <p className="text-[9px] font-bold text-rose-500">
                  {errors.requestedAllocationPercentage}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <Calendar className="h-3 w-3 text-indigo-500" />
                Effective Date
              </label>
              <Input
                type="date"
                value={form.effectiveDate}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    effectiveDate: event.target.value,
                  }))
                }
                className={cn(
                  "h-10 rounded-xl border-slate-200 text-xs font-bold text-slate-900",
                  errors.effectiveDate && "border-rose-500"
                )}
              />
              {errors.effectiveDate && (
                <p className="text-[9px] font-bold text-rose-500">{errors.effectiveDate}</p>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Reason
              </label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    reason: event.target.value,
                  }))
                }
                placeholder="Explain why this allocation needs to change..."
                className={cn(
                  "w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
                  errors.reason && "border-rose-500"
                )}
              />
              {errors.reason && (
                <p className="text-[9px] font-bold text-rose-500">{errors.reason}</p>
              )}
            </div>
          </div>
        </form>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="h-10 flex-1 rounded-xl border-slate-200 text-[10px] font-bold tracking-widest text-slate-500 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || resourceOptions.length === 0}
            className="h-10 flex-[2] rounded-xl bg-indigo-600 text-[10px] font-black tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700"
          >
            {isSubmitting ? "Processing..." : "Create Modification"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateModificationModal;
