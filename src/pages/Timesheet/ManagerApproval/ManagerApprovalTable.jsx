import React, { useEffect, useState, useMemo } from "react";
import { reviewTimesheet } from "../api";
import Pagination from "../../../components/Pagination/pagination";
import Button from "../../../components/Button/Button";

const ManagerApprovalTable = ({ managerId = 3 }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [taskMap, setTaskMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectionComments, setRejectionComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");

  const pageSize = 5;

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/timesheets/manager/${managerId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch timesheets");

      const data = await res.json();
      setTimesheets(data);

      // Preload project/task info
      const uniqueUserIds = [...new Set(data.map((ts) => ts.userId))];
      uniqueUserIds.forEach((uid) => fetchProjectTaskInfo(uid));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectTaskInfo = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/timesheet/project-info/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok)
        throw new Error(`Failed to fetch project info for user ${userId}`);

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
      await reviewTimesheet(managerId, timesheetId, comment, status);
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

  const uniqueUsers = [...new Set(timesheets.map((ts) => ts.userId))];

  return (
    <div className="space-y-6">
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
          {uniqueUsers.map((uid) => (
            <option key={uid} value={uid}>
              {`${uid} - User_${uid}`}
            </option>
          ))}
        </select>
        <Button variant="secondary" size="small" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>

      {/* Timesheet List */}
      {paginatedTimesheets.map((sheet) => {
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
              <span className="font-semibold text-gray-800">
                {formattedDate}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm">
                  {totalHours.toFixed(2)} hrs
                </span>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    sheet.status === "Approved"
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
                      ✔
                    </button>
                    <button
                      onClick={() => handleRejectClick(sheet.timesheetId)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✖
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
                    <td className="px-4 py-2">{`user_${sheet.userId}`}</td>
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
                          onClick={() => handleConfirmReject(sheet.timesheetId)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => handleCancelReject(sheet.timesheetId)}
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
      })}

      {/* Pagination */}
      {totalPages > 1 && (
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
