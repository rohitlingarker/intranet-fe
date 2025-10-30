import React, { useMemo, useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { reviewTimesheet, handleBulkReview } from "../api";
import { TimesheetGroup } from "../TimesheetGroup";
import { showStatusToast } from "../../../components/toastfy/toast";
import Button from "../../../components/Button/Button";
import { MoreVertical, X } from "lucide-react";

const ManagerApprovalTable = ({
  loading,
  groupedData = [],
  statusFilter = "All",
  onRefresh,
}) => {
  const [rejectionComments, setRejectionComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [projectInfo, setProjectInfo] = useState([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayData, setHolidayData] = useState([]);
  const [holidayLoading, setHolidayLoading] = useState(false);

  // -----------------------------
  // Fetch project info
  // -----------------------------
  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/project-info/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch project info");
        const data = await res.json();

        const normalized = data.map((p) => ({
          projectId: p.projectId,
          projectName: p.project,
          tasks: p.tasks.map((t) => ({
            taskId: t.taskId,
            taskName: t.task,
          })),
        }));
        setProjectInfo(normalized);
      } catch (err) {
        console.error("Error fetching project info:", err);
      }
    };
    fetchProjectInfo();
  }, []);

  // -----------------------------
  // Fetch Holiday Excluded Users
  // -----------------------------
  const fetchHolidayExcludedUsers = async () => {
    setHolidayLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_TIMESHEET_API_ENDPOINT
        }/api/holiday-exclude-users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch holiday users");
      const data = await res.json();
      setHolidayData(data);
    } catch (err) {
      console.error("Error fetching holiday users:", err);
      showStatusToast("Failed to load holiday data", "error");
    } finally {
      setHolidayLoading(false);
    }
  };

  const handleShowHolidayModal = () => {
    setShowHolidayModal(true);
    fetchHolidayExcludedUsers();
  };

  // -----------------------------
  // Lookup maps for fast access
  // -----------------------------
  const projectIdToName = useMemo(
    () =>
      Object.fromEntries(projectInfo.map((p) => [p.projectId, p.projectName])),
    [projectInfo]
  );

  const taskIdToName = useMemo(
    () =>
      Object.fromEntries(
        projectInfo.flatMap((p) => p.tasks.map((t) => [t.taskId, t.taskName]))
      ),
    [projectInfo]
  );

  // -----------------------------
  // Enrich timesheet entries
  // -----------------------------
  const enrichedGroupedData = useMemo(
    () =>
      groupedData.map((user) => ({
        ...user,
        weeklySummary: user.weeklySummary.map((week) => ({
          ...week,
          timesheets: week.timesheets.map((t) => ({
            ...t,
            entries: t.entries.map((entry) => ({
              ...entry,
              projectName:
                projectIdToName[entry.projectId] ||
                `Project-${entry.projectId}`,
              taskName: taskIdToName[entry.taskId] || `Task-${entry.taskId}`,
            })),
          })),
        })),
      })),
    [groupedData, projectIdToName, taskIdToName]
  );

  // -----------------------------
  // Approve / Reject Logic
  // -----------------------------
  const handleStatusChange = async (timesheetId, status, comment = "") => {
    try {
      await reviewTimesheet(timesheetId, comment, status);
      showStatusToast(
        `Timesheet ${status.toLowerCase()} successfully`,
        "success"
      );
      onRefresh?.();
    } catch (err) {
      console.error("Error updating status:", err);
      showStatusToast("Failed to update timesheet status", "error");
    }
  };

  // -----------------------------
  // Export Logic (CSV / PDF)
  // -----------------------------
  const exportCSV = () => {
    const rows = [
      [
        "User ID",
        "User Name",
        "Project",
        "Task",
        "Start",
        "End",
        "Work Type",
        "Description",
        "Hours",
        "Date",
        "Status",
      ],
    ];

    enrichedGroupedData.forEach((user) =>
      user.weeklySummary.forEach((week) =>
        week.timesheets.forEach((sheet) =>
          sheet.entries.forEach((entry) => {
            rows.push([
              user.userId,
              user.userName,
              entry.projectName,
              entry.taskName,
              new Date(entry.fromTime).toLocaleTimeString(),
              new Date(entry.toTime).toLocaleTimeString(),
              entry.workLocation || "-",
              entry.description || "",
              entry.hoursWorked?.toFixed(2) || 0,
              new Date(sheet.workDate).toLocaleDateString(),
              sheet.status,
            ]);
          })
        )
      )
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((v) => `"${v}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "manager_timesheets.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Manager Timesheet Report", 14, 10);
    const body = [];

    enrichedGroupedData.forEach((user) =>
      user.weeklySummary.forEach((week) =>
        week.timesheets.forEach((sheet) =>
          sheet.entries.forEach((entry) =>
            body.push([
              user.userId,
              user.userName,
              entry.projectName,
              entry.taskName,
              new Date(entry.fromTime).toLocaleTimeString(),
              new Date(entry.toTime).toLocaleTimeString(),
              entry.workLocation || "-",
              entry.description || "",
              entry.hoursWorked?.toFixed(2) || 0,
              new Date(sheet.workDate).toLocaleDateString(),
              sheet.status,
            ])
          )
        )
      )
    );

    autoTable(doc, {
      head: [
        [
          "User ID",
          "User Name",
          "Project",
          "Task",
          "Start",
          "End",
          "Work Type",
          "Description",
          "Hours",
          "Date",
          "Status",
        ],
      ],
      body,
      startY: 20,
    });
    doc.save("manager_timesheets.pdf");
  };

  // Track selection mode and selected users
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Toggle remove mode
  const toggleRemoveMode = () => {
    if (isRemoveMode) {
      // Leaving remove mode — clear selections
      setIsRemoveMode(false);
      setSelectedUsers([]);
    } else {
      // Enter remove mode
      setIsRemoveMode(true);
    }
  };

  // Select / Deselect single user (only in remove mode)
  const handleSelectUser = (userId) => {
    if (!isRemoveMode) return;
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Select or deselect all users
  const handleToggleSelectAll = () => {
    if (selectedUsers.length === holidayData.length) {
      setSelectedUsers([]); // Deselect all
    } else {
      setSelectedUsers(holidayData.map((u) => u.id)); // Select all
    }
  };

  // Handle remove selected users
  const handleRemoveSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${selectedUsers.length} user(s)?`
    );
    if (!confirmDelete) return;

    try {
      for (const id of selectedUsers) {
        const res = await fetch(
          `${
            import.meta.env.VITE_TIMESHEET_API_ENDPOINT
          }/api/holiday-exclude-users/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error(`Failed to delete user ${id}`);
      }

      showStatusToast("Selected user(s) removed successfully!", "success");
      fetchHolidayExcludedUsers();
      setSelectedUsers([]);
      setIsRemoveMode(false); // Exit remove mode after success
    } catch (err) {
      console.error("Error removing users:", err);
      showStatusToast("Error while removing users", "error");
    }
  };


  const [showAddUserSection, setShowAddUserSection] = useState(false);
  const [managerUsers, setManagerUsers] = useState([]);
  const [monthlyHolidays, setMonthlyHolidays] = useState([]);
  const [selectedAddUser, setSelectedAddUser] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState("");
  const [reason, setReason] = useState("");
  const [addUserLoading, setAddUserLoading] = useState(false);


  const fetchManagerUsers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/manager/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch manager users");
      const data = await res.json();
      setManagerUsers(data);
    } catch (err) {
      console.error("Error fetching manager users:", err);
      showStatusToast("Failed to load user list", "error");
    }
  };

  const fetchMonthlyHolidays = async () => {
    const currentMonth = new Date().getMonth() + 1;
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_LMS_BASE_URL
        }/api/holidays/month/${currentMonth}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch holidays");
      const data = await res.json();
      setMonthlyHolidays(data);
    } catch (err) {
      console.error("Error fetching holidays:", err);
      showStatusToast("Failed to load holiday list", "error");
    }
  };
const handleConfirmAddUser = async () => {
  if (!selectedAddUser || !selectedHoliday || !reason.trim()) {
    showStatusToast("Please fill all fields before confirming.", "warning");
    return;
  }

  try {
    const res = await fetch(
      `${
        import.meta.env.VITE_TIMESHEET_API_ENDPOINT
      }/api/holiday-exclude-users/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: parseInt(selectedAddUser, 10),
          holidayDate: selectedHoliday,
          reason,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to add user to holiday exclude list");

    showStatusToast("User added to holiday exclusion successfully!", "success");
    fetchHolidayExcludedUsers();
    setShowAddUserSection(false);
    setSelectedAddUser("");
    setSelectedHoliday("");
    setReason("");
  } catch (err) {
    console.error("Error adding holiday exclude user:", err);
    showStatusToast("Failed to add user", "error");
  }
};


const handleAddUserClick = async () => {
  setShowAddUserSection(true);
  setAddUserLoading(true);
  try {
    const currentMonth = new Date().getMonth() + 1;

    // Run both API calls in parallel and wait for both to finish
    const [usersRes, holidaysRes] = await Promise.all([
      fetch(
        `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/manager/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      ),
      fetch(
        `${
          import.meta.env.VITE_LMS_BASE_URL
        }/api/holidays/month/${currentMonth}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      ),
    ]);

    if (!usersRes.ok || !holidaysRes.ok)
      throw new Error("Failed to fetch data");

    const [usersData, holidaysData] = await Promise.all([
      usersRes.json(),
      holidaysRes.json(),
    ]);

    setManagerUsers(usersData);
    setMonthlyHolidays(holidaysData);
  } catch (err) {
    console.error("Error loading add-user data:", err);
    showStatusToast("Failed to load user or holiday data", "error");
  } finally {
    setAddUserLoading(false);
  }
};

  // -----------------------------
  // Main Render
  // -----------------------------
  return (
    <div className="space-y-6">
      {loading ? (
        <LoadingSpinner text="Loading manager view..." />
      ) : (
        <>
          <div className="flex justify-end gap-3 mb-4">
            <Button variant="primary" size="small" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="primary" size="small" onClick={exportPDF}>
              Export PDF
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={handleShowHolidayModal}
            >
              <MoreVertical size={14} />
            </Button>
          </div>

          {enrichedGroupedData.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-lg font-medium">
              No Approvals
            </div>
          ) : (
            enrichedGroupedData.map((user) => (
              <div
                key={user.userId}
                className="bg-white rounded-xl shadow-md border p-4"
              >
                <h2 className="text-xl font-bold mb-3 text-gray-800">
                  {user.userName} (ID: {user.userId})
                </h2>
                {/* Render user’s weekly summaries */}
              </div>
            ))
          )}
        </>
      )}

      {/* ----------------------------- */}
      {/* Holiday Modal */}
      {/* ----------------------------- */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowHolidayModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Holiday Excluded Users
            </h2>

            {holidayLoading ? (
              <LoadingSpinner text="Loading holiday data..." />
            ) : holidayData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No users found who worked on holidays.
              </p>
            ) : (
              <>
                {/* --- Select All / Deselect All --- */}
                {isRemoveMode && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {selectedUsers.length === holidayData.length
                        ? "All users selected"
                        : `${selectedUsers.length} selected`}
                    </span>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleToggleSelectAll}
                    >
                      {selectedUsers.length === holidayData.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                )}

                {/* --- User List --- */}
                <div className="overflow-y-auto max-h-80 space-y-3">
                  {holidayData.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectUser(item.id)}
                      className={`border rounded-lg p-4 transition-all ${
                        isRemoveMode ? "cursor-pointer" : "cursor-default"
                      } ${
                        isRemoveMode && selectedUsers.includes(item.id)
                          ? "bg-red-100 border-red-400"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {item.userName} (User ID: {item.userId})
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Holiday Date:</span>{" "}
                        {new Date(item.holidayDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Reason:</span>{" "}
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* --- Action Buttons --- */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-3">
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleAddUserClick}
                >
                  Add User
                </Button>

                <Button
                  variant="primary"
                  size="small"
                  onClick={() => console.log("Update User clicked")}
                >
                  Update User
                </Button>

                {!isRemoveMode ? (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={toggleRemoveMode}
                  >
                    Remove User
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="small"
                    disabled={selectedUsers.length === 0}
                    onClick={handleRemoveSelectedUsers}
                  >
                    {selectedUsers.length > 0
                      ? `Confirm Remove (${selectedUsers.length})`
                      : "Confirm Remove"}
                  </Button>
                )}
              </div>

              {/* --- Add User Section --- */}
              {showAddUserSection && (
                <div className="mt-6 border-t pt-4 transition-all space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Add Holiday Excluded User
                  </h3>

                  {addUserLoading ? (
                    <LoadingSpinner text="Loading user & holiday data..." />
                  ) : (
                    <>
                      {/* User Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select User
                        </label>
                        <select
                          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={selectedAddUser}
                          onChange={(e) => setSelectedAddUser(e.target.value)}
                        >
                          <option value="">-- Select User --</option>
                          {managerUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.id} - {u.fullName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Holiday Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Holiday
                        </label>
                        <select
                          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={selectedHoliday}
                          onChange={(e) => setSelectedHoliday(e.target.value)}
                        >
                          <option value="">-- Select Holiday --</option>
                          {monthlyHolidays.map((h) => (
                            <option key={h.holidayId} value={h.holidayDate}>
                              {h.holidayDate} - {h.holidayDescription}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Reason Textarea */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason
                        </label>
                        <textarea
                          className="w-full border rounded-lg p-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter reason for exclusion..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>

                      {/* Confirm / Cancel Buttons */}
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="primary"
                          size="small"
                          disabled={
                            !selectedAddUser ||
                            !selectedHoliday ||
                            !reason.trim()
                          }
                          onClick={handleConfirmAddUser}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setShowAddUserSection(false);
                            setSelectedAddUser("");
                            setSelectedHoliday("");
                            setReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setIsRemoveMode(false);
                    setSelectedUsers([]);
                    setShowHolidayModal(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerApprovalTable;
