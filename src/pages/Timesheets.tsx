import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Bell, User, Settings } from 'lucide-react';

// Top Navigation Bar as a component
function TopNavBar() {
  return (
    <div className="flex justify-between items-center bg-white rounded shadow px-6 py-4 mb-6 w-full max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Welcome back, John</h1>
        <p className="text-gray-500 text-sm">Here's what happened in our org today</p>
      </div>
      <div className="flex space-x-4 text-gray-600 items-center">
        <button className="hover:text-blue-600" title="Notifications">
          <Bell />
        </button>
        <button className="hover:text-blue-600" title="Profile">
          <User />
        </button>
        <button className="hover:text-blue-600" title="Settings">
          <Settings />
        </button>
      </div>
    </div>
  );
}

// Sample previous timesheet entries
const previousTimesheets = [
  { id: 1, date: '2025-07-20', project: 'Project Alpha', hours: 8, status: 'Submitted' },
  { id: 2, date: '2025-07-19', project: 'Project Beta', hours: 7, status: 'Approved' },
  { id: 3, date: '2025-07-18', project: 'Project Gamma', hours: 6, status: 'Rejected' },
  { id: 4, date: '2025-07-17', project: 'Project Delta', hours: 8, status: 'Submitted' },
  { id: 5, date: '2025-07-16', project: 'Project Epsilon', hours: 7, status: 'Approved' },
];

// Sample data for projects and tasks (replace with backend data)
const projects = [
  { id: 1, name: 'Project Alpha', tasks: ['Design', 'Development', 'Testing'] },
  { id: 2, name: 'Project Beta', tasks: ['Planning', 'Implementation'] },
];

const defaultEmployee = { id: 'EMP001', name: 'John Doe' }; // Replace with backend data

const Timesheets = () => {
  const [showForm, setShowForm] = useState(false);
  const [projectForms, setProjectForms] = useState([
    {
      projectId: '',
      workType: '',
      tasks: [
        { taskName: '', description: '' }
      ]
    }
  ]);

  // Handle project change
  const handleProjectChange = (idx: number, value: string) => {
    const updated = [...projectForms];
    updated[idx].projectId = value;
    updated[idx].tasks = [{ taskName: '', description: '' }]; // Reset tasks on project change
    setProjectForms(updated);
  };

  // Handle work type change
  const handleWorkTypeChange = (idx: number, value: string) => {
    const updated = [...projectForms];
    updated[idx].workType = value;
    setProjectForms(updated);
  };

  // Handle task change
  const handleTaskChange = (pIdx: number, tIdx: number, value: string) => {
    const updated = [...projectForms];
    updated[pIdx].tasks[tIdx].taskName = value;
    setProjectForms(updated);
  };

  // Handle description change
  const handleDescriptionChange = (pIdx: number, tIdx: number, value: string) => {
    const updated = [...projectForms];
    updated[pIdx].tasks[tIdx].description = value;
    setProjectForms(updated);
  };

  // Add another task to a project
  const handleAddTask = (pIdx: number) => {
    const updated = [...projectForms];
    updated[pIdx].tasks.push({ taskName: '', description: '' });
    setProjectForms(updated);
  };

  // Add another project section
  const handleAddProject = () => {
    setProjectForms([
      ...projectForms,
      {
        projectId: '',
        workType: '',
        tasks: [{ taskName: '', description: '' }]
      }
    ]);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here (send projectForms to backend)
    setShowForm(false);
    setProjectForms([
      {
        projectId: '',
        workType: '',
        tasks: [{ taskName: '', description: '' }]
      }
    ]);
    alert('Timesheet submitted!');
  };

  // Get today's date in yyyy-mm-dd format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      {/* Top Navigation Bar */}
      <TopNavBar />

      {/* Add Entity Button */}
      <div className="mb-6 w-full flex justify-end max-w-3xl">
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          <Plus className="mr-2" /> Add Entity
        </button>
      </div>

      {/* Modal for Add Timesheet Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className="bg-white rounded shadow-lg p-6 w-full max-w-3xl relative"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Modal Title and Date */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 flex justify-center">
                <span className="text-2xl font-bold text-blue-700">DayTrack Hub</span>
              </div>
              <input
                type="date"
                value={todayStr}
                min={todayStr}
                max={todayStr}
                className="border rounded px-2 py-1"
                readOnly
              />
            </div>
            <div className="absolute top-2 right-2">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={defaultEmployee.id}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={defaultEmployee.name}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
              </div>
              {projectForms.map((project, pIdx) => (
                <div key={pIdx} className="mb-6 border-b pb-4">
                  <div className="mb-2 flex gap-2">
                    <div className="flex-1">
                      <label className="block font-medium mb-1">Project Name</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={project.projectId}
                        onChange={e => handleProjectChange(pIdx, e.target.value)}
                        required
                      >
                        <option value="">Select Project</option>
                        {projects.map(proj => (
                          <option key={proj.id} value={proj.id}>{proj.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {project.projectId && (
                    <>
                      {project.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="mb-2">
                          <div className="flex gap-2">
                            <select
                              className="border rounded px-3 py-2 flex-1"
                              value={task.taskName}
                              onChange={e => handleTaskChange(pIdx, tIdx, e.target.value)}
                              required
                            >
                              <option value="">Select Task</option>
                              {projects
                                .find(proj => proj.id.toString() === project.projectId)
                                ?.tasks.map((taskName, idx) => (
                                  <option key={idx} value={taskName}>{taskName}</option>
                                ))}
                            </select>
                            {tIdx === project.tasks.length - 1 && (
                              <button
                                type="button"
                                className={`px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${!task.taskName ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleAddTask(pIdx)}
                                disabled={!task.taskName}
                              >
                                + Task
                              </button>
                            )}
                          </div>
                          <textarea
                            placeholder="Description"
                            className="border rounded px-3 py-2 mt-2 w-full"
                            value={task.description}
                            onChange={e => handleDescriptionChange(pIdx, tIdx, e.target.value)}
                            required
                            rows={2}
                          />
                          {/* Start and End Time Inputs */}
                          <div className="flex gap-4 mt-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium mb-1">Start Time</label>
                              <input
                                type="time"
                                className="w-full border rounded px-3 py-2"
                                // value={task.startTime || ''}
                                // onChange={e => handleStartTimeChange(pIdx, tIdx, e.target.value)}
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium mb-1">End Time</label>
                              <input
                                type="time"
                                className="w-full border rounded px-3 py-2"
                                // value={task.endTime || ''}
                                // onChange={e => handleEndTimeChange(pIdx, tIdx, e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mb-2">
                        <label className="block font-medium mb-1">Work Type</label>
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={project.workType}
                          onChange={e => handleWorkTypeChange(pIdx, e.target.value)}
                          required
                        >
                          <option value="">Select Work Type</option>
                          <option value="work from office">Work from Office</option>
                          <option value="remote">Remote</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                      {pIdx === projectForms.length - 1 && (
                        <button
                          type="button"
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
                          onClick={handleAddProject}
                        >
                          + Project
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Previous Timesheet Entries Table */}
      <div className="bg-white rounded shadow p-4 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">Previous Timesheet Entries</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Project</th>
                <th className="py-2 px-4 border">Hours</th>
                <th className="py-2 px-4 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {previousTimesheets.map((entry) => (
                <tr key={entry.id} className="text-center">
                  <td className="py-2 px-4 border">{entry.date}</td>
                  <td className="py-2 px-4 border">{entry.project}</td>
                  <td className="py-2 px-4 border">{entry.hours}</td>
                  <td className="py-2 px-4 border">{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-6">
        <button className="p-2 rounded-full hover:bg-gray-200">
          <ChevronLeft size={28} />
        </button>
        <span className="font-medium">Page 1 of 1</span>
        <button className="p-2 rounded-full hover:bg-gray-200">
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
};

export default Timesheets;