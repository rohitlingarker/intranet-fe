import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { statusUpdate } from "../services/projectService";

const STATUS_OPTIONS = [
  { label: "READY", value: "READY" },
  { label: "UPCOMING", value: "UPCOMING" },
  { label: "NOT READY", value: "NOT_READY" },
];

const UpdateProjectStatusModal = ({ open, onClose, onSuccess, pmsProjectId }) => {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const validate = () => {
    const newErrors = {};
    if (!status) newErrors.status = "Status is required";
    if (!reason.trim()) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
        status,
        reason,
        pmsProjectId,
    }

    setLoading(true);
    try {
        const res = await statusUpdate(payload);
        toast.success(res.message || "Project status updated successfully!");
        onSuccess?.();
        onClose();
        setStatus("");
        setReason("");
    } catch (err) {
        console.error("Failed to update project status", err);
        toast.error(err.response?.data?.message || "Failed to update project status");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#081534]">
            Update Staffing Status
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${
                errors.status ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-red-500 mt-1">{errors.status}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the status is being updated..."
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none resize-none ${
                errors.reason ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProjectStatusModal;