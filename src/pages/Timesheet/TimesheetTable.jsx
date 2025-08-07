import React from "react";
import Pagination from "../../components/Pagination/pagination";
import TimesheetGroup from "./TimesheetGroup";

const TimesheetTable = ({
  loading,
  data,
  totalPages,
  currentPage,
  setCurrentPage,
  projectIdToName,
  taskIdToName,
  mapWorkType,
}) => {
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
          {data.map((row) => (
            <TimesheetGroup
              timesheetId={row.timesheetId}
              key={row.timesheetId}
              workDate={row.workDate}
              entries={row.entries}
              status={row.status}
              projectIdToName={projectIdToName}
              taskIdToName={taskIdToName}
              mapWorkType={mapWorkType}
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
