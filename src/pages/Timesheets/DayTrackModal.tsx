
{/*// --------- DayTrackModal.tsx ---------
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Types
interface TaskEntry {
  taskName: string;
  description: string;
  showOtherDescription?: boolean;
  otherDescription?: string;
}

interface ProjectTaskEntry {
  projectId: number;
  tasks: TaskEntry[];
  startTime: string;
  endTime: string;
  workType: string;
}

interface Project {
  id: number;
  name: string;
  tasks: string[];
}

const DayTrackModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [entries, setEntries] = useState<ProjectTaskEntry[]>([{
    projectId: 0,
    tasks: [{ taskName: '', description: '' }],
    startTime: '',
    endTime: '',
    workType: '',
  }]);

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/projects-with-tasks');
        if (response.status === 200) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects with tasks:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleAddEntry = () => {
    setEntries([...entries, {
      projectId: 0,
      tasks: [{ taskName: '', description: '' }],
      startTime: '',
      endTime: '',
      workType: '',
    }]);
  };

  const handleChange = (index: number, field: keyof ProjectTaskEntry, value: any) => {
    const updated = [...entries];
    updated[index][field] = value;
    if (field === 'projectId') {
      updated[index].tasks = [{ taskName: '', description: '' }];
    }
    setEntries(updated);
  };

  const getTasksForProject = (projectId: number): string[] => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.tasks : [];
  };

  const handleSubmit = async () => {
    const payload = {
      date: selectedDate,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      entries,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/timesheet/1', payload);
      if (response.status === 200) {
        alert('Timesheet submitted successfully!');
        setShowModal(false);
      } else {
        alert('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      alert('Error submitting timesheet');
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="bg-[#263383] text-white px-4 py-2 rounded">
        + Add Entry
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263383] bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg relative overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="flex justify-center items-center mb-6">
              <h2 className="text-2xl font-bold text-[#495ab6]">DAILY TIME SHEET⌛</h2>
            </div>

            <div className="flex justify-end">
              <input
                type="date"
                className="border rounded px-2 py-1 text-sm"
                max={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex mb-4">
              <div className="w-1/2 flex-col flex">
                <label className="text-sm font-medium">Employee ID</label>
                <input type="text" value="EMP001" readOnly className="w-2/3 border px-1 py-1 rounded bg-gray-100" />
              </div>
              <div className="w-1/2 flex-col flex">
                <label className="text-sm font-medium">Employee Name</label>
                <input type="text" value="John Doe" readOnly className="w-2/3 border px-1 py-1 rounded bg-gray-100" />
              </div>
            </div>

            {entries.map((entry, index) => {
              const availableTasks = getTasksForProject(entry.projectId);
              return (
                <div key={index} className="border border-gray-200 rounded p-4 mb-4">
                  <div className="flex items-end gap-2 mb-3">
                    <div className="w-[48%]">
                      <label className="text-sm">Project</label>
                      <select
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={entry.projectId || ''}
                        onChange={(e) => handleChange(index, 'projectId', parseInt(e.target.value))}
                      >
                        <option value="">-- Select Project --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleAddEntry}
                      className={`${
                        entry.projectId ? 'bg-[#263383] text-white' : 'bg-[#263383] text-white cursor-not-allowed'
                      } px-3 py-1 rounded text-sm`}
                      disabled={!entry.projectId}
                    >
                      + Project
                    </button>
                  </div>

                  {entry.tasks.map((taskEntry, taskIdx) => {
                    const usedTasks = entry.tasks.map(t => t.taskName).filter(Boolean);
                    const filteredTasks = availableTasks.filter(task => !usedTasks.includes(task) || task === taskEntry.taskName);

                    return (
                      <div key={taskIdx} className="mb-3">
                        <div className="flex items-start gap-2">
                          <div className="w-[40%]">
                            <label className="text-sm">Task</label>
                            <select
                              className="w-full border px-2 py-1 rounded text-sm"
                              value={taskEntry.taskName}
                              onChange={(e) => {
                                const updated = [...entries];
                                updated[index].tasks[taskIdx].taskName = e.target.value;
                                setEntries(updated);
                              }}
                            >
                              <option value="">-- Select Task --</option>
                              {filteredTasks.map(task => (
                                <option key={task} value={task}>{task}</option>
                              ))}
                            </select>
                          </div>
                          {taskIdx === entry.tasks.length - 1 && (
                            <button
                              disabled={!taskEntry.taskName || entry.tasks.length >= availableTasks.length}
                              onClick={() => {
                                const updated = [...entries];
                                updated[index].tasks.push({ taskName: '', description: '' });
                                setEntries(updated);
                              }}
                              className={`${
                                taskEntry.taskName
                                  ? 'bg-green-600 text-white border border-green-700'
                                  : 'bg-green-600 text-white cursor-not-allowed'
                              } px-3 py-1 rounded text-sm h-fit mt-6`}
                            >
                              + Task
                            </button>
                          )}
                        </div>

                        <div className="mt-2">
                          <label className="text-sm">Description</label>
                          <textarea
                            className="w-full border px-2 py-1 rounded text-sm"
                            rows={2}
                            value={taskEntry.description}
                            onChange={(e) => {
                              const updated = [...entries];
                              updated[index].tasks[taskIdx].description = e.target.value;
                              setEntries(updated);
                            }}
                          />
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`others-${index}-${taskIdx}`}
                            checked={taskEntry.showOtherDescription || false}
                            onChange={(e) => {
                              const updated = [...entries];
                              updated[index].tasks[taskIdx].showOtherDescription = e.target.checked;
                              setEntries(updated);
                            }}
                          />
                          <label htmlFor={`others-${index}-${taskIdx}`} className="text-sm">Others</label>
                        </div>

                        {taskEntry.showOtherDescription && (
                          <div className="mt-2">
                            <label className="text-sm">Other Description</label>
                            <textarea
                              className="w-full border px-2 py-1 rounded text-sm"
                              rows={2}
                              value={taskEntry.otherDescription || ''}
                              onChange={(e) => {
                                const updated = [...entries];
                                updated[index].tasks[taskIdx].otherDescription = e.target.value;
                                setEntries(updated);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-sm">Start Time</label>
                      <input
                        type="time"
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={entry.startTime}
                        onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm">End Time</label>
                      <input
                        type="time"
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={entry.endTime}
                        onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Work Type</label>
                    <select
                      className="w-full border px-2 py-1 rounded text-sm"
                      value={entry.workType}
                      onChange={(e) => handleChange(index, 'workType', e.target.value)}
                    >
                      <option value="">Select Work Type</option>
                      <option value="Office">Office</option>
                      <option value="Home">Home</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              );
            })}

            
export default DayTrackModal;*/}




 
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Types
interface TaskEntry { 
  taskName: string;
  description: string;
  showOtherDescription?: boolean;
  otherDescription?: string;
}

interface ProjectTaskEntry {
  projectId: number;
  tasks: TaskEntry[];
  startTime: string;
  endTime: string;
  workType: string;
}

interface Project {
  id: number;
  name: string;
  tasks: string[];
}

const DayTrackModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [entries, setEntries] = useState<ProjectTaskEntry[]>([{
    projectId: 0,
    tasks: [{ taskName: '', description: '' }],
    startTime: '',
    endTime: '',
    workType: '',
  }]);

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/projects-with-tasks');
        if (response.status === 200) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects with tasks:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleAddEntry = () => {
    setEntries([...entries, {
      projectId: 0,
      tasks: [{ taskName: '', description: '' }],
      startTime: '',
      endTime: '',
      workType: '',
    }]);
  };

  const handleChange = (index: number, field: keyof ProjectTaskEntry, value: any) => {
    const updated = [...entries];
    // updated[index][field] = value;
    if (field === 'projectId') {
      updated[index].tasks = [{ taskName: '', description: '' }];
    }
    setEntries(updated);
  };

  const getTasksForProject = (projectId: number): string[] => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.tasks : [];
  };

  const handleSubmit = async () => {
    const payload = {
      date: selectedDate,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      entries,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/timesheet/1', payload);
      if (response.status === 200) {
        alert('Timesheet submitted successfully!');
        setShowModal(false);
      } else {
        alert('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      alert('Error submitting timesheet');
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="bg-[#263383] text-white px-4 py-2 rounded">
        + Add Entry
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263383] bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg relative overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="flex justify-center items-center mb-6">
              <h2 className="text-2xl font-bold text-[#495ab6]">DAILY TIME SHEET⌛</h2>
            </div>

            <div className="flex justify-end">
              <input
                type="date"
                className="border rounded px-2 py-1 text-sm"
                max={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex mb-4">
              <div className="w-1/2 flex-col flex">
                <label className="text-sm font-medium">Employee ID</label>
                <input type="text" value="EMP001" readOnly className="w-2/3 border px-1 py-1 rounded bg-gray-100" />
              </div>
              <div className="w-1/2 flex-col flex">
                <label className="text-sm font-medium">Employee Name</label>
                <input type="text" value="John Doe" readOnly className="w-2/3 border px-1 py-1 rounded bg-gray-100" />
              </div>
            </div>

            {entries.map((entry, index) => {
              const availableTasks = getTasksForProject(entry.projectId);
              return (
                <div key={index} className="border border-gray-200 rounded p-4 mb-4">
                  <div className="flex items-end gap-2 mb-3">
                    <div className="w-[48%]">
                      <label className="text-sm">Project</label>
                      <select
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={entry.projectId || ''}
                        onChange={(e) => handleChange(index, 'projectId', parseInt(e.target.value))}
                      >
                        <option value="">-- Select Project --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleAddEntry}
                      className={`${
                        entry.projectId ? 'bg-[#263383] text-white' : 'bg-[#263383] text-white cursor-not-allowed'
                      } px-3 py-1 rounded text-sm`}
                      disabled={!entry.projectId}
                    >
                      + Project
                    </button>
                  </div>

                  {entry.tasks.map((taskEntry, taskIdx) => {
                    const usedTasks = entry.tasks.map(t => t.taskName).filter(Boolean);
                    const filteredTasks = availableTasks.filter(task => !usedTasks.includes(task) || task === taskEntry.taskName);

                    return (
                      <div key={taskIdx} className="mb-3">
                        <div className="flex items-start gap-2">
                          <div className="w-[40%]">
                            <label className="text-sm">Task</label>
                            <select
                              className="w-full border px-2 py-1 rounded text-sm"
                              value={taskEntry.taskName}
                              onChange={(e) => {
                                const updated = [...entries];
                                updated[index].tasks[taskIdx].taskName = e.target.value;
                                setEntries(updated);
                              }}
                            >
                              <option value="">-- Select Task --</option>
                              {filteredTasks.map(task => (
                                <option key={task} value={task}>{task}</option>
                              ))}
                            </select>
                          </div>
                          {taskIdx === entry.tasks.length - 1 && (
                            <button
                              disabled={!taskEntry.taskName || entry.tasks.length >= availableTasks.length}
                              onClick={() => {
                                const updated = [...entries];
                                updated[index].tasks.push({ taskName: '', description: '' });
                                setEntries(updated);
                              }}
                              className={`${
                                taskEntry.taskName
                                  ? 'bg-green-600 text-white border border-green-700'
                                  : 'bg-green-600 text-white cursor-not-allowed'
                              } px-3 py-1 rounded text-sm h-fit mt-6`}
                            >
                              + Task
                            </button>
                          )}
                        </div>

                        <div className="mt-2">
                          <label className="text-sm">Description</label>
                          <textarea
                            className="w-full border px-2 py-1 rounded text-sm"
                            rows={2}
                            value={taskEntry.description}
                            onChange={(e) => {
                              const updated = [...entries];
                              updated[index].tasks[taskIdx].description = e.target.value;
                              setEntries(updated);
                            }}
                          />
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`others-${index}-${taskIdx}`}
                            checked={taskEntry.showOtherDescription || false}
                            onChange={(e) => {
                              const updated = [...entries];
                              updated[index].tasks[taskIdx].showOtherDescription = e.target.checked;
                              setEntries(updated);
                            }}
                          />
                          <label htmlFor={`others-${index}-${taskIdx}`} className="text-sm">Others</label>
                        </div>

                        {taskEntry.showOtherDescription && (
                          <div className="mt-2">
                            <label className="text-sm">Other Description</label>
                            <textarea
                              className="w-full border px-2 py-1 rounded text-sm"
                              rows={2}
                              value={taskEntry.otherDescription || ''}
                              onChange={(e) => {
                                const updated = [...entries];
                                updated[index].tasks[taskIdx].otherDescription = e.target.value;
                                setEntries(updated);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-sm">Start Time</label>
                      <input
                        type="time"
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={entry.startTime}
                        onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm">End Time</label>
                      <input
                        type="time"
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={entry.endTime}
                        onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Work Type</label>
                    <select
                      className="w-full border px-2 py-1 rounded text-sm"
                      value={entry.workType}
                      onChange={(e) => handleChange(index, 'workType', e.target.value)}
                    >
                      <option value="">Select Work Type</option>
                      <option value="Office">Office</option>
                      <option value="Home">Home</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end space-x-4 mt-4">
              <button className="bg-[#263383] text-white px-4 py-2 rounded" onClick={handleSubmit}>
                Submit
              </button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayTrackModal; 






