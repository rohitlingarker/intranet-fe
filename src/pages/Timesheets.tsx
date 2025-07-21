import React, { useState } from 'react';
import { Save, Clock, Calendar, BarChart3 } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface TimesheetEntry {
  id: string;
  task: string;
  hours: number;
  status: 'In Progress' | 'Completed' | 'Blocked';
  date: string;
}

const Timesheets: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    { id: '1', task: 'Employee Portal Development', hours: 4, status: 'In Progress', date: currentDate },
    { id: '2', task: 'Code Review', hours: 2, status: 'Completed', date: currentDate },
    { id: '3', task: 'Team Meeting', hours: 1, status: 'Completed', date: currentDate }
  ]);
  const [newTask, setNewTask] = useState('');
  const [newHours, setNewHours] = useState('');
  const [newStatus, setNewStatus] = useState<'In Progress' | 'Completed' | 'Blocked'>('In Progress');
  
  const { showNotification } = useNotification();

  const weeklyData = [
    { day: 'Monday', hours: 8 },
    { day: 'Tuesday', hours: 7.5 },
    { day: 'Wednesday', hours: 8 },
    { day: 'Thursday', hours: 6.5 },
    { day: 'Friday', hours: 7 },
  ];

  const addEntry = () => {
    if (newTask.trim() && newHours) {
      const entry: TimesheetEntry = {
        id: Date.now().toString(),
        task: newTask.trim(),
        hours: parseFloat(newHours),
        status: newStatus,
        date: currentDate
      };
      setEntries([...entries, entry]);
      setNewTask('');
      setNewHours('');
      setNewStatus('In Progress');
    }
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof TimesheetEntry, value: any) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const getTotalHours = () => {
    return entries.reduce((total, entry) => total + entry.hours, 0);
  };

  const handleSubmit = () => {
    showNotification('Timesheet submitted successfully (mock)');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600">Track time and generate reports</p>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-[#263383] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3548b6] transition-colors flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Submit Timesheet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Timesheet Entry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Daily Timesheet</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#263383] focus:border-transparent"
                />
              </div>
            </div>

            {/* Add New Entry */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Task description"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="md:col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#263383] focus:border-transparent"
                />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="Hours"
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#263383] focus:border-transparent"
                />
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#263383] focus:border-transparent"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <button
                onClick={addEntry}
                className="mt-3 bg-[#263383] text-white px-4 py-2 rounded font-medium hover:bg-[#3548b6] transition-colors"
              >
                Add Entry
              </button>
            </div>

            {/* Entries List */}
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={entry.task}
                      onChange={(e) => updateEntry(entry.id, 'task', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={entry.hours}
                      onChange={(e) => updateEntry(entry.id, 'hours', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#263383] focus:border-transparent"
                    />
                    <select
                      value={entry.status}
                      onChange={(e) => updateEntry(entry.id, 'status', e.target.value)}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#263383] focus:border-transparent"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Hours:</span>
                <span className="text-lg font-bold text-[#263383]">{getTotalHours()} hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Weekly Summary
            </h3>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#263383] h-2 rounded-full"
                        style={{ width: `${(day.hours / 8) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{day.hours}h</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Week:</span>
                <span className="text-lg font-bold text-[#263383]">37 hours</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Daily:</span>
                <span className="font-medium">7.4 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month:</span>
                <span className="font-medium">148 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overtime:</span>
                <span className="font-medium text-orange-600">2.5 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timesheets;