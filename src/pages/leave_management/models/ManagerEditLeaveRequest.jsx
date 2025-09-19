// FILE: ManagerEditLeaveRequest.js

import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

// --- Helper Functions ---

function countWeekdays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr.split("T")[0] + "T00:00:00");
  const end = new Date(endDateStr.split("T")[0] + "T00:00:00");
  if (end < start) return 0;
  let count = 0;
  let current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function mapBalancesToOptions(balances) {
  if (!balances || balances.length === 0) return [];

  return balances.map((balance) => {
    const { leaveType, remainingLeaves } = balance;
    const leaveTypeId = leaveType.leaveTypeId;
    const leaveName = leaveType.leaveName.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    let availableText;
    let isInfinite = false;

    if (leaveTypeId.includes("UPL") || leaveName.toLowerCase().includes("unpaid")) {
      availableText = "Infinite balance";
      isInfinite = true;
    } else if (remainingLeaves > 0) {
      const days = remainingLeaves % 1 === 0 ? remainingLeaves : remainingLeaves.toFixed(1);
      availableText = `${days} days available`;
    } else {
      availableText = "Not Available";
    }

    return {
      leaveTypeId,
      leaveName,
      availableText,
      disabled: !isInfinite && remainingLeaves <= 0,
    };
  });
}


// --- The Reusable LeaveTypeDropdown Component ---

function LeaveTypeDropdown({ options, selectedId, setSelectedId }) {
  const selectedOption = options.find((o) => o.leaveTypeId === selectedId) || null;

  return (
    <Listbox value={selectedOption} onChange={(option) => setSelectedId(option.leaveTypeId)}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300">
          <span className="flex justify-between items-center">
             <span className="block truncate font-medium">{selectedOption?.leaveName ?? 'Select a type'}</span>
             <span className="text-xs text-gray-500">{selectedOption?.availableText}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
            {options.map((option) => (
              <Listbox.Option
                key={option.leaveTypeId}
                className={({ active, disabled }) =>
                  `relative cursor-default select-none py-2 pl-4 pr-4 ${
                    active && !disabled ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                }
                value={option}
                disabled={option.disabled}
              >
                {({ selected }) => (
                  <div className="flex justify-between items-center">
                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                      {option.leaveName}
                    </span>
                    <span className={`text-xs ${selected ? 'font-medium' : 'text-gray-500'}`}>
                      {option.availableText}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 right-2 flex items-center text-indigo-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
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


// --- The Main EditLeaveRequestModal Component ---
export default function ManagerEditLeaveRequest({ isOpen, onClose, onSave, requestDetails }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [managerComment, setManagerComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [balances, setBalances] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  useEffect(() => {
    if (isOpen && requestDetails) {
      setStartDate(requestDetails.startDate || "");
      setEndDate(requestDetails.endDate || "");
      setLeaveTypeId(requestDetails.leaveType?.leaveTypeId || "");
      setManagerComment(requestDetails.managerComment || "");

      const fetchBalances = async () => {
        setLoadingBalances(true);
        try {
          const res = await axios.get(
            `${BASE_URL}/api/leave-balance/employee/${requestDetails.employee.employeeId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setBalances(res.data || []);
        } catch (err) {
          toast.error("Failed to load employee leave balances.");
        } finally {
          setLoadingBalances(false);
        }
      };
      fetchBalances();
    }
  }, [isOpen, requestDetails]);

  const leaveTypeOptions = mapBalancesToOptions(balances);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const daysRequested = countWeekdays(startDate, endDate);
    const updatedData = {
      leaveTypeId,
      startDate,
      endDate,
      daysRequested,
      managerComment,
      isHalfDay: requestDetails.isHalfDay,
    };
    onSave(requestDetails.leaveId, updatedData);
    setSubmitting(false);
  };

  // FIXED: New handler for the start date input to keep dates in sync.
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    // If the new start date is after the current end date, update the end date.
    if (endDate && newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Edit Leave Request</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
              <X className="w-5 h-5 text-gray-600" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee's Reason</label>
            <div
              className="w-full min-h-[42px] mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm break-words flex items-center"
            >
              {requestDetails.reason || <span className="text-gray-400">No reason provided.</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            {loadingBalances ? (
              <div className="mt-1 w-full p-2 border rounded-md bg-gray-100 text-center text-gray-500">Loading balances...</div>
            ) : (
              <LeaveTypeDropdown
                options={leaveTypeOptions}
                selectedId={leaveTypeId}
                setSelectedId={setLeaveTypeId}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              {/* UPDATED: Using the new handler */}
              <input type="date" value={startDate} onChange={handleStartDateChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={startDate} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700">Manager Comment (Optional)</label>
            <textarea
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              placeholder="Add a comment for the employee..."
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={submitting || loadingBalances} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}