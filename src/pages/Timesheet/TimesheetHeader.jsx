import React from "react";
// import DayTrackModal from "./DayTrackModal";

const TimesheetHeader = () => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Previous History Track</h1>
        <p className="text-gray-600">Track and manage timesheets, projects, and productivity</p>
      </div>
      {/* <DayTrackModal /> */}
    </div>
  );
};

export default TimesheetHeader;
