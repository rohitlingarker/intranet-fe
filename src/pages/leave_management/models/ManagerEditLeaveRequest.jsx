import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { X, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import DateRangePicker from "./DateRangePicker";
import { useRecordLock } from "../hooks/useRecordLock";
import { useAuth } from "../../../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// --- Helper 1: Maps leave balances to dropdown options with user-friendly labels ---
function mapLeaveBalancesToDropdown(balances, leaveTypes) {
  if (!balances || !leaveTypes) return [];
  return balances.map((balance) => {
    const { leaveType, remainingLeaves } = balance;
    const leaveTypeId = leaveType.leaveTypeId;
    const originalName = leaveType.leaveName;
    const matchingType = leaveTypes.find((type) => type.name === originalName);
    const leaveName = matchingType
      ? matchingType.label
      : originalName.replace(/^L-/, "");

    let availableText;
    let isInfinite = false;

    if (
      leaveTypeId.includes("UPL") ||
      leaveName.toLowerCase().includes("unpaid")
    ) {
      availableText = "Infinite balance";
      isInfinite = true;
    } else if (remainingLeaves > 0) {
      const days =
        remainingLeaves % 1 === 0
          ? remainingLeaves
          : remainingLeaves.toFixed(1);
      availableText = `${days} days available`;
    } else {
      availableText = "Not Available";
    }

    return {
      leaveTypeId,
      leaveName,
      availableText,
      disabled: !isInfinite && remainingLeaves <= 0,
      allowHalfDay: !!leaveType.allowHalfDay, // Pass allowHalfDay property
      requiresDocumentation: !!leaveType.requiresDocumentation,
    };
  });
}

// --- Helper 2: Date and Formatting Logic ---
function formatDateForDisplay(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// --- Helper 3: Robust UTC-based day calculation ---
function countWeekdaysBetween(fromDate, toDate, halfDayConfig, holidays = []) {
  if (!fromDate || !toDate || !halfDayConfig) return 0;

  const holidaySet = new Set(
    holidays
      .filter(Boolean)
      .map((h) => {
        if (h instanceof Date && !isNaN(h)) {
          return new Date(h.getTime() - h.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];
        }
        if (typeof h === "string") return h;
        return null;
      })
      .filter(Boolean)
  );

  let total = 0;
  const current = new Date(fromDate + "T00:00:00Z");
  const end = new Date(toDate + "T00:00:00Z");

  while (current <= end) {
    const dayOfWeek = current.getUTCDay();
    const currentDateStr = current.toISOString().split("T")[0];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(currentDateStr);

    if (!isWeekend && !isHoliday) {
      const isStartDate = currentDateStr === fromDate;
      const isEndDate = currentDateStr === toDate;

      // CORRECTED LOGIC
      if (isStartDate && isEndDate) {
        // Handle single-day case first
        total +=
          halfDayConfig.start === "first" || halfDayConfig.start === "second"
            ? 0.5
            : 1;
      } else if (isStartDate) {
        // Multi-day start
        total +=
          halfDayConfig.start === "first" || halfDayConfig.start === "second"
            ? 0.5
            : 1;
      } else if (isEndDate) {
        // Multi-day end
        total +=
          halfDayConfig.end === "first" || halfDayConfig.end === "second"
            ? 0.5
            : 1;
      } else {
        // Full day in between
        total += 1;
      }
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return total;
}

// --- Component 1: The Reusable LeaveTypeDropdown Component ---
function LeaveTypeDropdown({ options, selectedId, setSelectedId }) {
  const sel = options.find((o) => o.leaveTypeId === selectedId) ?? null;
  return (
    <Listbox value={sel} onChange={(opt) => setSelectedId(opt.leaveTypeId)}>
      <div className="relative mt-1">
        <Listbox.Button className="cursor-default w-full rounded-lg border border-gray-300 py-2.5 pl-4 pr-12 text-left shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white transition font-medium">
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
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.leaveTypeId}
                value={option}
                disabled={option.disabled}
                className={({ active, disabled }) =>
                  `relative cursor-default select-none py-2 pl-4 pr-4 ${
                    active && !disabled
                      ? "bg-indigo-100 text-indigo-900"
                      : "text-gray-900"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`
                }
              >
                {({ selected }) => (
                  <div className="flex justify-between items-center">
                    <span
                      className={`block truncate ${
                        selected ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {option.leaveName}
                    </span>
                    <span
                      className={`text-xs ${
                        selected ? "font-medium" : "text-gray-500"
                      }`}
                    >
                      {option.availableText}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-2 flex items-center text-indigo-600">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

// --- Component 2: The Main ManagerEditLeaveRequest Component ---
export default function ManagerEditLeaveRequest({
  isOpen,
  onClose,
  onSave,
  requestDetails,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [managerComment, setManagerComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // State for custom half-day logic
  const [showCustomHalfDay, setShowCustomHalfDay] = useState(false);
  const [halfDayConfig, setHalfDayConfig] = useState({
    start: "none",
    end: "none",
  });
  const { user } = useAuth();
  const { locked, lockedBy, lockMessage, manualReleaseLock } = useRecordLock({
    tableName: "leave_request",
    recordId: requestDetails?.leaveId,
    user: user?.name,
  });
  const isLockedByOther = locked && lockedBy && lockedBy !== user?.name;

  useEffect(() => {
    if (isOpen && requestDetails) {
      let isMounted = true;
      // Pre-fill form from the request details
      setStartDate(requestDetails.startDate || "");
      setEndDate(requestDetails.endDate || "");
      setLeaveTypeId(requestDetails.leaveType?.leaveTypeId || "");
      setManagerComment(requestDetails.managerComment || "");

      // Initialize half-day state from the request
      const isCustom =
        requestDetails.isHalfDay ||
        (requestDetails.startSession && requestDetails.startSession !== "none");
      setShowCustomHalfDay(isCustom);
      if (isCustom) {
        setHalfDayConfig({
          start: requestDetails.startSession || "fullday",
          end: requestDetails.endSession || "fullday",
        });
      } else {
        setHalfDayConfig({ start: "none", end: "none" });
      }

      // Fetch employee balances and general leave types
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [balancesRes, typesRes, holidays] = await Promise.all([
            axios.get(
              `${BASE_URL}/api/leave-balance/employee/${requestDetails.employee.employeeId}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            ),
            axios.get(`${BASE_URL}/api/leave/types`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }),
            axios.get(`${BASE_URL}/api/holidays/by-location`, {
              params: { state: "All", country: "India" },
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }),
          ]);
          if (isMounted) {
            setBalances(balancesRes.data || []);
            setLeaveTypes(typesRes.data || []);
            const holidayDates = holidays.data.map(
              (h) => new Date(h.holidayDate + "T00:00:00")
            );
            setHolidays(holidayDates);
          }
        } catch (err) {
          toast.error("Failed to load necessary leave data.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, requestDetails]);

  const leaveTypeOptions = mapLeaveBalancesToDropdown(balances, leaveTypes);
  const selectedLeaveType = leaveTypeOptions.find(
    (o) => o.leaveTypeId === leaveTypeId
  );
  const isMultiDay = startDate && endDate && startDate !== endDate;
  const weekdays = countWeekdaysBetween(
    startDate,
    endDate,
    halfDayConfig,
    holidays
  );

  const handleHalfDayModeChange = (isCustom) => {
    setShowCustomHalfDay(isCustom);
    setHalfDayConfig(
      isCustom
        ? { start: "fullday", end: "fullday" }
        : { start: "none", end: "none" }
    );
  };

  const handleStartDateChange = (date) => {
    if (!date) return;
    const dateString = format(date, "yyyy-MM-dd");
    setStartDate(dateString);
    if (!endDate || new Date(endDate) < new Date(dateString)) {
      setEndDate(dateString);
    }
  };

  const handleEndDateChange = (date) => {
    if (!date) return;
    const dateString = format(date, "yyyy-MM-dd");
    setEndDate(dateString);
  };

  const handleClose = async () => {
    await manualReleaseLock();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const updatedData = {
      leaveTypeId,
      startDate,
      endDate,
      daysRequested: weekdays,
      managerComment,
      // isHalfDay: showCustomHalfDay,
      startSession: halfDayConfig.start,
      endSession: isMultiDay ? halfDayConfig.end : "none",
    };
    onSave(requestDetails.leaveId, updatedData);
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] ${isLockedByOther ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
        {isLockedByOther && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 rounded-2xl">
            <Lock className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">Record Locked</h3>
            {lockMessage && (
              <p className="text-gray-600 mt-2">
                {lockMessage}
              </p>
            )}
            <p className="text-gray-600 mt-2 text-sm">Please Try again later.</p>
            <button type="button" onClick={onClose} className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Close
            </button>
          </div>
        )}
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Leave Request
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee's Reason
            </label>
            <div className="w-full min-h-[42px] mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm break-words flex items-center">
              {requestDetails.reason || (
                <span className="text-gray-400">No reason provided.</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Leave Type
            </label>
            {loadingData ? (
              <div className="mt-1 w-full p-2.5 border rounded-md bg-gray-100 text-center text-gray-500 text-sm">
                Loading balances...
              </div>
            ) : (
              <LeaveTypeDropdown
                options={leaveTypeOptions}
                selectedId={leaveTypeId}
                setSelectedId={setLeaveTypeId}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateRangePicker
              label="Start Date"
              defaultDate={startDate ? new Date(startDate + "T00:00:00") : null}
              onChange={handleStartDateChange}
              defaultMonth={
                startDate ? new Date(startDate + "T00:00:00") : undefined
              }
              disabledDays={[{ dayOfWeek: [0, 6] }, ...holidays]}
            />
            <DateRangePicker
              label="End Date"
              align="right"
              defaultDate={endDate ? new Date(endDate + "T00:00:00") : null}
              onChange={handleEndDateChange}
              defaultMonth={
                endDate ? new Date(endDate + "T00:00:00") : undefined
              }
              disabledDays={[
                { dayOfWeek: [0, 6] },
                ...holidays,
                startDate ? { before: new Date(startDate + "T00:00:00") } : {},
              ]}
            />
          </div>

          <div className="flex justify-center">
            <span className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-md border border-indigo-200 shadow-sm">
              {weekdays} {weekdays === 1 ? "day" : "days"}
            </span>
          </div>

          {selectedLeaveType && selectedLeaveType.allowHalfDay && (
            <div className="space-y-3 pt-2">
              <div className="p-1 inline-flex items-center bg-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleHalfDayModeChange(false)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    !showCustomHalfDay
                      ? "bg-white text-gray-800 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Full days
                </button>
                <button
                  type="button"
                  onClick={() => handleHalfDayModeChange(true)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    showCustomHalfDay
                      ? "bg-white text-gray-800 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Custom
                </button>
              </div>

              {showCustomHalfDay && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      From {formatDateForDisplay(startDate)}
                    </label>
                    <select
                      value={halfDayConfig.start}
                      onChange={(e) =>
                        setHalfDayConfig((p) => ({
                          ...p,
                          start: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="fullday">Full Day</option>
                      <option value="first">First Half</option>
                      <option value="second">Second Half</option>
                    </select>
                  </div>
                  {isMultiDay && (
                    <>
                      <div className="pt-8 text-gray-500 font-medium">–</div>
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-gray-600">
                          To {formatDateForDisplay(endDate)}
                        </label>
                        <select
                          value={halfDayConfig.end}
                          onChange={(e) =>
                            setHalfDayConfig((p) => ({
                              ...p,
                              end: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        >
                          <option value="fullday">Full Day</option>
                          <option value="first">First Half</option>
                          <option value="second">Second Half</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Manager Comment
            </label>
            <textarea
              maxLength="100"
              rows="3"
              cols="40"
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              placeholder="Add a comment for the employee..."
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingData || isLockedByOther}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
