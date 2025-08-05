

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DayTrackModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [workType, setWorkType] = useState("");
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState("");

  const [projectEntries, setProjectEntries] = useState([
    {
      project: "",
      tasks: [
        {
          task: "",
          description: "",
          startTime: "",
          endTime: "",
        },
      ],
    },
  ]);

  const employee = {
    id: "EMP001",
    name: "Ajay Kumar",
  };

  const getSelectedProjects = () => projectEntries.map((entry) => entry.project);

  const handleProjectChange = (index, value) => {
    const updatedEntries = [...projectEntries];
    updatedEntries[index].project = value;
    setProjectEntries(updatedEntries);
  };

  const handleTaskChange = (projectIndex, taskIndex, field, value) => {
    const updatedEntries = [...projectEntries];
    updatedEntries[projectIndex].tasks[taskIndex][field] = value;
    setProjectEntries(updatedEntries);
  };

  const addProjectEntry = () => {
    const lastProject = projectEntries[projectEntries.length - 1];
    const lastTask = lastProject.tasks[lastProject.tasks.length - 1];

    if (
      lastProject.project &&
      lastTask.task &&
      lastTask.description &&
      lastTask.startTime &&
      lastTask.endTime
    ) {
      setProjectEntries([
        ...projectEntries,
        {
          project: "",
          tasks: [
            {
              task: "",
              description: "",
              startTime: "",
              endTime: "",
            },
          ],
        },
      ]);
    } else {
      alert("Please fill out all fields of the last project before adding a new one.");
    }
  };

  const addTaskEntry = (projectIndex) => {
    const entry = projectEntries[projectIndex];
    const lastTask = entry.tasks[entry.tasks.length - 1];
    if (
      lastTask.task &&
      lastTask.description &&
      lastTask.startTime &&
      lastTask.endTime
    ) {
      const updatedEntries = [...projectEntries];
      updatedEntries[projectIndex].tasks.push({
        task: "",
        description: "",
        startTime: "",
        endTime: "",
      });
      setProjectEntries(updatedEntries);
    } else {
      alert("Please fill out all fields before adding a new task.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      employeeId: employee.id,
      employeeName: employee.name,
      workType,
      otherChecked,
      otherText,
      projectEntries,
    };

    console.log("Submitted data:", formData);
    navigate("/timesheets");
    onClose();
  };

  if (!isOpen) return null;

  const allProjects = ["Project A", "Project B", "Project C"];
  const selectedProjects = getSelectedProjects();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 max-w-4xl w-full rounded shadow-lg overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-center mb-2 text-indigo-800">
          DAILY TIME SHEET ⏳
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-medium">Employee ID</label>
              <input
                type="text"
                value={employee.id}
                readOnly
                className="w-full border px-2 py-1 rounded bg-gray-100 text-sm"
              />
            </div>
            <div>
              <label className="font-medium">Employee Name</label>
              <input
                type="text"
                value={employee.name}
                readOnly
                className="w-full border px-2 py-1 rounded bg-gray-100 text-sm"
              />
            </div>
          </div>

          {projectEntries.map((entry, index) => (
            <div key={index} className="border p-3 rounded mb-3 bg-gray-50">
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-9">
                  <label className="font-medium">Project</label>
                  <select
                    value={entry.project}
                    onChange={(e) => handleProjectChange(index, e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  >
                    <option value="">-- Select Project --</option>
                    {allProjects.filter(p => !selectedProjects.includes(p) || p === entry.project).map((project) => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <button
                    type="button"
                    onClick={addProjectEntry}
                    className="bg-blue-800 text-white px-2 py-1 rounded w-full text-sm"
                  >
                    + Project
                  </button>
                </div>
              </div>

              {entry.tasks.map((taskEntry, taskIndex) => (
                <div key={taskIndex} className="mt-3">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-9">
                      <label className="font-medium">Task</label>
                      <select
                        value={taskEntry.task}
                        onChange={(e) =>
                          handleTaskChange(index, taskIndex, "task", e.target.value)
                        }
                        className="w-full border px-2 py-1 rounded"
                        disabled={!entry.project}
                      >
                        <option value="">-- Select Task --</option>
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <button
                        type="button"
                        className="bg-green-600 text-white px-2 py-1 rounded w-full text-sm"
                        onClick={() => addTaskEntry(index)}
                      >
                        + Task
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="font-medium">Description</label>
                    <textarea
                      value={taskEntry.description}
                      onChange={(e) =>
                        handleTaskChange(index, taskIndex, "description", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-2">
                    <div>
                      <label className="font-medium">Start Time</label>
                      <input
                        type="time"
                        value={taskEntry.startTime}
                        onChange={(e) =>
                          handleTaskChange(index, taskIndex, "startTime", e.target.value)
                        }
                        className="w-full border px-2 py-1 rounded"
                      />
                    </div>
                    <div>
                      <label className="font-medium">End Time</label>
                      <input
                        type="time"
                        value={taskEntry.endTime}
                        onChange={(e) =>
                          handleTaskChange(index, taskIndex, "endTime", e.target.value)
                        }
                        className="w-full border px-2 py-1 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div>
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={otherChecked}
                onChange={(e) => setOtherChecked(e.target.checked)}
              />
              <span>Other</span>
            </label>
          </div>

          {otherChecked && (
            <div className="mt-1">
              <label className="font-medium">Other Reason</label>
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="w-full border px-2 py-1 rounded"
                placeholder="Please describe..."
                rows={2}
              />
            </div>
          )}

          <div>
            <label className="font-medium">Work Type</label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Select Work Type</option>
              <option value="Office">Office</option>
              <option value="Home">Home</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="submit"
              className="bg-blue-800 text-white px-4 py-1 rounded"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DayTrackModal;
