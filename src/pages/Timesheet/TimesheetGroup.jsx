import React, { useState, useEffect, useRef } from "react";
import StatusBadge from "../../components/status/statusbadge";
import EntriesTable from "./EntriesTable";
import { CheckCircle, XCircle, Clock, MoreVertical } from "lucide-react";
import Tooltip from "../../components/status/Tooltip";
import { showStatusToast } from "../../components/toastfy/toast";
import { submitWeeklyTimesheet, fetchCalendarHolidays } from "./api";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatWeekRange = (weekRange) => {
  return weekRange;
};

// Function to get week number of the year
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

// Function to get month name
const getMonthName = (date) => {
  return new Date(date).toLocaleDateString("en-US", { month: "long" });
};

const calculateTotalHours = (entries) => {
  let totalMinutes = 0;
  entries.forEach((entry) => {
    try {
      let start, end;

      // Handle time-only strings (HH:MM:SS or HH:MM:SS.mmm)
      if (/^\d{2}:\d{2}:\d{2}(\.\d{3})?$/.test(entry.fromTime)) {
        const [startHours, startMinutes, startSeconds] =
          entry.fromTime.split(":");
        start = new Date(
          0,
          0,
          0,
          parseInt(startHours),
          parseInt(startMinutes),
          parseInt(startSeconds.split(".")[0])
        );
      } else {
        start = new Date(entry.fromTime);
      }

      if (/^\d{2}:\d{2}:\d{2}(\.\d{3})?$/.test(entry.toTime)) {
        const [endHours, endMinutes, endSeconds] = entry.toTime.split(":");
        end = new Date(
          0,
          0,
          0,
          parseInt(endHours),
          parseInt(endMinutes),
          parseInt(endSeconds.split(".")[0])
        );
      } else {
        end = new Date(entry.toTime);
      }

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        totalMinutes += (end - start) / (1000 * 60);
      }
    } catch (error) {
      console.error("Error calculating hours for entry:", entry, error);
    }
  });
  return (totalMinutes / 60).toFixed(2);
};

const TimesheetGroup = ({
  weekGroup,
  timesheetId,
  workDate,
  entries,
  status,
  mapWorkType,
  emptyTimesheet,
  refreshData,
  projectInfo,
  getWeeklyStatusColor,
  approvers = [
    { approverName: "Dummy Approver1", status: "Pending" },
    { approverName: "Dummy Approver2", status: "Approved" },
  ],
}) => {
  // Handle both old daily format and new weekly format
  const isWeeklyFormat = weekGroup && weekGroup.timesheets;
  const weekData = isWeeklyFormat ? weekGroup : null;
  const dailyData = !isWeeklyFormat
    ? { timesheetId, workDate, entries, status }
    : null;

  const [entriesState, setEntriesState] = useState(
    isWeeklyFormat ? [] : entries
  );
  const [selectedEntryIds, setSelectedEntryIds] = useState([]);
  const [addingNewEntry, setAddingNewEntry] = useState(false);
  const [holidaysMap, setHolidaysMap] = useState({}); // keyed by 'YYYY-MM-DD'
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [date, setDate] = useState(
    isWeeklyFormat ? weekData.weekStart : workDate
  );
  const [editDateIndex, setEditDateIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showSelectionCheckboxes, setShowSelectionCheckboxes] = useState(false);
  const menuRef = useRef(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmittingWeek, setIsSubmittingWeek] = useState(false);

  // Create individual refs for each timesheet menu
  const menuRefs = useRef({});

  // Check if submit button should be disabled
  const isSubmitDisabled = () => {
    if (!isWeeklyFormat || !weekData) return true;

    const weeklyStatus = weekData.status?.toUpperCase();

    // Disabled if already approved or partially approved
    if (weeklyStatus === "APPROVED" || weeklyStatus === "PARTIALLY_APPROVED") {
      return true;
    }

    // For SUBMITTED status, check if all timesheets are not DRAFT
    if (weeklyStatus === "SUBMITTED") {
      // Check if all timesheets are submitted (not DRAFT)
      const allSubmitted = weekData.timesheets.every(
        (ts) => ts.status?.toUpperCase() !== "DRAFT"
      );
      return allSubmitted;
    }

    return false; // Enabled for DRAFT or other statuses
  };

  // Get the button text based on status
  const getSubmitButtonText = () => {
    if (!isWeeklyFormat || !weekData) return "SUBMIT WEEK";

    const weeklyStatus = weekData.status?.toUpperCase();

    if (weeklyStatus === "APPROVED") {
      return "Week Already Approved";
    }
    if (weeklyStatus === "PARTIALLY_APPROVED") {
      return "Week Partially Approved";
    }
    if (weeklyStatus === "SUBMITTED") {
      return "Week Already Submitted";
    }

    return "SUBMIT WEEK";
  };

  // Handle weekly submission
  const handleSubmitWeek = async () => {
    if (!isWeeklyFormat) return;

    // Get all timesheet IDs for the week
    const timesheetIds = weekData.timesheets.map((ts) => ts.timesheetId);

    if (timesheetIds.length === 0) {
      showStatusToast("No timesheets to submit", "error");
      return;
    }

    try {
      setIsSubmittingWeek(true);
      await submitWeeklyTimesheet(timesheetIds);
      if (refreshData) await refreshData();
    } catch (error) {
      console.error("Failed to submit weekly timesheet:", error);
    } finally {
      setIsSubmittingWeek(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      // Check if click is outside any menu
      const isOutsideAllMenus = Object.values(menuRefs.current).every(
        (ref) => ref && !ref.contains(event.target)
      );

      if (isOutsideAllMenus) {
        setMenuOpen(false);
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate total hours based on format
  const totalHours = isWeeklyFormat
    ? weekData.totalHours.toFixed(2)
    : calculateTotalHours(entriesState);

  const handleAddEntry = () => {
    setMenuOpen(false);
    setAddingNewEntry(true); // open inline entry form inside EntriesTable
  };

  const handleDeleteClick = () => {
    if (selectedEntryIds.length === 0) {
      alert("No entries selected for deletion.");
      return;
    }
    setMenuOpen(false);
    setIsConfirmOpen(true);
  };

  const toggleDateChange = (e) => {
    if (status?.toLowerCase() === "approved") return; // prevent date change if approved
    setEditDateIndex((prev) => (prev === null ? 0 : null));
  };

  const handleConfirmDelete = async () => {
    setIsConfirmOpen(false);
    try {
      // For weekly format, we need to delete from multiple timesheets
      if (isWeeklyFormat) {
        // Delete entries from all timesheets in the week
        for (const timesheet of weekData.timesheets) {
          const response = await fetch(
            `${
              import.meta.env.VITE_TIMESHEET_API_ENDPOINT
            }/api/timesheet/entries`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                timesheetId: timesheet.timesheetId,
                entryIds: selectedEntryIds,
              }),
            }
          );
          if (!response.ok) throw new Error("Failed to delete entries");
        }
      } else {
        const response = await fetch(
          `${
            import.meta.env.VITE_TIMESHEET_API_ENDPOINT
          }/api/timesheet/entries`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              timesheetId: timesheetId,
              entryIds: selectedEntryIds,
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to delete entries");
      }
      setSelectedEntryIds([]);
      showStatusToast("Entries deleted successfully", "success");
      if (refreshData) await refreshData();
    } catch (error) {
      showStatusToast("Error deleting entries", "error");
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
  };

  const handleSelect = () => {
    setMenuOpen(false);
    setShowSelectionCheckboxes((prev) => !prev); // toggle checkboxes
    setSelectedEntryIds([]); // clear previous selection
  };

  const approveStatus = approvers.every(
    (a) => a.status?.toUpperCase() === "APPROVED"
  );

  // Get current status and date display
  const currentStatus = isWeeklyFormat ? weekData.status : status;
  const currentDate = isWeeklyFormat ? weekData.weekRange : formatDate(date);

  // Get week number and month for weekly format
  const weekNumber = isWeeklyFormat ? weekData.weekNumber : null;
  const monthName = isWeeklyFormat ? weekData.monthName : null;
  const year = isWeeklyFormat ? weekData.year : null;

  // Custom status badge with correct colors
  const CustomStatusBadge = ({ label, size = "sm" }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "draft":
        case "submitted":
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "approved":
        case "partially approved":
          return "bg-green-100 text-green-800 border-green-300";
        case "rejected":
          return "bg-red-100 text-red-800 border-red-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    };

    const sizeStyles = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-3 py-1",
      lg: "text-base px-4 py-1.5",
    };

    return (
      <span
        className={`inline-block rounded-full font-medium border ${getStatusColor(
          label
        )} ${sizeStyles[size]}`}
      >
        {label}
      </span>
    );
  };

  const formatApproverTooltip = (approvers) => {
    if (!approvers || approvers.length === 0) {
      return <p className="text-gray-400">No approver data</p>;
    }
    const approved = approvers.filter(
      (a) => a.status?.toUpperCase() === "APPROVED"
    );
    const rejected = approvers.filter(
      (a) => a.status?.toUpperCase() === "REJECTED"
    );
    const pending = approvers.filter(
      (a) => a.status?.toUpperCase() === "PENDING"
    );

    return (
      <div className="space-y-2 text-xs">
        {approved.length > 0 && (
          <div>
            <div className="flex items-center gap-1 font-medium text-green-400">
              <CheckCircle size={14} /> Approved by:
            </div>
            <ul className="list-disc list-inside text-gray-200 ml-4">
              {approved.map((a) => (
                <li key={a.approverName}>{a.approverName}</li>
              ))}
            </ul>
          </div>
        )}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center gap-1 font-medium text-yellow-400">
              <Clock size={14} /> Yet to be approved by:
            </div>
            <ul className="list-disc list-inside text-gray-200 ml-4">
              {pending.map((a) => (
                <li key={a.approverName}>{a.approverName}</li>
              ))}
            </ul>
          </div>
        )}
        {rejected.length > 0 && (
          <div>
            <div className="flex items-center gap-1 font-medium text-red-400">
              <XCircle size={14} /> Rejected by:
            </div>
            <ul className="list-disc list-inside text-gray-200 ml-4">
              {rejected.map((a) => (
                <li key={a.approverName}>{a.approverName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Determine border color based on status
  const getBorderColor = () => {
    if (isWeeklyFormat) {
      const status = currentStatus?.toLowerCase();
      if (status === "approved" || status === "partially approved")
        return "border-green-500";
      if (status === "rejected") return "border-red-500";
      if (status === "draft" || status === "submitted")
        return "border-yellow-500";
      return "border-gray-500";
    }
    return "border-gray-300";
  };

  // Determine background color for week header based on status
  const getWeekHeaderBgColor = () => {
    if (isWeeklyFormat) {
      const status = currentStatus?.toLowerCase();
      if (status === "approved" || status === "partially approved")
        return "bg-green-50 border-b-green-200";
      if (status === "rejected") return "bg-red-50 border-b-red-200";
      if (status === "draft" || status === "submitted")
        return "bg-yellow-50 border-b-yellow-200";
      return "bg-gray-50 border-b-gray-200";
    }
    return "bg-blue-50 border-b-blue-200";
  };

  // Determine week badge color based on status
  const getWeekBadgeColor = () => {
    if (isWeeklyFormat) {
      const status = currentStatus?.toLowerCase();
      if (status === "approved" || status === "partially approved")
        return "bg-green-600";
      if (status === "rejected") return "bg-red-600";
      if (status === "draft" || status === "submitted") return "bg-yellow-600";
      return "bg-gray-600";
    }
    return "bg-blue-600";
  };

  // Determine total hours text color based on status
  const getTotalHoursColor = () => {
    if (isWeeklyFormat) {
      const status = currentStatus?.toLowerCase();
      if (status === "approved" || status === "partially approved")
        return "text-green-700";
      if (status === "rejected") return "text-red-700";
      if (status === "draft" || status === "submitted")
        return "text-yellow-700";
      return "text-gray-700";
    }
    return "text-blue-700";
  };

  // Calculate the first and last date of the current month
  const today = new Date();
  const firstDateOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDateOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  // helper to normalize date string to yyyy-mm-dd
  const normalize = (d) => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  useEffect(() => {
    let mounted = true;
    const loadHolidays = async () => {
      try {
        setLoadingHolidays(true);
        const data = await fetchCalendarHolidays();
        if (!mounted || !data) return;
        const map = {};
        data.forEach((h) => {
          const key = normalize(h.holidayDate);
          map[key] = h;
        });
        setHolidaysMap(map);
      } catch (err) {
        console.error("Failed to load holidays", err);
      } finally {
        setLoadingHolidays(false);
      }
    };
    loadHolidays();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div
      className={`mb-6 bg-white rounded-xl shadow-lg border-2 ${getBorderColor()} hover:border-opacity-80 transition-colors duration-200 text-xs overflow-hidden`}
    >
      {/* Week Header */}
      {isWeeklyFormat && (
        <div className={`${getWeekHeaderBgColor()} border-b px-4 py-3 mb-2`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                className={`${getWeekBadgeColor()} text-white px-3 py-1 rounded-full text-sm font-bold`}
              >
                Week {weekNumber}
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {monthName} {year}
              </div>
              <div className="text-sm text-gray-600">{weekData.weekRange}</div>
            </div>
            <div className="flex items-center gap-4">
              {/* Week Difference Display */}
              {weekData.hoursDifference !== undefined &&
                weekData.hoursDifference > 0 && (
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        weekData.differenceType === "increase"
                          ? "text-green-600"
                          : weekData.differenceType === "decrease"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {weekData.differenceType === "increase"
                        ? "↗"
                        : weekData.differenceType === "decrease"
                        ? "↘"
                        : "→"}{" "}
                      {weekData.hoursDifference.toFixed(1)} hrs
                    </div>
                    <div className="text-xs text-gray-500">
                      vs previous week
                    </div>
                  </div>
                )}

              <div className="text-right">
                <div className={`text-lg font-bold ${getTotalHoursColor()}`}>
                  {totalHours} hrs
                </div>
                <div className="text-xs text-gray-500">Total Hours</div>
              </div>
              <CustomStatusBadge label={currentStatus} size="md" />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-1 mx-4">
        {/* Daily format header */}
        {!isWeeklyFormat && (
          <>
            {editDateIndex === timesheetId &&
            emptyTimesheet &&
            status?.toLowerCase() !== "approved" ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  min={firstDateOfMonth}
                  max={lastDateOfMonth}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  value={normalize(date)}
                  onChange={(e) => {
                    const selected = e.target.value;
                    // enforce month range
                    if (
                      selected < firstDateOfMonth ||
                      selected > lastDateOfMonth
                    ) {
                      showStatusToast(
                        "Select a date within the current month",
                        "error"
                      );
                      return;
                    }
                    const holiday = holidaysMap[selected];
                    if (holiday && holiday.submitTimesheet === false) {
                      // block selection for holidays that are not allowed
                      showStatusToast(
                        `Holiday: ${holiday.holidayName} — timesheet not allowed`,
                        "error"
                      );
                      return;
                    }
                    setEditDateIndex(null);
                    setDate(selected);
                  }}
                />
                {/* holiday dot + tooltip for selected date */}
                {holidaysMap[normalize(date)] && (
                  <div className="ml-1">
                    {/* <Tooltip content={holidaysMap[normalize(date)].holidayName}> */}
                    <Tooltip 
                      content={holidaysMap[normalize(date)].submitTimesheet
                        ? "Working on Holiday"
                        : "Holiday - timesheet not allowed"}
                    >
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          holidaysMap[normalize(date)].submitTimesheet
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        title={holidaysMap[normalize(date)].holidayName}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() =>
                  status?.toLowerCase() !== "approved" &&
                  setEditDateIndex(timesheetId)
                }
                className={`text-gray-500 font-semibold ${
                  status?.toLowerCase() !== "approved"
                    ? "cursor-pointer hover:text-blue-600"
                    : "cursor-not-allowed"
                }`}
              >
                {currentDate}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">
                Total hours : {totalHours} hrs
              </span>
              <CustomStatusBadge label={currentStatus} size="sm" />
            </div>
          </>
        )}

        {/* 3 dots menu for daily format */}
        {!isWeeklyFormat && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="p-2 rounded-full hover:bg-gray-300 focus:outline-none"
              type="button"
              disabled={currentStatus?.toLowerCase() === "approved"}
              title={
                currentStatus?.toLowerCase() === "approved"
                  ? "Cannot edit approved timesheet"
                  : "More options"
              }
            >
              <MoreVertical size={22} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 border">
                <button
                  onClick={handleAddEntry}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Add Entry
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
                <button
                  onClick={handleSelect}
                  className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                >
                  Select
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isWeeklyFormat ? (
        // Render weekly timesheets
        <div className="space-y-3 p-4">
          {weekData.timesheets
            .sort((a, b) => new Date(a.workDate) - new Date(b.workDate))
            .map((timesheet, index) => (
              <div
                key={timesheet.timesheetId}
                className="bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 shadow-sm overflow-visible"
              >
                {/* Individual Day Header */}
                <div className="bg-white border-b-2 border-gray-300 px-4 py-3 flex justify-between items-center rounded-t-lg overflow-visible">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-gray-700">
                      {formatDate(timesheet.workDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {calculateTotalHours(timesheet.entries)} hrs
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative overflow-visible">
                    <CustomStatusBadge label={timesheet.status} size="sm" />
                    {/* Show approval status tooltip if available */}
                    {timesheet.actionStatus &&
                      timesheet.actionStatus.length > 0 && (
                        <div
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <Tooltip
                            content={formatApproverTooltip(
                              timesheet.actionStatus
                            )}
                          >
                            <span className="text-xs text-gray-500 cursor-help px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 whitespace-nowrap">
                              {timesheet.actionStatus.length} approver
                              {timesheet.actionStatus.length > 1 ? "s" : ""}
                            </span>
                          </Tooltip>
                        </div>
                      )}

                    {/* 3 dots menu for individual timesheet */}
                    <div
                      className="relative"
                      ref={(el) => {
                        if (el) {
                          menuRefs.current[timesheet.timesheetId] = el;
                        }
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newMenuId =
                            openMenuId === timesheet.timesheetId
                              ? null
                              : timesheet.timesheetId;
                          setOpenMenuId(newMenuId);
                          setMenuOpen(newMenuId !== null);
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                        type="button"
                        disabled={
                          timesheet.status?.toLowerCase() === "approved"
                        }
                        title={
                          timesheet.status?.toLowerCase() === "approved"
                            ? "Cannot edit approved timesheet"
                            : "More options"
                        }
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === timesheet.timesheetId && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 border">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddEntry();
                              setOpenMenuId(null);
                              setMenuOpen(false);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Add Entry
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick();
                              setOpenMenuId(null);
                              setMenuOpen(false);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect();
                              setOpenMenuId(null);
                              setMenuOpen(false);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                          >
                            Select
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Entries Table */}
                <div className="p-2">
                  <EntriesTable
                    entries={timesheet.entries}
                    selectedEntryIds={selectedEntryIds}
                    setSelectedEntryIds={setSelectedEntryIds}
                    timesheetId={timesheet.timesheetId}
                    workDate={timesheet.workDate}
                    status={timesheet.status}
                    mapWorkType={mapWorkType}
                    addingNewEntry={addingNewEntry}
                    setAddingNewEntry={setAddingNewEntry}
                    refreshData={refreshData}
                    projectInfo={projectInfo}
                    selectionMode={showSelectionCheckboxes}
                  />
                </div>
              </div>
            ))}

          {/* Submit Week Button */}
          {isWeeklyFormat && weekData && (
            <div className="mt-4 px-4 py-3 border-t border-gray-200 bg-white rounded-b-lg">
              <button
                onClick={handleSubmitWeek}
                disabled={isSubmittingWeek || isSubmitDisabled()}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  isSubmitDisabled()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isSubmittingWeek
                    ? "bg-blue-400 text-white cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isSubmittingWeek
                  ? "Submitting..."
                  : isSubmitDisabled()
                  ? getSubmitButtonText()
                  : "SUBMIT WEEK"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <EntriesTable
          entries={entriesState}
          selectedEntryIds={selectedEntryIds}
          setSelectedEntryIds={setSelectedEntryIds}
          timesheetId={timesheetId}
          workDate={date}
          status={status}
          mapWorkType={mapWorkType}
          addingNewEntry={addingNewEntry}
          setAddingNewEntry={setAddingNewEntry}
          refreshData={refreshData}
          projectInfo={projectInfo}
          selectionMode={showSelectionCheckboxes}
        />
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${
          selectedEntryIds.length
        } selected entr${selectedEntryIds.length > 1 ? "ies" : "y"}?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export { TimesheetGroup };
