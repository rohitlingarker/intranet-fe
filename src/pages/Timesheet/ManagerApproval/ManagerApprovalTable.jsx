import React, { useEffect, useState } from "react";
import { fetchProjectTaskInfo, reviewTimesheet } from "../api";
import Pagination from "../../../components/Pagination/pagination";

const ManagerApprovalTable = ({ managerId }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectionComments, setRejectionComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const pageSize = 5;

  useEffect(() => {
    fetchTimesheets();
    loadProjectNames();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/timesheets/manager/3`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      const data = await res.json();
      setTimesheets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjectNames = async () => {
    try {
      const data = await fetchProjectTaskInfo();
      const map = {};
      data.forEach((project) => {
        map[project.projectId] = project.projectName;
      });
      setProjectMap(map);
    } catch (err) {
      console.error("Failed to load project names");
    }
  };

  const sortedTimesheets = [...timesheets].sort(
    (a, b) => new Date(b.workDate) - new Date(a.workDate)
  );

  const totalPages = Math.ceil(sortedTimesheets.length / pageSize);
  const paginatedTimesheets = sortedTimesheets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleStatusChange = async (timesheetId, status, comment = "Approved") => {
    try {
      await reviewTimesheet(3,  timesheetId, comment, status);
      fetchTimesheets();
    } catch (err) {
      console.error(`Error updating timesheet status: ${err.message}`);
    }
  };

  const handleRejectClick = (timesheetId) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [timesheetId]: true,
    }));
  };

  const handleCancelReject = (timesheetId) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [timesheetId]: false,
    }));
    setRejectionComments((prev) => ({
      ...prev,
      [timesheetId]: "",
    }));
  };

  const handleConfirmReject = (timesheetId) => {
    const comment = rejectionComments[timesheetId] || "";
    handleStatusChange(timesheetId, "Rejected", comment);
    setShowCommentBox((prev) => ({
      ...prev,
      [timesheetId]: false,
    }));
  };

  return (
    <div className="space-y-6">
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
              <div className="font-semibold text-gray-800">{formattedDate}</div>

              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium text-sm">
                  {totalHours.toFixed(2)} hrs
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
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
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() =>
                        handleStatusChange(sheet.timesheetId, "Approved")
                      }
                      className="text-green-600 hover:text-green-800 text-lg font-bold"
                      title="Approve"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() => handleRejectClick(sheet.timesheetId)}
                      className="text-red-600 hover:text-red-800 text-lg font-bold"
                      title="Reject"
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
                    <td className="px-4 py-2">
                      {projectMap[entry.projectId] ||
                        `Project-${entry.projectId}`}
                    </td>
                    <td className="px-4 py-2">{entry.taskId || "N/A"}</td>
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
                    <td colSpan="7" className="p-4 bg-red-50">
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

export default ManagerApprovalTable;
