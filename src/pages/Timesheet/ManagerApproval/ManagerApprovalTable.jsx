import React, { useMemo, useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { reviewTimesheet, handleBulkReview } from "../api";
import { TimesheetGroup } from "../TimesheetGroup";
import { showStatusToast } from "../../../components/toastfy/toast";
import Button from "../../../components/Button/Button";
import { MoreVertical } from "lucide-react";

const ManagerApprovalTable = ({
  loading,
  groupedData = [],
  statusFilter = "All",
  onRefresh,
}) => {
  const [rejectionComments, setRejectionComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [projectInfo, setProjectInfo] = useState([]);

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

  const handleRejectClick = (timesheetId) =>
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: true }));

  const handleConfirmReject = (timesheetId) => {
    const comment = rejectionComments[timesheetId] || "";
    handleStatusChange(timesheetId, "Rejected", comment);
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: false }));
  };

  const handleCancelReject = (timesheetId) => {
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: false }));
    setRejectionComments((prev) => ({ ...prev, [timesheetId]: "" }));
  };

  // -----------------------------
  // CSV Export
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

  // -----------------------------
  // PDF Export
  // -----------------------------
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

  // -----------------------------
  // Render Weekly View per User
  // -----------------------------
  const renderUserWeeks = (user) =>
    user.weeklySummary
      .filter(
        (week) =>
          statusFilter === "All" ||
          week.weeklyStatus?.toUpperCase() === statusFilter.toUpperCase()
      )
      .map((week) => (
        <div
          key={week.weekId}
          className="bg-white border rounded-xl shadow-sm mb-6 overflow-hidden"
        >
          {/* Manager actions */}
          {week.weeklyStatus === "SUBMITTED" && (
            <div className="p-4 border-t flex gap-3 justify-end">
              {/* ✅ Approve All Button */}
              <Button
                variant="success"
                size="medium"
                onClick={() => {
                  const timesheetIds = week.timesheets.map(
                    (t) => t.timesheetId
                  );
                  handleBulkReview(
                    user.userId,
                    timesheetIds,
                    "APPROVED",
                    "approved"
                  );
                  onRefresh();
                }}
              >
                Approve All
              </Button>

              {/* ❌ Reject All Button */}

              <Button
                variant="danger"
                size="medium"
                onClick={() => {
                  // Open a single rejection comment box per week
                  const timesheetIds = week.timesheets.map(
                    (t) => t.timesheetId
                  );
                  setShowCommentBox((prev) => ({
                    ...prev,
                    [week.weekId]: true,
                  }));
                  setRejectionComments((prev) => ({
                    ...prev,
                    [week.weekId]: "",
                  }));
                }}
              >
                Reject All
              </Button>
            </div>
          )}
          <TimesheetGroup
            weekGroup={{
              weekStart: week.startDate,
              weekEnd: week.endDate,
              timesheets: week.timesheets,
              weekRange: `${new Date(
                week.startDate
              ).toLocaleDateString()} - ${new Date(
                week.endDate
              ).toLocaleDateString()}`,
              totalHours: week.totalHours,
              status: week.weeklyStatus,
              weekNumber: week.weekId,
              monthName: new Date(week.startDate).toLocaleString("en-US", {
                month: "long",
              }),
              year: new Date(week.startDate).getFullYear(),
            }}
            refreshData={onRefresh}
            mapWorkType={(type) => type}
            projectInfo={projectInfo}
          />

          {showCommentBox[week.weekId] && (
            <div className="p-4 bg-red-50 border-t">
              <textarea
                className="border p-2 w-full rounded"
                rows="2"
                placeholder="Enter rejection reason"
                value={rejectionComments[week.weekId] || ""}
                onChange={(e) =>
                  setRejectionComments((prev) => ({
                    ...prev,
                    [week.weekId]: e.target.value,
                  }))
                }
              />
              <div className="flex gap-2 mt-2 justify-end">
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => {
                    const timesheetIds = week.timesheets.map(
                      (t) => t.timesheetId
                    );
                    const comment = rejectionComments[week.weekId] || "";
                    handleBulkReview(
                      user.userId,
                      timesheetIds,
                      "REJECTED",
                      comment
                    );
                    setShowCommentBox((prev) => ({
                      ...prev,
                      [week.weekId]: false,
                    }));
                    onRefresh();
                  }}
                >
                  Confirm Reject
                </Button>

                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    setShowCommentBox((prev) => ({
                      ...prev,
                      [week.weekId]: false,
                    }))
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Rejection boxes */}
          {/* {week.timesheets.map(
            (t) =>
              showCommentBox[t.timesheetId] && (
                <div key={t.timesheetId} className="p-4 bg-red-50 border-t">
                  <textarea
                    className="border p-2 w-full rounded"
                    rows="2"
                    placeholder="Enter rejection reason"
                    value={rejectionComments[t.timesheetId] || ""}
                    onChange={(e) =>
                      setRejectionComments((prev) => ({
                        ...prev,
                        [t.timesheetId]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleConfirmReject(t.timesheetId)}
                    >
                      Confirm Reject
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleCancelReject(t.timesheetId)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )
          )} */}
        </div>
      ));

  // -----------------------------
  // Render Main
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
            <Button variant="secondary" size="small">
              <MoreVertical  size={10}/>
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
                {renderUserWeeks(user)}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default ManagerApprovalTable;
