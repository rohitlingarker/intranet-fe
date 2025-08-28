import React, { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import axios from "axios";
// import { fetchData } from "./PendingLeaveRequests";
// import  {useAuth} from "../../../contexts/AuthContext"

const BASE_URL = import.meta.env.VITE_BASE_URL;
// A custom hook to fetch leave types from the API
const useLeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/leave/types`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
        setLeaveTypes(response.data || []);
      } catch (err) {
        setError("Failed to fetch leave types. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveTypes();
  }, []);
 
  return { leaveTypes, loading, error };
};
 
// Default form state for resetting the form
const defaultForm = {
  leaveTypeId: "",
  leaveName: "",
  description: "",
  maxDaysPerYear: "",
  maxCarryForward: "",
  requiresDocumentation: false,
  accrualRate: "",
  accrualFrequency: "",
  expiryDays: "",
  waitingPeriodDays: "",
  advanceNoticeDays: "",
  pastDateLimitDays: "",
  allowHalfDay: true,
  allowNegativeBalance: false,
  noticePeriodRestriction: false,
};
 
const AddLeaveTypeModal = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem('token');
 
  // Use the custom hook to get leave types data
  const {
    leaveTypes,
    loading: loadingLeaveTypes,
    error: leaveTypesError,
  } = useLeaveTypes();
 
  // Reset / prefill form when modal opens or editData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(editData ? { ...defaultForm, ...editData } : defaultForm);
      setError("");
      setSuccess("");
    }
  }, [isOpen, editData]);
 
  // After leave types load, try to map editData to an option so the select shows correctly
  useEffect(() => {
    if (!loadingLeaveTypes && isOpen && editData) {
      // match by id, then by name, then by label
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
          // prefer option's "name" as that's what the select uses for value in your original component
          leaveName: match.name ?? prev.leaveName,
          // also set leaveTypeId if backend needs it
          leaveTypeId:
            match.leaveTypeId ?? prev.leaveTypeId ?? editData.leaveTypeId ?? "",
        }));
      } else {
        // If no match, ensure any id from editData is kept so update call can use it
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
    setError("");
    setSuccess("");
    setSubmitting(true);
 
    const payload = {
      ...formData,
      leaveTypeId: formData.leaveTypeId, // ID in body
      maxDaysPerYear:
        formData.maxDaysPerYear === "" ? null : Number(formData.maxDaysPerYear),
      maxCarryForward:
        formData.maxCarryForward === "" ? 0 : Number(formData.maxCarryForward),
      accrualRate:
        formData.accrualRate === "" ? null : Number(formData.accrualRate),
      expiryDays:
        formData.expiryDays === "" ? null : Number(formData.expiryDays),
      waitingPeriodDays:
        formData.waitingPeriodDays === ""
          ? 0
          : Number(formData.waitingPeriodDays),
      advanceNoticeDays:
        formData.advanceNoticeDays === ""
          ? 0
          : Number(formData.advanceNoticeDays),
      pastDateLimitDays:
        formData.pastDateLimitDays === ""
          ? 0
          : Number(formData.pastDateLimitDays),
    };
 
    const url = editData
      ? `${BASE_URL}/api/leave/update-leave-type/`
      : `${BASE_URL}/api/leave/add-leave-type`;
 
    try {
      if (editData) {
        // Backend expects PATCH (no ID in path)
        await axios.patch(url, payload, {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
        });
        setSuccess("Leave type updated successfully!");
      } else {
        await axios.post(url, payload, {
          headers: { "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
           },
        });
        setSuccess("Leave type added successfully!");
      }
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } catch (err) {
      console.error("Save error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit leave type"
      );
    } finally {
      setSubmitting(false);
    }
  };
 
  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
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
          >
            <X className="w-6 h-6" />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm mb-2">{success}</div>
          )}
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type *
            </label>
            {loadingLeaveTypes ? (
              <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-500">
                Loading leave types...
              </div>
            ) : leaveTypesError ? (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {leaveTypesError}
              </div>
            ) : (
              <select
                name="leaveName"
                required
                value={formData.leaveName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leaveName: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="" disabled>
                  Select a leave type
                </option>
                {leaveTypes.map((type) => (
                  // keep same shape as your original options
                  <option key={type.name || type.leaveTypeId} value={type.name}>
                    {type.label ?? type.name}
                  </option>
                ))}
              </select>
            )}
          </div>
 
          {/* rest of fields unchanged */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Days Per Year
              </label>
              <input
                name="maxDaysPerYear"
                type="number"
                min="0"
                value={formData.maxDaysPerYear}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Carry Forward
              </label>
              <input
                name="maxCarryForward"
                type="number"
                min="0"
                value={formData.maxCarryForward}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accrual Rate
              </label>
              <input
                name="accrualRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.accrualRate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 1.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accrual Frequency
              </label>
              <input
                name="accrualFrequency"
                type="text"
                value={formData.accrualFrequency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Monthly/Yearly"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Days
              </label>
              <input
                name="expiryDays"
                type="number"
                min="0"
                value={formData.expiryDays}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 365"
              />
            </div>
          </div>
 
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
 
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waiting Period Days
              </label>
              <input
                name="waitingPeriodDays"
                type="number"
                min="0"
                value={formData.waitingPeriodDays}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Notice Days
              </label>
              <input
                name="advanceNoticeDays"
                type="number"
                min="0"
                value={formData.advanceNoticeDays}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Past Date Limit Days
              </label>
              <input
                name="pastDateLimitDays"
                type="number"
                min="0"
                value={formData.pastDateLimitDays}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
 
          <div className="grid gap-1 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <input
                id="requiresDocumentation"
                type="checkbox"
                name="requiresDocumentation"
                checked={formData.requiresDocumentation}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="requiresDocumentation"
                className="text-sm font-medium text-gray-700"
              >
                Requires Documentation
              </label>
            </div>
 
            <div className="flex items-center gap-2">
              <input
                id="allowHalfDay"
                type="checkbox"
                name="allowHalfDay"
                checked={formData.allowHalfDay}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="allowHalfDay"
                className="text-sm font-medium text-gray-700"
              >
                Allow Half Day
              </label>
            </div>
 
            <div className="flex items-center gap-2">
              <input
                id="allowNegativeBalance"
                type="checkbox"
                name="allowNegativeBalance"
                checked={formData.allowNegativeBalance}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="allowNegativeBalance"
                className="text-sm font-medium text-gray-700"
              >
                Allow Negative Balance
              </label>
            </div>
 
            <div className="flex items-center gap-2">
              <input
                id="noticePeriodRestriction"
                type="checkbox"
                name="noticePeriodRestriction"
                checked={formData.noticePeriodRestriction}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="noticePeriodRestriction"
                className="text-sm font-medium text-gray-700"
              >
                Notice Period Restriction
              </label>
            </div>
          </div>
 
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
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
              disabled={submitting || loadingLeaveTypes}
            >
              {submitting
                ? editData
                  ? "Updating..."
                  : "Adding..."
                : editData
                ? "Update Leave Type"
                : "Add Leave Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default AddLeaveTypeModal;