//MAT
import React, { useEffect, useState, useMemo } from "react";
import { bulkReviewTimesheet, reviewTimesheet } from "../api";
import Pagination from "../../../components/Pagination/pagination";
import Button from "../../../components/Button/Button";
import { Check, X, Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

const ManagerApprovalTable = ({ statusFilter, setStatusFilter, ref }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [taskMap, setTaskMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectionComments, setRejectionComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  // const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const [bulkMode, setBulkMode] = useState(""); // "", "approve", "reject"
  const [bulkComment, setBulkComment] = useState("");
  const [loading, setLoading] = useState(true);

  const pageSize = 5;

  useEffect(() => {
    // setLoading(true);
    fetchTimesheets();
    // setLoading(false);
  }, []);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/timesheets/manager`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) {
        setLoading(false);
        throw new Error("Failed to fetch timesheets");
      }

      const data = await res.json();
      setTimesheets(data);
      console.log(loading);

      setLoading(false);

      const uniqueUserIds = [...new Set(data.map((ts) => ts.userId))];
      uniqueUserIds.forEach((uid) => fetchProjectTaskInfo(uid));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectTaskInfo = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_TIMESHEET_API_ENDPOINT
        }/api/timesheet/project-info/all`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error(`Failed to fetch project info for user`);

      const data = await res.json();
      const newProjects = {};
      const newTasks = {};

      data.forEach((proj) => {
        newProjects[proj.projectId] = proj.project;
        proj.tasks.forEach((task) => {
          newTasks[task.taskId] = task.task;
        });
      });

      setProjectMap((prev) => ({ ...prev, ...newProjects }));
      setTaskMap((prev) => ({ ...prev, ...newTasks }));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTimesheets = useMemo(() => {
    return [...timesheets]
      .sort((a, b) => new Date(b.workDate) - new Date(a.workDate))
      .filter((sheet) => {
        const projectNames = sheet.entries
          .map((e) => projectMap[e.projectId] || "")
          .join(" ")
          .toLowerCase();
        const taskNames = sheet.entries
          .map((e) => taskMap[e.taskId] || "")
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchTerm ||
          sheet.userId.toString().includes(searchTerm.toLowerCase()) ||
          `user_${sheet.userId}`.includes(searchTerm.toLowerCase()) ||
          projectNames.includes(searchTerm.toLowerCase()) ||
          taskNames.includes(searchTerm.toLowerCase());

        const matchesDate =
          !selectedDate ||
          new Date(sheet.workDate).toISOString().split("T")[0] === selectedDate;

        const matchesStatus =
          statusFilter === "All" || sheet.status === statusFilter;

        const matchesUser =
          selectedUser === "All" || sheet.userId.toString() === selectedUser;

        return matchesSearch && matchesDate && matchesStatus && matchesUser;
      });
  }, [
    timesheets,
    projectMap,
    taskMap,
    searchTerm,
    selectedDate,
    statusFilter,
    selectedUser,
  ]);

  const totalPages = Math.ceil(filteredTimesheets.length / pageSize);
  const paginatedTimesheets = filteredTimesheets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleStatusChange = async (
    timesheetId,
    status,
    comment = "Approved"
  ) => {
    try {
      await reviewTimesheet(timesheetId, comment, status);
      fetchTimesheets();
    } catch (err) {
      console.error(`Error updating timesheet status: ${err.message}`);
    }
  };

  const handleBulkStatusChange = async (status) => {
    try {
      if (status === "Rejected" && !bulkComment.trim()) {
        alert("Rejection comment is required");
        return;
      }
      await bulkReviewTimesheet(selectedTimesheets, status, bulkComment);
      setSelectedTimesheets([]);
      setBulkComment("");
      fetchTimesheets();
    } catch (err) {
      console.error(`Error updating timesheet status: ${err.message}`);
    }
  };

  const handleRejectClick = (timesheetId) =>
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: true }));

  const handleCancelReject = (timesheetId) => {
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: false }));
    setRejectionComments((prev) => ({ ...prev, [timesheetId]: "" }));
  };

  const handleConfirmReject = (timesheetId) => {
    handleStatusChange(
      timesheetId,
      "Rejected",
      rejectionComments[timesheetId] || ""
    );
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: false }));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setStatusFilter("All");
    setSelectedUser("All");
    setCurrentPage(1);
  };

  const uniqueUsers = [
    ...new Map(
      timesheets.map((ts) => [
        ts.userId,
        { userId: ts.userId, userName: ts.userName },
      ])
    ).values(),
  ];

  console.log("uniqueUsers", uniqueUsers);

  // CSV Export
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
    filteredTimesheets.forEach((sheet) => {
      sheet.entries.forEach((entry) => {
        rows.push([
          sheet.userId,
          `user_${sheet.userId}`,
          projectMap[entry.projectId] || `Project-${entry.projectId}`,
          taskMap[entry.taskId] || `Task-${entry.taskId}`,
          new Date(entry.fromTime).toLocaleTimeString(),
          new Date(entry.toTime).toLocaleTimeString(),
          entry.workType,
          entry.description,
          (entry.hoursWorked ?? 0).toFixed(2),
          new Date(sheet.workDate).toLocaleDateString(),
          sheet.status,
        ]);
      });
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((v) => `"${v}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "timesheets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Timesheet Report", 14, 10);
    const tableData = [];
    filteredTimesheets.forEach((sheet) => {
      sheet.entries.forEach((entry) => {
        tableData.push([
          sheet.userId,
          `user_${sheet.userId}`,
          projectMap[entry.projectId] || `Project-${entry.projectId}`,
          taskMap[entry.taskId] || `Task-${entry.taskId}`,
          new Date(entry.fromTime).toLocaleTimeString(),
          new Date(entry.toTime).toLocaleTimeString(),
          entry.workType,
          entry.description,
          (entry.hoursWorked ?? 0).toFixed(2),
          new Date(sheet.workDate).toLocaleDateString(),
          sheet.status,
        ]);
      });
    });

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
      body: tableData,
      startY: 20,
    });

    doc.save("timesheets.pdf");
  };

  return (
    <div className="space-y-6" ref={ref}>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded p-2 flex-1 bg-gray-50"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded p-2 bg-gray-50"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded p-2 bg-gray-50"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Pending">Pending</option>
        </select>
        <select
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded p-2 bg-gray-50"
        >
          <option value="All">All Users</option>
          {uniqueUsers.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.userName}
            </option>
          ))}
        </select>
        <Button variant="danger" size="small" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <label className="cursor-pointer">
            <input
              type="checkbox"
              checked={
                selectedTimesheets.length > 0 &&
                selectedTimesheets.length === filteredTimesheets.length
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTimesheets(
                    filteredTimesheets.map((s) => s.timesheetId)
                  );
                } else {
                  setSelectedTimesheets([]);
                }
              }}
            />
            &nbsp; Select All
          </label>
        </div>
        {selectedTimesheets.length > 0 && (
          <div className="flex flex-col gap-2 rounded bg-gray-50">
            {/* Default Mode: Show Approve/Reject */}
            {bulkMode === "" && (
              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="small"
                  onClick={() => handleBulkStatusChange("Approved")}
                >
                  Approve Selected
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => setBulkMode("reject")}
                >
                  Reject Selected
                </Button>
              </div>
            )}

            {/* Reject Mode: Show input + confirm/cancel */}
            {bulkMode === "reject" && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bulkComment}
                  onChange={(e) => setBulkComment(e.target.value)}
                  placeholder="Enter rejection comment..."
                  className="border rounded p-2 flex-1"
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleBulkStatusChange("Rejected")}
                    disabled={!bulkComment.trim()}
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setBulkMode("");
                      setBulkComment("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="success"
            size="small"
            onClick={exportCSV}
            className="flex items-center gap-1"
          >
            <Download size={16} />
            CSV
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={exportPDF}
            className="flex items-center gap-1"
          >
            <Download size={16} />
            PDF
          </Button>
        </div>
      </div>

      {/* Timesheet List */}
      {loading ? (
        <div className="text-center text-gray-600">
          Loading TimeSheet Approvals...
        </div>
      ) : paginatedTimesheets.length === 0 ? (
        <div className="text-center text-gray-600">No timesheets found.</div>
      ) : (
        paginatedTimesheets.map((sheet) => {
          const totalHours = sheet.entries.reduce(
            (sum, e) => sum + (e.hoursWorked || 0),
            0
          );
          const formattedDate = new Date(sheet.workDate).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "numeric",
            }
          );

          return (
            <div
              key={sheet.timesheetId}
              className="rounded-lg border bg-white shadow-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
                <div>
                  <input
                    type="checkbox"
                    checked={selectedTimesheets.includes(sheet.timesheetId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTimesheets((prev) => [
                          ...prev,
                          sheet.timesheetId,
                        ]);
                      } else {
                        setSelectedTimesheets((prev) =>
                          prev.filter((id) => id !== sheet.timesheetId)
                        );
                      }
                    }}
                  />

                  <span className="font-semibold text-gray-800 ml-3">
                    {formattedDate}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">
                    Total Hours: {totalHours.toFixed(2)}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      sheet.status === "Approved" ||
                      sheet.status === "Partially Approved"
                        ? "bg-green-100 text-green-800"
                        : sheet.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {sheet.status}
                  </span>
                  {sheet.status === "Pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(sheet.timesheetId, "Approved")
                        }
                        className="text-green-600 hover:text-green-800 font-bold"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleRejectClick(sheet.timesheetId)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <table className="min-w-full text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">User ID</th>
                    <th className="px-4 py-2 text-left">User Name</th>
                    <th className="px-4 py-2 text-left">Project</th>
                    <th className="px-4 py-2 text-left">Task</th>
                    <th className="px-4 py-2 text-left">Start</th>
                    <th className="px-4 py-2 text-left">End</th>
                    <th className="px-4 py-2 text-left">Work Type</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.entries.map((entry) => (
                    <tr key={entry.timesheetEntryId} className="border-t">
                      <td className="px-4 py-2">{sheet.userId}</td>
                      <td className="px-4 py-2">{sheet.userName}</td>
                      <td className="px-4 py-2">
                        {projectMap[entry.projectId] ||
                          `Project-${entry.projectId}`}
                      </td>
                      <td className="px-4 py-2">
                        {taskMap[entry.taskId] || `Task-${entry.taskId}`}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(entry.fromTime).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(entry.toTime).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2">{entry.workType}</td>
                      <td className="px-4 py-2">{entry.description}</td>
                      <td className="px-4 py-2">
                        {(entry.hoursWorked ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {showCommentBox[sheet.timesheetId] && (
                    <tr>
                      <td colSpan="9" className="p-4 bg-red-50">
                        <textarea
                          value={rejectionComments[sheet.timesheetId] || ""}
                          onChange={(e) =>
                            setRejectionComments((prev) => ({
                              ...prev,
                              [sheet.timesheetId]: e.target.value,
                            }))
                          }
                          placeholder="Enter rejection comment..."
                          className="w-full border rounded p-2 mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleConfirmReject(sheet.timesheetId)
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() =>
                              handleCancelReject(sheet.timesheetId)
                            }
                            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />
      )}
    </div>
  );
};

export default ManagerApprovalTable;
