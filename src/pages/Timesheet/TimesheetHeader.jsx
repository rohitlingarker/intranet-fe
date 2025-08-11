
//  import DayTrackModal from "./DayTrackModal";

// const TimesheetHeader = () => {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Previous History Track</h1>
//         <p className="text-gray-600">Track and manage timesheets, projects, and productivity</p>
//       </div>
//        <DayTrackModal /> 
//     </div>
//   );
// };

// export default TimesheetHeader;
import React, { useState } from "react";
import DayTrackModal from "./DayTrackModal"; 
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";

const TimesheetHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Previous History Track
        </h1>
        <p className="text-gray-600">
          Track and manage timesheets, projects, and productivity
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant="primary"
          size="medium"
          onClick={() => navigate("/timesheets")}
        >
          My Timesheets
        </Button>
        <Button
          variant="secondary"
          size="medium"
          onClick={() => navigate("/managerapproval")}
        >
          My Approvals
        </Button>
      </div>
    </div>
  );
};

export default TimesheetHeader;

