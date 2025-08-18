import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// --- Helper functions remain the same ---
function mapLeaveBalancesToDropdown(balances) {
  return balances.map((balance) => {
    const leaveTypeId = balance.leaveType.leaveTypeId;
    const leaveName = balance.leaveType.leaveName.replace(/^L-/, "");
    let availableText;
    let isInfinite = false;

    if (leaveTypeId === "L-UP" || leaveName.toLowerCase().includes("unpaid")) {
      availableText = "Infinite balance";
      isInfinite = true;
    } else if (balance.remainingLeaves > 0) {
      availableText =
        (balance.remainingLeaves % 1 === 0
          ? balance.remainingLeaves
          : balance.remainingLeaves.toFixed(1)) + " days available";
    } else {
      availableText = "Not Available";
    }

    return {
      leaveTypeId,
      leaveName,
      availableText,
      availableDays: isInfinite ? Infinity : balance.remainingLeaves,
      isInfinite,
      disabled: !isInfinite && balance.remainingLeaves <= 0,
      allowHalfDay: !!balance.leaveType.allowHalfDay,
      requiresDocumentation: !!balance.leaveType.requiresDocumentation,
    };
  });
}

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}
function isWeekend(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}
function countWeekdaysBetween(fromDate, toDate, isHalfDay) {
  if (!fromDate || !toDate) return 0;
  if (isHalfDay) return isWeekend(fromDate) ? 0 : 0.5;
  let count = 0;
  let current = new Date(fromDate);
  const end = new Date(toDate);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
function countAllDaysBetween(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const diffTime = new Date(toDate) - new Date(fromDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function LeaveTypeDropdown({ options, selectedId, setSelectedId }) {
  const sel = options.find((o) => o.leaveTypeId === selectedId) ?? null;
  return (
    <Listbox value={sel} onChange={(opt) => setSelectedId(opt.leaveTypeId)}>
      <div className="relative mt-1">
        <Listbox.Button className="cursor-default w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 text-left bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 transition">
          <span className="flex items-center justify-between">
            <span>
              {sel ? (
                <span className="font-medium text-gray-800">
                  {sel.leaveName}
                </span>
              ) : (
                <span className="text-gray-400">Select leave type</span>
              )}
            </span>
            <span
              className={`text-xs ml-4 ${
                sel?.disabled ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {sel?.availableText}
            </span>
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment}>
          <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black ring-opacity-5">
            {options.map((option) => (
              <Listbox.Option
                key={option.leaveTypeId}
                value={option}
                disabled={option.disabled}
                className={({ active, disabled }) =>
                  `py-3 px-4 flex items-center justify-between cursor-pointer select-none rounded-lg
                   ${active && !disabled ? "bg-indigo-50 text-indigo-900" : ""}
                   ${disabled ? "opacity-40 cursor-not-allowed" : ""}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className="font-medium">{option.leaveName}</span>
                    <span className="ml-4 text-xs">{option.availableText}</span>
                    {selected && (
                      <CheckIcon className="h-4 w-4 text-indigo-600 absolute right-2" />
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

export default function EditLeaveModal({
  employeeId,
  isOpen,
  onClose,
  initialData,
  leaveBalances,
  onSuccess,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen && initialData) {
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setLeaveTypeId(
        initialData.leaveType?.leaveTypeId || initialData.leaveTypeId || ""
      );
      setReason(initialData.reason || "");
      setIsHalfDay(initialData.isHalfDay || false);
      setDriveLink(initialData.driveLink || "");
    }
  }, [isOpen, initialData]);

  const leaveTypeOptions = mapLeaveBalancesToDropdown(leaveBalances);
  const todayStr = getTodayDateString();
  const weekdays = countWeekdaysBetween(
    startDate,
    isHalfDay ? startDate : endDate,
    isHalfDay
  );
  const totalDays = countAllDaysBetween(
    startDate,
    isHalfDay ? startDate : endDate
  );
  const selectedLeaveType = leaveTypeOptions.find(
    (o) => o.leaveTypeId === leaveTypeId
  );

  const shouldShowDriveLink = () => {
    if (!selectedLeaveType) return false;
    const requiresDocs = selectedLeaveType.requiresDocumentation;
    const isSickLeave = selectedLeaveType.leaveTypeId === "L-SL";
    const enoughDays = weekdays > 3;
    return requiresDocs && (isSickLeave ? enoughDays : true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      leaveId: initialData.leaveId,
      employeeId: initialData.employee.employeeId,
      leaveTypeId,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      daysRequested: weekdays,
      requestDate: initialData.requestDate,
      reason,
      isHalfDay,
      driveLink,
    };

    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/leave-requests/employee/update`,
        payload,
        {headers:{
          Authorization: `Bearer ${token}`
        }}
      );
      toast.success("Leave request updated successfully");
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(
        "Failed to update leave request: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Leave</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full p-1 transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="px-6 py-5 space-y-6">
          {error && (
            <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 p-3 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Dates */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={todayStr}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={isHalfDay ? startDate : endDate}
                min={startDate || todayStr}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isHalfDay}
                required={!isHalfDay}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2 rounded-lg text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Half Day Toggle */}
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={isHalfDay}
              disabled={!selectedLeaveType?.allowHalfDay}
              onChange={(e) => {
                setIsHalfDay(e.target.checked);
                if (e.target.checked) setEndDate(startDate);
              }}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Apply for half day
          </label>


          {/* Days Info */}
          <div className="flex justify-center">
            <span className="px-4 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-200 shadow-sm">
              {weekdays} {weekdays === 1 ? "day" : "days"}
            </span>
          </div>

          {/* Leave Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Leave Type
            </label>
            <LeaveTypeDropdown
              options={leaveTypeOptions}
              selectedId={leaveTypeId}
              setSelectedId={setLeaveTypeId}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2 rounded-lg text-sm"
            />
          </div>

          {/* Drive Link */}
          {shouldShowDriveLink() && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Supporting Document (Google Drive Link)
              </label>
              <input
                type="url"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2 rounded-lg text-sm"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
