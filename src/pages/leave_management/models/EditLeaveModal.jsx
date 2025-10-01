import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { format } from "date-fns"; // <-- Step 1: Import format
import DateRangePicker from "./DateRangePicker"; // <-- Step 1: Import DateRangePicker

const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

// --- Helper 1: Maps leave balances to dropdown options (Unchanged) ---
function mapLeaveBalancesToDropdown(balances, leaveTypes) {
  // ... (this function remains the same as in your original code)
  return balances.map((balance) => {
    const leaveTypeId = balance.leaveType.leaveTypeId;
    const originalName = balance.leaveType.leaveName;
    const matchingType = leaveTypes.find((type) => type.name === originalName);
    const leaveName = matchingType ? matchingType.label : originalName.replace(/^L-/, "");

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

// --- Helper 2: Date and Formatting Logic (Unchanged) ---
function formatDateForDisplay(dateStr) {
    // ... (this function remains the same as in your original code)
    if (!dateStr) return "";
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
}

// --- Helper 3: **UPDATED** Robust day calculation to exclude holidays ---
function countWeekdaysBetween(fromDate, toDate, halfDayConfig, holidays = []) {
  if (!fromDate || !toDate || !halfDayConfig) return 0;
  
  const holidaySet = new Set(
    holidays
      .filter(Boolean)
      .map(h => {
        if (h instanceof Date && !isNaN(h)) {
          return new Date(h.getTime() - h.getTimezoneOffset() * 60000).toISOString().split("T")[0];
        }
        if (typeof h === 'string') return h;
        return null;
      }).filter(Boolean)
  );

  let total = 0;
  const current = new Date(fromDate + 'T00:00:00Z');
  const end = new Date(toDate + 'T00:00:00Z');

  while (current <= end) {
    const dayOfWeek = current.getUTCDay();
    const currentDateStr = current.toISOString().split('T')[0];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(currentDateStr);

    if (!isWeekend && !isHoliday) {
      const isStartDate = currentDateStr === fromDate;
      const isEndDate = currentDateStr === toDate;

      if (isStartDate) {
        total += (halfDayConfig.start === 'first' || halfDayConfig.start === 'second') ? 0.5 : 1;
      } else if (isEndDate) {
        total += (halfDayConfig.end === 'first' || halfDayConfig.end === 'second') ? 0.5 : 1;
      } else {
        total += 1;
      }
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return total;
}


// --- Component 1: The HeadlessUI Leave Type Dropdown (Unchanged) ---
function LeaveTypeDropdown({ options, selectedId, setSelectedId }) {
    // ... (this component remains the same as in your original code)
    const sel = options.find((o) => o.leaveTypeId === selectedId) ?? null;
    return (
      <Listbox value={sel} onChange={(opt) => setSelectedId(opt.leaveTypeId)}>
        <div className="relative mt-1">
          <Listbox.Button className="cursor-default w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 text-left bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 transition">
            <span className="flex items-center justify-between">
              <span>
                {sel ? (
                  <span className="font-medium text-gray-800">{sel.leaveName}</span>
                ) : (
                  <span className="text-gray-400">Select leave type</span>
                )}
              </span>
              <span className={`text-xs ml-4 ${sel?.disabled ? "text-gray-400" : "text-gray-500"}`}>
                {sel?.availableText}
              </span>
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black ring-opacity-5">
              {options.map((option) => (
                <Listbox.Option key={option.leaveTypeId} value={option} disabled={option.disabled} className={({ active, disabled }) => `py-3 px-4 flex items-center justify-between cursor-pointer select-none rounded-lg ${active && !disabled ? "bg-indigo-50 text-indigo-900" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                  {({ selected }) => (
                    <>
                      <span className="font-medium">{option.leaveName}</span>
                      <span className="ml-4 text-xs">{option.availableText}</span>
                      {selected && (<CheckIcon className="h-4 w-4 text-indigo-600 absolute right-2" />)}
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

// ---- Component 2: The Main Edit Leave Modal ----
export default function EditLeaveModal({
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
  const [driveLink, setDriveLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]); // <-- Step 2: Add state for holidays
  const [showCustomHalfDay, setShowCustomHalfDay] = useState(false);
  const [halfDayConfig, setHalfDayConfig] = useState({ start: "none", end: "none" });

  // --- Step 3: Fetch leave types and HOLIDAYS when modal opens ---
  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaveTypes = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/leave/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveTypes(res.data);
      } catch (err) {
        toast.error("Failed to load leave type details.");
      }
    };
    
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/holidays/by-location`, {
          params: { state: "All", country: "India" }, // Adjust params if needed
          headers: { Authorization: `Bearer ${token}` },
        });
        const holidayDates = res.data.map(holiday => new Date(holiday.holidayDate + 'T00:00:00'));
        setHolidays(holidayDates);
      } catch (err) {
        toast.error("Could not load company holidays.");
      }
    };

    fetchLeaveTypes();
    fetchHolidays();
  }, [isOpen]);

  // Populate form with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setLeaveTypeId(initialData.leaveType?.leaveTypeId || initialData.leaveTypeId || "");
      setReason(initialData.reason || "");
      setDriveLink(initialData.driveLink || "");
      
      const isCustom = initialData.isHalfDay || (initialData.startSession && initialData.startSession !== 'none');
      setShowCustomHalfDay(isCustom);
      
      if (isCustom) {
        setHalfDayConfig({
            start: initialData.startSession && initialData.startSession !== 'none' ? initialData.startSession : 'fullday',
            end: initialData.endSession && initialData.endSession !== 'none' ? initialData.endSession : 'fullday',
        });
      } else {
        setHalfDayConfig({ start: 'none', end: 'none' });
      }
    }
  }, [isOpen, initialData]);

  const leaveTypeOptions = mapLeaveBalancesToDropdown(leaveBalances, leaveTypes);
  const selectedLeaveType = leaveTypeOptions.find((o) => o.leaveTypeId === leaveTypeId);
  
  // --- Step 4: UPDATED CALCULATIONS to include holidays ---
  const isMultiDay = startDate && endDate && startDate !== endDate;
  const weekdays = countWeekdaysBetween(startDate, endDate, halfDayConfig, holidays);

  const shouldShowDriveLink = () => {
    if (!selectedLeaveType) return false;
    const requiresDocs = selectedLeaveType.requiresDocumentation;
    const isSickLeave = selectedLeaveType.leaveTypeId === "L-SL";
    const enoughDays = weekdays > 3;
    return requiresDocs || (isSickLeave && enoughDays);
  };
  
  const handleHalfDayModeChange = (isCustom) => {
    setShowCustomHalfDay(isCustom);
    setHalfDayConfig(isCustom ? { start: 'fullday', end: 'fullday' } : { start: 'none', end: 'none' });
  }

  // --- Step 5: New handlers for DateRangePicker ---
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      leaveId: initialData.leaveId,
      employeeId: initialData.employee.employeeId,
      leaveTypeId,
      startDate,
      endDate,
      daysRequested: weekdays,
      requestDate: initialData.requestDate,
      reason,
      driveLink,
      // isHalfDay: showCustomHalfDay,
      startSession: halfDayConfig.start,
      endSession: isMultiDay ? halfDayConfig.end : "none",
    };

    try {
      const { data } = await axios.put(`${BASE_URL}/api/leave-requests/employee/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Leave request updated successfully");
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError("Failed to update leave request: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Leave Request</h2>
          <button onClick={onClose} className="hover:bg-gray-100 rounded-full p-1 transition">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="px-6 py-5 space-y-6">
          {error && (<div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm">{error}</div>)}

          {/* --- Step 6: Replace inputs with DateRangePicker components --- */}
          <div className="grid gap-5 sm:grid-cols-2">
            <DateRangePicker
              label="Start Date"
              defaultDate={startDate ? new Date(startDate + "T00:00:00") : null}
              onChange={handleStartDateChange}
              defaultMonth={startDate ? new Date(startDate + "T00:00:00") : undefined}
              disabledDays={[{ dayOfWeek: [0, 6] }, ...holidays]}
            />
            <DateRangePicker
              label="End Date"
              align="right"
              defaultDate={endDate ? new Date(endDate + "T00:00:00") : null}
              onChange={handleEndDateChange}
              defaultMonth={endDate ? new Date(endDate + "T00:00:00") : undefined}
              disabledDays={[
                { dayOfWeek: [0, 6] },
                ...holidays,
                startDate ? { before: new Date(startDate + "T00:00:00") } : {},
              ]}
            />
          </div>

          <div className="flex justify-center">
            <span className="px-4 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-md border border-indigo-200 shadow-sm">
              {weekdays} {weekdays === 1 ? "day" : "days"}
            </span>
          </div>
          
          {/* ... (The rest of your JSX remains unchanged) ... */}
          {(selectedLeaveType && selectedLeaveType.allowHalfDay) && (
            <div className="space-y-3">
              <div className="p-1 inline-flex items-center bg-gray-200 rounded-lg">
                <button type="button" onClick={() => handleHalfDayModeChange(false)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${ !showCustomHalfDay ? 'bg-white text-gray-800 shadow' : 'text-gray-500 hover:text-gray-700' }`}>
                    Full days
                </button>
                <button type="button" onClick={() => handleHalfDayModeChange(true)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${ showCustomHalfDay ? 'bg-white text-gray-800 shadow' : 'text-gray-500 hover:text-gray-700' }`}>
                    Custom
                </button>
              </div>
              
              {showCustomHalfDay && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-medium text-gray-600">From {formatDateForDisplay(startDate)}</label>
                      <select value={halfDayConfig.start} onChange={(e) => setHalfDayConfig(p => ({...p, start: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">
                          <option value="fullday">Full Day</option>
                          <option value="first">First Half</option>
                          <option value="second">Second Half</option>
                      </select>
                    </div>
                    {isMultiDay && (
                      <>
                          <div className="pt-8 text-gray-500 font-medium">–</div>
                          <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-gray-600">To {formatDateForDisplay(endDate)}</label>
                            <select value={halfDayConfig.end} onChange={(e) => setHalfDayConfig(p => ({...p, end: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">
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
            <label className="text-sm font-medium text-gray-700">Leave Type</label>
            <LeaveTypeDropdown options={leaveTypeOptions} selectedId={leaveTypeId} setSelectedId={setLeaveTypeId} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-1 w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2 rounded-lg text-sm" />
          </div>

          {shouldShowDriveLink() && (
            <div>
              <label className="text-sm font-medium text-gray-700">Supporting Document (Google Drive Link)</label>
              <input type="url" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} className="mt-1 w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2 rounded-lg text-sm" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
              {submitting ? "Updating..." : "Update Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}