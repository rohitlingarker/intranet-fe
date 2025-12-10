import React from "react";
import EditSprintForm from "./EditSprintForm";

const SprintDetailsPanel = ({ sprintId, projectId, onClose, onUpdated }) => {
  if (!sprintId) return null;

  return (
    <div className="p-6 overflow-y-auto h-full bg-white">
      <h2 className="text-xl font-semibold mb-4">Edit Sprint</h2>

      <EditSprintForm
        sprintId={sprintId}
        projectId={projectId}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default SprintDetailsPanel;
