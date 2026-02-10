import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { createDemand } from "../services/projectService";
import { toast } from "react-toastify";

/* -------------------- Constants -------------------- */

const DEMAND_TYPES = ["NET_NEW", "BACKFILL", "EMERGENCY", "REPLACEMENT"];
const DEMAND_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "ALLOCATED",
  "CLOSED",
];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

/* -------------------- Listbox Field -------------------- */

const ListboxField = ({ label, value, onChange, options, error, required = true }) => (
  <div className="w-full">
    <label className="text-xs text-gray-600 mb-1 block">
      {label} {required && <span className="text-red-600">*</span>}
    </label>

    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button
          className={`w-full rounded-md border bg-white py-2 pl-3 pr-10 text-left text-sm
            ${error ? "border-red-500" : "border-gray-300"}
          `}
        >
          <span className="block truncate">{value || "Select"}</span>
          <ChevronUpDownIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
        </Listbox.Button>

        <Listbox.Options className="absolute z-20 mt-1 w-full rounded-md bg-white shadow border max-h-60 overflow-auto">
          {options.map((opt) => (
            <Listbox.Option
              key={opt}
              value={opt}
              className={({ active }) =>
                `cursor-pointer px-3 py-2 text-sm ${
                  active ? "bg-indigo-600 text-white" : "text-gray-900"
                }`
              }
            >
              {({ selected }) => (
                <div className="flex justify-between">
                  {opt}
                  {selected && <CheckIcon className="h-4 w-4" />}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>

    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

/* -------------------- Initial State -------------------- */

const emptyForm = {
  demandJustification: "",
  demandStartDate: "",
  demandEndDate: "",
  allocationPercentage: "",
  locationRequirement: "",
  deliveryModel: "",
  demandType: "",
  demandStatus: "DRAFT",
  demandPriority: "",
};

/* -------------------- Modal -------------------- */

const DemandModal = ({ open, onClose, initialData = null, projectDetails }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const startDateRef = useRef(null);

  /* -------- Initialize / Reset Form -------- */

  useEffect(() => {
    if (!open) return;

    setForm({
      ...emptyForm,
      ...initialData,
      project: {
        pmsProjectId: projectDetails?.pmsProjectId,
      },
      demandStatus: initialData?.demandStatus || "DRAFT",
    });

    setErrors({});
  }, [open, initialData, projectDetails]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* -------------------- Validation -------------------- */

  const validateForm = () => {
    const e = {};

    if (!form.demandStartDate) e.demandStartDate = "Start date is required";
    if (!form.demandEndDate) e.demandEndDate = "End date is required";

    if (
      form.demandStartDate &&
      form.demandEndDate &&
      form.demandEndDate < form.demandStartDate
    ) {
      e.demandEndDate = "End date cannot be before start date";
    }

    if (!form.demandType) e.demandType = "Demand type is required";
    if (!form.demandPriority) e.demandPriority = "Priority is required";
    if(!form.allocationPercentage) e.allocationPercentage = "Allocation Percentage is required";

    // status required only when updating
    if (initialData && !form.demandStatus) {
      e.demandStatus = "Status is required";
    }

    return e;
  };

  /* -------------------- Submit -------------------- */

  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("Please fill all required fields");
      startDateRef.current?.focus();
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await createDemand(form);
      toast.success(res.message || "Demand saved successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save demand");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/40" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="
              w-full
              max-w-lg
              md:max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              rounded-lg
              bg-white
              p-4
              md:p-6
              shadow-lg
            "
          >
            <Dialog.Title className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">
                {initialData ? "Update Demand" : "Create Demand"} –{" "}
                {projectDetails?.name}
              </span>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 transition"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dates */}
              <div>
                <label className="text-xs">
                  Demand Start Date <span className="text-red-600">*</span>
                </label>
                <input
                  ref={startDateRef}
                  type="date"
                  value={form.demandStartDate}
                  onChange={(e) => update("demandStartDate", e.target.value)}
                  className={`w-full border rounded p-2 text-sm ${
                    errors.demandStartDate ? "border-red-500" : ""
                  }`}
                />
                {errors.demandStartDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.demandStartDate}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs">
                  Demand End Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={form.demandEndDate}
                  onChange={(e) => update("demandEndDate", e.target.value)}
                  className={`w-full border rounded p-2 text-sm ${
                    errors.demandEndDate ? "border-red-500" : ""
                  }`}
                />
                {errors.demandEndDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.demandEndDate}
                  </p>
                )}
              </div>

              {/* Enums */}
              <ListboxField
                label="Demand Type"
                value={form.demandType}
                onChange={(v) => update("demandType", v)}
                options={DEMAND_TYPES}
                error={errors.demandType}
              />

              <ListboxField
                label="Demand Status"
                value={form.demandStatus}
                onChange={(v) => update("demandStatus", v)}
                options={DEMAND_STATUSES}
                error={errors.demandStatus}
                required={!!initialData}
              />

              <ListboxField
                label="Priority"
                value={form.demandPriority}
                onChange={(v) => update("demandPriority", v)}
                options={PRIORITIES}
                error={errors.demandPriority}
              />

              {/* Others */}
              <input
                placeholder="Delivery Model"
                value={form.deliveryModel}
                onChange={(e) => update("deliveryModel", e.target.value)}
                className="w-full border rounded p-2 text-sm"
              />

              <input
                type="number"
                placeholder="Allocation %"
                value={form.allocationPercentage}
                onChange={(e) => update("allocationPercentage", e.target.value)}
                className={`w-full border rounded p-2 text-sm ${errors.allocationPercentage ? "border-red-500" : ""}`}
              />
              {errors.allocationPercentage && (
                <p className="text-red-600 text-xs">
                  {errors.allocationPercentage}
                </p>
              )}

              <input
                placeholder="Location Requirement"
                value={form.locationRequirement}
                onChange={(e) => update("locationRequirement", e.target.value)}
                className="w-full border rounded p-2 text-sm"
              />

              <textarea
                rows={3}
                placeholder="Demand Justification"
                value={form.demandJustification}
                onChange={(e) => update("demandJustification", e.target.value)}
                className="md:col-span-2 w-full border rounded p-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
              >
                {loading
                  ? "Submitting..."
                  : initialData
                  ? "Update Demand"
                  : "Create Demand"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DemandModal;