import React, { useState, useEffect, Fragment } from "react";
import { X, FileText, Check, ChevronDown } from "lucide-react";
import axios from "axios";
import { Listbox, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/loadingSpinner"; // Ensure path is correct

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Hook to fetch leave types
const useLeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/leave/types`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLeaveTypes(res.data || []);
      } catch (err) {
        toast.error("Failed to fetch leave types.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveTypes();
  }, []);

  return { leaveTypes, loading };
};

// Default form values
const defaultForm = {
  leaveTypeId: "",
  leaveName: "",
  description: "",
  maxDaysPerYear: "",
  maxCarryForward: "",
  maxCarryForwardPerYear: "",
  requiresDocumentation: false,
  accrualFrequency: "",
  expiryDays: "",
  waitingPeriodDays: "",
  advanceNoticeDays: "",
  pastDateLimitDays: "",
  allowHalfDay: true,
  weekendsAndHolidaysAllowed: false,
  allowNegativeBalance: false,
  noticePeriodRestriction: false,
};

const AddLeaveTypeModal = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const { leaveTypes, loading: loadingLeaveTypes } = useLeaveTypes();
  const token = localStorage.getItem("token");

  // Prefill form on edit
  useEffect(() => {
    if (isOpen) {
      setFormData(editData ? { ...defaultForm, ...editData } : defaultForm);
    }
  }, [isOpen, editData]);

  // Map editData to leave types after loading
  useEffect(() => {
    if (!loadingLeaveTypes && isOpen && editData) {
      const match =
        leaveTypes.find(
          (t) =>
            t.leaveTypeId &&
            editData.leaveTypeId &&
            String(t.leaveTypeId) === String(editData.leaveTypeId)
        ) ||
        leaveTypes.find(
          (t) =>
            t.name &&
            editData.leaveName &&
            String(t.name) === String(editData.leaveName)
        ) ||
        leaveTypes.find(
          (t) =>
            t.label &&
            editData.leaveName &&
            String(t.label) === String(editData.leaveName)
        );

      if (match) {
        setFormData((prev) => ({
          ...prev,
          leaveName: match.name ?? prev.leaveName,
          leaveTypeId:
            match.leaveTypeId ?? prev.leaveTypeId ?? editData.leaveTypeId ?? "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          leaveTypeId: prev.leaveTypeId || editData.leaveTypeId || "",
          leaveName: prev.leaveName || editData.leaveName || "",
        }));
      }
    }
  }, [loadingLeaveTypes, leaveTypes, editData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  // Build payload with numeric conversions
  let payload = {
    ...formData,
    maxDaysPerYear:
      formData.maxDaysPerYear === "" ? null : Number(formData.maxDaysPerYear),
    maxCarryForward:
      formData.maxCarryForward === "" ? 0 : Number(formData.maxCarryForward),
    maxCarryForwardPerYear:
      formData.maxCarryForwardPerYear === "" ? null : Number(formData.maxCarryForwardPerYear),
    expiryDays:
      formData.expiryDays === "" ? null : Number(formData.expiryDays),
    waitingPeriodDays:
      formData.waitingPeriodDays === "" ? 0 : Number(formData.waitingPeriodDays),
    advanceNoticeDays:
      formData.advanceNoticeDays === "" ? 0 : Number(formData.advanceNoticeDays),
    pastDateLimitDays:
      formData.pastDateLimitDays === "" ? 0 : Number(formData.pastDateLimitDays),
  };

  // Remove all null or undefined fields
  Object.keys(payload).forEach(
    (key) => (payload[key] === null || payload[key] === undefined) && delete payload[key]
  );

  const url = editData
    ? `${BASE_URL}/api/leave/update-leave-type/${editData.leaveTypeId}`
    : `${BASE_URL}/api/leave/add-leave-type`;

  try {
    const response = editData
      ? await axios.patch(url, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      : await axios.post(url, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

    console.log("Response from backend:", response.data);

    if (response.data?.success) {
      toast.success(
        response.data.message || (editData ? "Leave type updated!" : "Leave type added!")
      );
      onSuccess?.();
      onClose();
    } else {
      toast.error(response.data?.message || "Something went wrong!");
    }
  } catch (err) {
    console.error("Save error:", err);
    toast.error(err.response?.data?.message || err.message || "Failed to submit leave type");
  } finally {
    setSubmitting(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto relative">
        {/* Overlay spinner */}
        {submitting && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-xl z-50">
            <LoadingSpinner text="Submitting..." />
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {editData ? "Edit Leave Type" : "Add New Leave Type"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Leave Type Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type *
            </label>
            {loadingLeaveTypes ? (
              <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-500 flex items-center justify-center">
                <LoadingSpinner text="Loading leave types..." />
              </div>
            ) : (
              <Listbox
                value={formData.leaveName}
                onChange={(selectedValue) => {
                  const selectedType = leaveTypes.find(
                    (t) => t.name === selectedValue
                  );
                  setFormData((prev) => ({
                    ...prev,
                    leaveName: selectedValue,
                    leaveTypeId: selectedType?.leaveTypeId || "",
                  }));
                }}
                disabled={!!editData}
              >
                <div className="relative">
                  <Listbox.Button
                    className={`w-full rounded-lg border px-4 py-3 text-left sm:text-base text-sm ${
                      editData
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                        : "bg-white cursor-pointer focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    }`}
                  >
                    <span>
                      {formData.leaveName
                        ? leaveTypes.find((t) => t.name === formData.leaveName)
                            ?.label ?? formData.leaveName
                        : "Select a leave type"}
                    </span>
                    {!editData && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </span>
                    )}
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm sm:text-base z-10">
                      {leaveTypes.map((type) => (
                        <Listbox.Option
                          key={type.name || type.leaveTypeId}
                          value={type.name}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-green-100 text-green-900"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {type.label ?? type.name}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                  <Check className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            )}
          </div>

          {/* Numeric and text inputs */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "maxDaysPerYear",
              "maxCarryForward",
              "maxCarryForwardPerYear",
              "accrualFrequency",
              "expiryDays",
            ].map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  name={key}
                  type={["accrualFrequency"].includes(key) ? "text" : "number"}
                  min="0"
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder=""
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Describe the leave type"
            />
          </div>

          {/* Boolean checkboxes */}
          <div className="grid gap-1 sm:grid-cols-2">
            {[
              "requiresDocumentation",
              "allowHalfDay",
              "allowNegativeBalance",
              "noticePeriodRestriction",
            ].map((key) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  id={key}
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-gray-700"
                >
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
              </div>
            ))}
            <div className="flex items-center gap-2 col-span-2">
              <input
                id="weekendsAndHolidaysAllowed"
                type="checkbox"
                name="weekendsAndHolidaysAllowed"
                checked={formData.weekendsAndHolidaysAllowed}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="weekendsAndHolidaysAllowed"
                className="text-sm font-medium text-gray-700"
              >
                Allow Weekends and Holidays
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-gray-800 border border-gray-300 hover:bg-gray-100 font-medium transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors flex items-center justify-center"
              disabled={submitting || loadingLeaveTypes}
            >
              {submitting ? (
                <LoadingSpinner text="Submitting..." />
              ) : editData ? (
                "Update Leave Type"
              ) : (
                "Add Leave Type"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveTypeModal;
