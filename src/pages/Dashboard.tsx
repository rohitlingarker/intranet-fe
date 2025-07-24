import React, { useState } from 'react';
import {
  Plus, ChevronLeft, ChevronRight, X, Bell, User, Settings,
  Users, FolderKanban, PlaneTakeoff, Clock, Calendar,
  TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';

const defaultEmployee = { id: 'EMP001', name: 'John Doe' }; // Replace with backend data

const previousTimesheets = [
  { id: 1, date: '2025-07-20', project: 'Project Alpha', hours: 8, status: 'Submitted' },
  { id: 2, date: '2025-07-19', project: 'Project Beta', hours: 7, status: 'Approved' },
  { id: 3, date: '2025-07-18', project: 'Project Gamma', hours: 6, status: 'Rejected' },
];

const projects = [
  { id: 1, name: 'Project Alpha', tasks: ['Design', 'Development', 'Testing'] },
  { id: 2, name: 'Project Beta', tasks: ['Planning', 'Implementation'] },
];

const Timesheets = () => {
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [workType, setWorkType] = useState('WFO');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [otherDescription, setOtherDescription] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) return alert('User not authenticated');

    const requestBody = {
      projectId: Number(projectId),
      taskId: Number(taskId),
      description,
      workType,
      fromTime,
      toTime,
      hoursWorked: Number(hoursWorked),
      otherDescription
    };

    try {
      const res = await fetch('https://your-api.com/api/timesheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      console.log('Submitted:', data);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Submission error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="flex justify-between items-center bg-white rounded shadow px-6 py-4 mb-6 w-full max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Welcome back, John</h1>
          <p className="text-gray-500 text-sm">Here's what happened in our org today</p>
        </div>
        <div className="flex space-x-4 text-gray-600 items-center">
          <Bell />
          <User />
          <Settings />
        </div>
      </div>

      <div className="mb-6 w-full flex justify-end max-w-3xl">
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          <Plus className="mr-2" /> Add Entry
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-xl relative">
            <button className="absolute top-3 right-3" onClick={() => setShowModal(false)}>
              <X />
            </button>
            <h2 className="text-lg font-bold text-center text-blue-700 mb-4">Daily Time Sheet</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <input type="text" disabled value={defaultEmployee.id} className="w-1/2 px-3 py-2 bg-gray-100 border rounded" />
                <input type="text" disabled value={defaultEmployee.name} className="w-1/2 px-3 py-2 bg-gray-100 border rounded" />
              </div>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} required className="w-full px-3 py-2 border rounded">
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={taskId} onChange={e => setTaskId(e.target.value)} required className="w-full px-3 py-2 border rounded">
                <option value="">Select Task</option>
                {projectId && projects.find(p => p.id.toString() === projectId)?.tasks.map((t, i) => (
                  <option key={i} value={i + 1}>{t}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <select value={workType} onChange={e => setWorkType(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="WFO">Work from Office</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <div className="flex gap-4">
                <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} required className="w-1/2 px-3 py-2 border rounded" />
                <input type="time" value={toTime} onChange={e => setToTime(e.target.value)} required className="w-1/2 px-3 py-2 border rounded" />
              </div>
              <input
                type="number"
                placeholder="Hours Worked"
                value={hoursWorked}
                onChange={e => setHoursWorked(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <textarea
                placeholder="Other Description"
                value={otherDescription}
                onChange={e => setOtherDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow p-4 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">Previous Timesheet Entries</h2>
        <table className="w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Project</th>
              <th className="py-2 px-4 border">Hours</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {previousTimesheets.map(entry => (
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
