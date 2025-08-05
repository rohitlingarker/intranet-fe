

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DayTrackModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [workType, setWorkType] = useState("");
  const [otherChecked, setOtherChecked] = useState(false);

  const employee = {
    id: "EMP001",
    name: "Ajay Kumar",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      employeeId: employee.id,
      employeeName: employee.name,
      project,
      task,
      description,
      startTime,
      endTime,
      workType,
      otherChecked,
    };

    console.log("Submitted data:", formData);
    navigate("/timesheets");
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 max-w-4xl w-full rounded shadow-lg overflow-y-auto max-h-screen relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold text-center mb-6">DAILY TIME SHEET ⏳</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Employee ID</label>
              <input
                type="text"
                value={employee.id}
                readOnly
                className="w-full border px-2 py-1 rounded bg-gray-100"
              />
            </div>
            <div>
              <label>Employee Name</label>
              <input
                type="text"
                value={employee.name}
                readOnly
                className="w-full border px-2 py-1 rounded bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label>Project</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="">-- Select Project --</option>
                <option value="Project A">Project A</option>
                <option value="Project B">Project B</option>
              </select>
            </div>
            <button type="button" className="bg-blue-700 text-white px-4 py-1 rounded h-[38px]">+ Project</button>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label>Task</label>
              <select
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="">-- Select Task --</option>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
              </select>
            </div>
            <button type="button" className="bg-green-600 text-white px-4 py-1 rounded h-[38px]">+ Task</button>
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={otherChecked}
                onChange={(e) => setOtherChecked(e.target.checked)}
                className="mr-2"
              />
              Other
            </label>
          </div>

          <div>
            <label>Work Type</label>
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

          <div className="flex justify-end space-x-4">
            <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded"
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

