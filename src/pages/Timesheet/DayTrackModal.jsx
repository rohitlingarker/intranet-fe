import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DayTrackModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [workDate, setWorkDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
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

  const getSelectedProjects = () =>
    projectEntries.map((entry) => entry.project);

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
      alert(
        "Please fill out all fields of the last project before adding a new one."
      );
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

  const calculateHoursWorked = (start, end) => {
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const diffInMs = endTime - startTime;
    return diffInMs > 0 ? diffInMs / (1000 * 60 * 60) : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = [];

    projectEntries.forEach((entry) => {
      entry.tasks.forEach((task) => {
        payload.push({
          projectId: parseInt(entry.project),
          taskId: parseInt(task.task),
          description: task.description,
          workType,
          fromTime: `${workDate}T${task.startTime}:00`,
          toTime: `${workDate}T${task.endTime}:00`,
          hoursWorked: calculateHoursWorked(task.startTime, task.endTime),
          otherDescription: otherChecked ? otherText : "Nothing",
        });
      });
    });

    try {
      const response = await fetch(
        "http://localhost:8080/api/timesheet/create?workDate=" + workDate,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit timesheet");
      }

      console.log("Submitted:", payload);
      navigate("/timesheets");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to submit timesheet.");
    }
  };

  if (!isOpen) return null;

  const allProjects = [
    { id: 1, name: "Project A" },
    { id: 2, name: "Project B" },
    { id: 3, name: "Project C" },
  ];

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

          <div>
            <label className="font-medium">Work Date</label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
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
                    {allProjects
                      .filter(
                        (p) =>
                          !selectedProjects.includes(p.id.toString()) ||
                          p.id.toString() === entry.project
                      )
                      .map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
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
                          handleTaskChange(
                            index,
                            taskIndex,
                            "task",
                            e.target.value
                          )
                        }
                        className="w-full border px-2 py-1 rounded"
                        disabled={!entry.project}
                      >
                        <option value="">-- Select Task --</option>
                        <option value="1">Design</option>
                        <option value="2">Development</option>
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
                        handleTaskChange(
                          index,
                          taskIndex,
                          "description",
                          e.target.value
                        )
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
                          handleTaskChange(
                            index,
                            taskIndex,
                            "startTime",
                            e.target.value
                          )
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
                          handleTaskChange(
                            index,
                            taskIndex,
                            "endTime",
                            e.target.value
                          )
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
