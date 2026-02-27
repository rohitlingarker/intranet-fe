import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { createDemand } from "../services/projectService";
import { getRoleExpectations } from "../services/workforceService";
import { getLocations } from "../services/projectService";
import { toast } from "react-toastify";

import { useEnums } from "@/pages/resource_management/hooks/useEnums";

/* -------------------- Constants -------------------- */
// These are now handled dynamically via useEnums hook


/* -------------------- Listbox Field -------------------- */

const ListboxField = ({ label, value, onChange, options, error, required = true, placeholder = "Select" }) => {
  const selectedOption = options.find((opt) =>
    typeof opt === "string" ? opt === value : opt.value === value
  );
  const displayLabel = typeof selectedOption === "string" ? selectedOption : (selectedOption?.label || placeholder);

  return (
    <div className="w-full">
      <label className="text-xs text-gray-600 mb-1 block font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`w-full rounded-md border bg-white py-2 pl-3 pr-10 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error ? "border-red-500" : "border-gray-300 hover:border-gray-400"}
            `}
          >
            <span className={`block truncate ${!value ? "text-gray-400" : "text-gray-900"}`}>
              {displayLabel}
            </span>
            <ChevronUpDownIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto focus:outline-none">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center italic">
                  No options available
                </div>
              ) : (
                options.map((opt, idx) => {
                  const optValue = typeof opt === "string" ? opt : opt.value;
                  const optLabel = typeof opt === "string" ? opt : opt.label;
                  return (
                    <Listbox.Option
                      key={idx}
                      value={optValue}
                      className={({ active }) =>
                        `cursor-pointer select-none px-3 py-2 text-sm transition-colors ${active ? "bg-blue-600 text-white" : "text-gray-900 hover:bg-blue-50"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <div className="flex items-center justify-between">
                          <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
                            {optLabel}
                          </span>
                          {selected && <CheckIcon className="h-4 w-4" />}
                        </div>
                      )}
                    </Listbox.Option>
                  );
                })
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
};

/* -------------------- Initial State -------------------- */

const emptyForm = {
  demandName: "",
  demandStartDate: "",
  demandEndDate: "",
  roleId: "",
  projectId: "",
  minExp: "",
  resourceRequired: "",
  allocationPercentage: "",
  locationRequirement: "",
  deliveryModel: "",
  demandType: "",
  demandStatus: "DRAFT",
  demandPriority: "",
  demandJustification: "",
};

/* -------------------- Modal -------------------- */

const DemandModal = ({ open, onClose, initialData = null, projectDetails }) => {
  const { getEnumValues } = useEnums();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);

  const DEMAND_TYPES = getEnumValues("DemandType");
  const DEMAND_STATUSES = getEnumValues("DemandStatus");
  const PRIORITIES = getEnumValues("PriorityLevel");
  const DELIVERY_MODELS = getEnumValues("DeliveryModel");

  const startDateRef = useRef(null);

  const fetchRoles = async () => {
    try {
      const res = await getRoleExpectations();
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await getLocations();
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* -------- Initialize / Reset Form -------- */

  useEffect(() => {
    if (!open) return;

    fetchRoles();
    fetchLocations();

    setForm({
      ...emptyForm,
      projectId: projectDetails?.pmsProjectId || projectDetails?._id || "",
      ...initialData,
    });

    setErrors({});
  }, [open, initialData, projectDetails]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* -------------------- Validation -------------------- */

  const validateForm = () => {
    const e = {};

    if (!form.demandName) e.demandName = "Demand name is required";
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
    if (!form.allocationPercentage) e.allocationPercentage = "Allocation Percentage is required";
    if (!form.roleId) e.roleId = "Role is required";
    if (!form.locationRequirement) e.locationRequirement = "Location Requirement is required";
    if (!form.deliveryModel) e.deliveryModel = "Delivery Model is required";
    if (!form.demandJustification) e.demandJustification = "Demand Justification is required";
    if (!form.minExp) e.minExp = "Minimum Experience is required";
    if (!form.resourceRequired || form.resourceRequired < 1) e.resourceRequired = "At least 1 resource is required";

    if (!form.demandStatus) e.demandStatus = "Status is required";

    return e;
  };

  /* -------------------- Submit -------------------- */

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    console.log("Validations form: ", validationErrors);
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
              {/* Project & Name */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">
                    Project
                  </label>
                  <input
                    type="text"
                    value={projectDetails?.name || "N/A"}
                    disabled
                    className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">
                    Demand Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Demand Name"
                    value={form.demandName}
                    onChange={(e) => update("demandName", e.target.value)}
                    className={`w-full border rounded-md p-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.demandName ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                  />
                  {errors.demandName && (
                    <p className="text-red-600 text-xs mt-1">{errors.demandName}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">
                  Demand Start Date <span className="text-red-600">*</span>
                </label>
                <input
                  ref={startDateRef}
                  type="date"
                  value={form.demandStartDate}
                  onChange={(e) => update("demandStartDate", e.target.value)}
                  className={`w-full border rounded-md p-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.demandStartDate ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                />
                {errors.demandStartDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.demandStartDate}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">
                  Demand End Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={form.demandEndDate}
                  onChange={(e) => update("demandEndDate", e.target.value)}
                  className={`w-full border rounded-md p-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.demandEndDate ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                />
                {errors.demandEndDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.demandEndDate}
                  </p>
                )}
              </div>

              {/* Role & Type */}
              <ListboxField
                label="Role"
                value={form.roleId}
                onChange={(v) => update("roleId", v)}
                options={roles.map((r) => ({ label: r.role, value: r.dev_role_id }))}
                error={errors.roleId}
                placeholder="Select Role"
              />

              <ListboxField
                label="Demand Type"
                value={form.demandType}
                onChange={(v) => update("demandType", v)}
                options={DEMAND_TYPES}
                error={errors.demandType}
                placeholder="Select Type"
              />

              {/* Experience & Resources */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">
                  Min Experience <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Yrs"
                  value={form.minExp}
                  onChange={(e) => update("minExp", e.target.value)}
                  className={`w-full border rounded-md p-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.minExp ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                />
                {errors.minExp && (
                  <p className="text-red-600 text-xs mt-1">{errors.minExp}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">
                  Resources Required <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Count"
                  value={form.resourceRequired}
                  onChange={(e) => update("resourceRequired", e.target.value)}
                  className={`w-full border rounded-md p-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.resourceRequired ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                />
                {errors.resourceRequired && (
                  <p className="text-red-600 text-xs mt-1">{errors.resourceRequired}</p>
                )}
              </div>

              {/* Allocation & Priority */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">
                  Allocation % <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0-100"
                  value={form.allocationPercentage}
                  onChange={(e) => update("allocationPercentage", e.target.value)}
                  className={`w-full border rounded-md p-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.allocationPercentage ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                />
                {errors.allocationPercentage && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.allocationPercentage}
                  </p>
                )}
              </div>

              <ListboxField
                label="Priority"
                value={form.demandPriority}
                onChange={(v) => update("demandPriority", v)}
                options={PRIORITIES}
                error={errors.demandPriority}
                placeholder="Select Priority"
              />

              {/* Location & Delivery */}
              <ListboxField
                label="Location Requirement"
                value={form.locationRequirement}
                onChange={(v) => update("locationRequirement", v)}
                options={locations}
                error={errors.locationRequirement}
                placeholder="Select Location"
              />

              <ListboxField
                label="Delivery Model"
                value={form.deliveryModel}
                onChange={(v) => update("deliveryModel", v)}
                options={DELIVERY_MODELS}
                error={errors.deliveryModel}
                placeholder="Select Model"
              />

              <ListboxField
                label="Demand Status"
                value={form.demandStatus}
                onChange={(v) => update("demandStatus", v)}
                options={DEMAND_STATUSES}
                error={errors.demandStatus}
                placeholder="Select Status"
              />

              {/* Justification */}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block font-medium">
                  Demand Justification <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Why is this resource needed?"
                  value={form.demandJustification}
                  onChange={(e) => update("demandJustification", e.target.value)}
                  className={`w-full border rounded-md p-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.demandJustification ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                />
                {errors.demandJustification && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.demandJustification}
                  </p>
                )}
              </div>
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