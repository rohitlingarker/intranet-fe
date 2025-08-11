import React from "react";
import Pagination from "../../components/Pagination/pagination";
import TimesheetGroup from "./TimesheetGroup";
import Button from "../../components/Button/Button";
import { useState } from "react";

const TimesheetTable = ({
  loading,
  data,
  totalPages,
  currentPage,
  setCurrentPage,
  mapWorkType,
  refreshData, // Callback to refresh data after save
}) => {
  const [addingNewTimesheet, setAddingNewTimesheet] = useState(false);

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
      {loading ? (
        <div className="text-center text-gray-500">
          Loading timesheet entries...
        </div>
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500">
          No timesheet entries found.
        </div>
      ) : (
        <>
          <Button
            size="small"
            variant="primary"
            className="mb-4"
            onClick={() => setAddingNewTimesheet(!addingNewTimesheet)}
          >
            + New Timesheet
          </Button>

          {addingNewTimesheet && (
            <TimesheetGroup
            emptyTimesheet={true}
              workDate={new Date("02-12-2025").toISOString().split("T")[0]}
              entries={[]}
              status="Pending"
              mapWorkType={mapWorkType}
              refreshData={refreshData}
              addingNewTimesheet={addingNewTimesheet}
              setAddingNewTimesheet={setAddingNewTimesheet}
            />
          )}
          {data.map((row) => (
            <TimesheetGroup
              timesheetId={row.timesheetId}
              key={row.timesheetId}
              workDate={row.workDate}
              entries={row.entries}
              status={row.status}
              mapWorkType={mapWorkType}
              refreshData={refreshData}
              addingNewTimesheet={addingNewTimesheet}
              setAddingNewTimesheet={setAddingNewTimesheet}
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

export default TimesheetTable;
