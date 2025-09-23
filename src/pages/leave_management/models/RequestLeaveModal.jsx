import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useAuth } from "../../../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

// -- Helper: Massage leaves to dropdown options --
function mapLeaveBalancesToDropdown(balances) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/leave/types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeaveTypes(res.data);
    } catch (err) {
      toast.error(err);
    }
  };
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  return balances.map((balance) => {
    const leaveTypeId = balance.leaveType.leaveTypeId;
    const originalName = balance.leaveType.leaveName.replace(/^L-/, "");

    const matchingType = leaveTypes.find(
      (type) => type.name === balance.leaveType.leaveName
    );
    const leaveName = matchingType ? matchingType.label : originalName;

    let availableText;
    let isInfinite = false;
    if (leaveTypeId === "L-UPL" || leaveName.toLowerCase().includes("unpaid")) {
      availableText = "infinite balance";
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
      balanceId: balance.balanceId,
      leaveTypeId,
      leaveName,
      availableText,
      availableDays: isInfinite ? Infinity : balance.remainingLeaves,
      isInfinite,
      disabled: !isInfinite && balance.remainingLeaves <= 0,
      allowHalfDay: !!balance.leaveType.allowHalfDay,
      requiresDocumentation: !!balance.leaveType.requiresDocumentation,
      raw: balance,
    };
  });
}

// -- Helpers: Date logic --
function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}
function isWeekend(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}
// Counts weekdays (Mon-Fri) between two dates, or 0.5 for half-day on a weekday
function countWeekdaysBetween(fromDate, toDate, isHalfDay) {
  if (!fromDate || !toDate) return 0;
  if (isHalfDay) return isWeekend(fromDate) ? 0 : 0.5;

  let count = 0;
  let current = new Date(fromDate);
  const end = new Date(toDate);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count += 1;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
function countAllDaysBetween(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const diffTime = new Date(toDate) - new Date(fromDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
}

// -- The HeadlessUI Leave Type Dropdown --
function LeaveTypeDropdown({ options, selectedId, setSelectedId }) {
  const sel = options.find((o) => o.leaveTypeId === selectedId) ?? null;
  return (
    <Listbox value={sel} onChange={(opt) => setSelectedId(opt.leaveTypeId)}>
      <div className="relative mt-1">
        <Listbox.Button className="cursor-default w-full rounded-lg border border-gray-300 py-2 pl-4 pr-12 text-left shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white transition font-medium">
          <span className="flex items-center justify-between">
            <span>
              {sel ? (
                sel.leaveName
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
        <Transition
          as={Fragment}
          leave="transition opacity-100 duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5">
            {options.map((option) => (
              <Listbox.Option
                key={option.leaveTypeId}
                value={option}
                disabled={option.disabled}
                className={({ active, disabled }) =>
                  `py-3 px-4 flex items-center justify-between cursor-pointer select-none
                   ${active && !disabled ? "bg-indigo-50 text-indigo-900" : ""}
                   ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                  `
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`${selected ? "font-medium" : ""} ${
                        option.disabled ? "text-gray-400" : ""
                      }`}
                    >
                      {option.leaveName}
                    </span>
                    <span
                      className={`ml-4 text-xs ${
                        option.disabled ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {option.availableText}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-2 flex items-center text-indigo-600">
                        <CheckIcon className="h-4 w-4" />
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
  );
}

// ---- THE MAIN MODAL COMPONENT ----
export default function RequestLeaveModal({ isOpen, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balances, setBalances] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const todayStr = getTodayDateString();

  const leaveTypeOptions = mapLeaveBalancesToDropdown(balances);
  const selectedLeaveType = leaveTypeOptions.find(
    (o) => o.leaveTypeId === leaveTypeId
  );

  const employeeId = useAuth()?.user?.user_id;

  // Helper: Should we show the Google Drive link field?
  const shouldShowDriveLink = () => {
    
    if (!selectedLeaveType) return false;
    console.log("Checking if Drive link should be shown...", selectedLeaveType)
    // Add check for unpaid leave
      const requiredDocs = selectedLeaveType.requiresDocumentation === true;
      const isSickLeave =  selectedLeaveType.leaveTypeId === "L-SL";
      const enoughDays =  weekdays > 3;

        // Rule:
        // 1. If leave type requires documentation → always true
        // 2. If sick leave → only true when weekdays > 3
      // if (requiredDocs && ((isSickLeave && enoughDays))) return true;
      if (isSickLeave){
        return enoughDays;
      }
      return requiredDocs

      // selectedLeaveType.leaveName.toLowerCase().includes("unpaid")
    // const requiresDocs = selectedLeaveType.requiresDocumentation;
    // const isSickLeave = selectedLeaveType.leaveTypeId === "L-SL";
    // const enoughDays = weekdays > 3;
    // return requiresDocs && (isSickLeave ? enoughDays : true);
  };

  // Calculate days for display in the UI
  const weekdays = countWeekdaysBetween(
    startDate,
    isHalfDay ? startDate : endDate,
    isHalfDay
  );
  const totalDays = countAllDaysBetween(
    startDate,
    isHalfDay ? startDate : endDate
  );

  // Reset drive link when leave type changes (so old value isn't submitted for wrong type)
  useEffect(() => {
    console.log("Checking if Drive link should be shown...", selectedLeaveType)
    if (!shouldShowDriveLink()) {
      setDriveLink("");
    }
  }, [leaveTypeId, weekdays]);

  // Half-day: enable only if selectedLeaveType?.allowHalfDay
  useEffect(() => {
    if (leaveTypeId && selectedLeaveType && !selectedLeaveType.allowHalfDay) {
      setIsHalfDay(false);
    }
  }, [leaveTypeId]);

  // Fetch leave balances when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingBalances(true);
    axios
      .get(`${BASE_URL}/api/leave-balance/employee/${employeeId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setBalances(response.data);
        setLoadingBalances(false);
      })
      .catch(() => {
        setBalanceError("Failed to load leave balances.");
        setLoadingBalances(false);
      });
  }, [isOpen]);

  const handleStartDateChange = (e) => {
    setError("");
    const date = e.target.value;
    if (isWeekend(date)) {
      setError("You cannot select a Saturday or Sunday as start date.");
      setStartDate("");
      setEndDate("");
      return;
    }
    setStartDate(date);
    if (isHalfDay) setEndDate(date);
    if (endDate && date > endDate) setEndDate(date);
  };

  const handleEndDateChange = (e) => {
    setError("");
    const date = e.target.value;
    if (isWeekend(date)) {
      setError("You cannot select a Saturday or Sunday as end date.");
      setEndDate("");
      return;
    }
    setEndDate(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    // Calculate actual days requested (weekdays, or 0.5 for half-day)
    const daysRequested = countWeekdaysBetween(
      startDate,
      isHalfDay ? startDate : endDate,
      isHalfDay
    );

    // Build payload that matches backend DTO
    const payload = {
      employeeId: employeeId,
      leaveTypeId,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      daysRequested,
      reason,
      isHalfDay,
      ...(shouldShowDriveLink() && { driveLink: driveLink }),
    };

    try {
      await axios.post(`${BASE_URL}/api/leave-requests/apply`, payload, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Leave request submitted!");
      // Refresh balances
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/leave-balance/employee/${employeeId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBalances(data);
      } catch {}
      setTimeout(() => {
        setSuccess("");
        setStartDate("");
        setEndDate("");
        setLeaveTypeId("");
        setReason("");
        setIsHalfDay(false);
        setDriveLink("");
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(
        "Failed to submit leave request: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 
      backdrop-blur-sm flex items-center justify-center
      p-4 animate-fadeIn"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto border border-gray-100 relative">
        <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="button"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {(error || success) && (
            <div
              className={`rounded-xl p-3 transition-all duration-300 ${
                error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              <p className="font-medium">{error || success}</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {isHalfDay ? (
                  <span className="text-gray-400">
                    End Date (disabled for half-day)
                  </span>
                ) : (
                  <>
                    End Date <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <input
                type="date"
                value={isHalfDay ? startDate : endDate}
                onChange={handleEndDateChange}
                disabled={isHalfDay}
                min={startDate}
                required={!isHalfDay}
                className={`w-full px-4 py-2.5 border ${
                  isHalfDay ? "border-gray-200 bg-gray-50" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label
              className={`relative flex items-center cursor-pointer ${
                selectedLeaveType?.allowHalfDay
                  ? ""
                  : "opacity-60 pointer-events-none"
              }`}
            >
              <input
                id="half-day"
                type="checkbox"
                checked={isHalfDay}
                disabled={!selectedLeaveType?.allowHalfDay}
                onChange={(e) => {
                  setIsHalfDay(e.target.checked);
                  if (e.target.checked) setEndDate(startDate);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Apply for half day leave
              </span>
            </label>
          </div>

          <div className="text-center space-y-1">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold bg-indigo-100 text-indigo-700">
              {weekdays}
              {isHalfDay && weekdays === 0.5 ? "" : " day"}
              {weekdays > 1 ? "s" : ""}
              {/* <span className="ml-2 text-xs opacity-70">selected ({totalDays} calendar days total)</span> */}
            </span>
            <p className="text-sm text-gray-500">
              Weekends (Saturday/Sunday) are excluded from count.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Leave Type <span className="text-red-500">*</span>
            </label>
            {loadingBalances ? (
              <div className="flex items-center justify-center p-4 text-gray-500 text-sm rounded-xl bg-gray-50">
                <span className="animate-pulse mr-2">⏳</span>
                Loading leave balances...
              </div>
            ) : balanceError ? (
              <div className="text-red-600 text-sm bg-red-50 rounded-xl p-2">
                {balanceError}
              </div>
            ) : (
              <LeaveTypeDropdown
                options={leaveTypeOptions}
                selectedId={leaveTypeId}
                setSelectedId={setLeaveTypeId}
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add a reason"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            />
          </div>

          {shouldShowDriveLink() && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Supporting Document (Google Drive Link){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                required={shouldShowDriveLink()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              {selectedLeaveType?.leaveTypeId === "L-SL" && weekdays > 3 && (
                <p className="text-xs text-gray-500 mt-1">
                  For sick leave exceeding 3 days, please attach supporting
                  document.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 mt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-lg font-medium text-gray-800 border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting || loadingBalances}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⟳</span>
                  Requesting...
                </span>
              ) : (
                "Request Leave"
              )}
            </button>
          </div>
        </form>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px) scale(0.98);}
            to {opacity: 1; transform: translateY(0) scale(1);}
          }
          .animate-fadeIn {animation: fadeIn 0.25s ease-out;}
        `}</style>
      </div>
    </div>
  );
}
