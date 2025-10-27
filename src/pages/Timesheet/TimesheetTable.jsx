import React from "react";
import Pagination from "../../components/Pagination/pagination";
import { TimesheetGroup } from "./TimesheetGroup";
import NewTimesheetModal from "./NewTimesheetModal";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useState } from "react";

const TimesheetTable = ({
  loading,
  data,
  totalPages,
  currentPage,
  setCurrentPage,
  mapWorkType,
  refreshData, // Callback to refresh data after save
  projectInfo,
  getWeeklyStatusColor,
}) => {
  const [addingNewTimesheet, setAddingNewTimesheet] = useState(false);
  const [showNewTimesheetModal, setShowNewTimesheetModal] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        margin: "32px 0",
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <Button
        size="small"
        variant="primary"
        className="mb-4"
        onClick={() => setShowNewTimesheetModal(true)}
      >
        + New Timesheet
      </Button>

      <NewTimesheetModal
        isOpen={showNewTimesheetModal}
        onClose={() => setShowNewTimesheetModal(false)}
        refreshData={refreshData}
        onSuccess={() => {
          setShowNewTimesheetModal(false);
          refreshData();
        }}
      />
      {loading ? (
        <LoadingSpinner text="Loading timesheet entries..." />
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500">
          No timesheet entries found.
        </div>
      ) : (
        <>
          {data.map((weekGroup) => (
            <TimesheetGroup
              weekGroup={weekGroup}
              key={weekGroup.weekStart}
              mapWorkType={mapWorkType}
              refreshData={refreshData}
              projectInfo={projectInfo}
              approvers={weekGroup.actionStatus}
              getWeeklyStatusColor={getWeeklyStatusColor}
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          />
        </>
      )}
    </div>
  );
};

export { TimesheetTable };
