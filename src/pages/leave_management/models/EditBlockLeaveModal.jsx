import React, { useState, useMemo, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "react-toastify";
import DateRangePicker from "./DateRangePicker"; // Assuming this is in the same folder

// Re-using the inline date range picker, but for the modal
function ModalDateRange({ start, end, setStart, setEnd, holidays }) {
  const handleStartChange = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    if (end && new Date(end) < new Date(formattedDate)) {
      toast.warn("End date cannot be before start date.");
      setEnd("");
    }
    setStart(formattedDate);
  };

  const handleEndChange = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    if (start && new Date(formattedDate) < new Date(start)) {
      toast.error("End date cannot be before start date.");
      return;
    }
    setEnd(formattedDate);
  };

  // Fix timezone for picker
  const localStartDate = start ? new Date(start + "T00:00:00") : undefined;
  const localEndDate = end ? new Date(end + "T00:00:00") : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <DateRangePicker
        label="Start Date"
        defaultDate={localStartDate}
        onChange={handleStartChange}
        disabledDays={[{ dayOfWeek: [0, 6] }, ...(holidays || [])]}
      />
      <DateRangePicker
        label="End Date"
        defaultDate={localEndDate}
        onChange={handleEndChange}
        disabledDays={[
          { dayOfWeek: [0, 6] },
          { before: localStartDate },
          ...(holidays || []),
        ]}
        align="right"
      />
    </div>
  );
}

export default function EditBlockLeaveModal({
  isOpen,
  onClose,
  block,
  allLeaveTypes,
  allProjectMembers,
  holidays,
  onSave,
}) {
  // State for editable fields
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State for the unblock checkboxes
  // Format: { [empId]: { [ltId]: true (unblock) } }
  const [unblockState, setUnblockState] = useState({});

  // Effect to reset state when the block data changes (modal opens)
  useEffect(() => {
    if (block) {
      setReason(block.reason || "");
      setStartDate(block.startDate);
      setEndDate(block.endDate);
      setUnblockState({}); // Clear previous selections
    }
  }, [block]);

  // Memoize the lists of members and leave types *in this block*
  // to build the table
  const membersInBlock = useMemo(() => {
    const memberIds = new Set(block?.memberIds || []);
    return (allProjectMembers || []).filter((m) =>
      memberIds.has(String(m.value))
    );
  }, [block, allProjectMembers]);

  const leaveTypesInBlock = useMemo(() => {
    const leaveTypeIds = new Set(block?.leaveTypeIds || []);
    return (allLeaveTypes || []).filter((lt) =>
      leaveTypeIds.has(String(lt.value))
    );
  }, [block, allLeaveTypes]);

  // --- Checkbox Handlers ---

  // Handle checking/unchecking a single leave type for an employee
  const handleLeaveTypeCheck = (empId, ltId, isChecked) => {
    setUnblockState((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [ltId]: isChecked,
      },
    }));
  };

  // Handle checking/unchecking the "main" checkbox for an employee
  const handleEmployeeCheck = (empId, isChecked) => {
    const newLtState = {};
    if (isChecked) {
      // Check all leave types for this employee
      for (const lt of leaveTypesInBlock) {
        newLtState[lt.value] = true;
      }
    }
    // If unchecked, all associated leave types are cleared
    setUnblockState((prev) => ({
      ...prev,
      [empId]: newLtState,
    }));
  };

  // --- Derived Checkbox State ---

  // Get the state of a single (employee, leaveType) checkbox
  const getLeaveTypeCheckState = (empId, ltId) => {
    return !!unblockState[empId]?.[ltId];
  };

  // Get the state of the main employee checkbox
  const getEmployeeCheckState = (empId) => {
    const allLtIds = leaveTypesInBlock.map((lt) => lt.value);
    const checkedLtIds = Object.keys(unblockState[empId] || {}).filter(
      (ltId) => unblockState[empId][ltId]
    );

    if (checkedLtIds.length === 0) return false; // None checked
    if (checkedLtIds.length < allLtIds.length) return "indeterminate"; // Some checked
    return true; // All checked
  };

  // --- Save Handler ---

  // *** UPDATED SAVE LOGIC ***
// *** UPDATED SAVE LOGIC ***
const handleSaveClick = async () => {
  setSubmitting(true);

  // 1. Get list of all leave type IDs in this block (Needed for unblock payload)
  const allLeaveTypeIdsInBlock = leaveTypesInBlock.map((lt) => lt.value);

  // 2. Find all employees where "Unblock All" is fully checked
  const employeesToUnblockAll = [];
  for (const member of membersInBlock) {
    const empId = member.value;
    const checkState = getEmployeeCheckState(empId);
    // Check if the main checkbox state is exactly true (not indeterminate)
    if (checkState === true) {
      employeesToUnblockAll.push(empId);
    }
  }

  // 3. Collect general block updates (reason and dates)
  const blockUpdates = {
    reason: reason,
    startDate: startDate,
    endDate: endDate,
  };

  try {
    // onSave is the function passed from the parent
    // Pass the list of employees marked for full unblock, and all leave type IDs
    await onSave(
      block.id,
      blockUpdates,
      employeesToUnblockAll,      // List of employee IDs to fully unblock
      allLeaveTypeIdsInBlock  // List of all leave type IDs in this block
    );

    // Success is handled by the parent now, just close
    onClose();

  } catch (err) {
    // Error handling remains the same
    toast.error(err.message || "Failed to save update.");
  } finally {
    setSubmitting(false);
  }
};

  if (!isOpen || !block) return null;

  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          {/* Modal Panel */}
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
              <h3
                className="text-lg font-semibold leading-6 text-gray-900"
                id="modal-title"
              >
                Edit Leave Block:{" "}
                <span className="font-bold text-indigo-600">
                  {block.projectName}
                </span>
              </h3>
              <button type="button" onClick={onClose}>
                <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Reason */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Reason
                  </label>
                  <textarea
                    id="reason"
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                </div>

                {/* Dates */}
                <ModalDateRange
                  start={startDate}
                  end={endDate}
                  setStart={setStartDate}
                  setEnd={setEndDate}
                  holidays={holidays}
                />

                {/* Unblock Table */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Manage Blocked Employees
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Check a leave type to unblock it for that employee. Use the
                    main checkbox to unblock all types for an employee.
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium uppercase text-gray-500">
                            Employee
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium uppercase text-gray-500">
                            Unblock All
                          </th>
                          {leaveTypesInBlock.map((lt) => (
                            <th
                              key={lt.value}
                              className="py-3 px-4 text-left text-xs font-medium uppercase text-gray-500"
                            >
                              {lt.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {membersInBlock.map((member) => {
                          const mainCheckState = getEmployeeCheckState(
                            member.value
                          );
                          return (
                            <tr key={member.value}>
                              <td className="whitespace-nowrap py-3 px-4 text-sm font-medium text-gray-800">
                                {member.label}
                              </td>
                              <td className="whitespace-nowrap py-3 px-4 text-sm">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  checked={mainCheckState === true}
                                  ref={(el) =>
                                    el &&
                                    (el.indeterminate =
                                      mainCheckState === "indeterminate")
                                  }
                                  onChange={(e) =>
                                    handleEmployeeCheck(
                                      member.value,
                                      e.target.checked
                                    )
                                  }
                                />
                              </td>
                              {leaveTypesInBlock.map((lt) => (
                                <td
                                  key={lt.value}
                                  className="whitespace-nowrap py-3 px-4 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={getLeaveTypeCheckState(
                                      member.value,
                                      lt.value
                                    )}
                                    onChange={(e) =>
                                      handleLeaveTypeCheck(
                                        member.value,
                                        lt.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveClick}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}