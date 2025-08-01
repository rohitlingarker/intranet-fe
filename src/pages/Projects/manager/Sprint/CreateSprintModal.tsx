import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (sprint: Sprint) => void;
}

interface Sprint {
  id: number;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
}

const CreateSprintModal: React.FC<Props> = ({ projectId, isOpen, onClose, onCreated }) => {
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'PLANNED' | 'ACTIVE' | 'COMPLETED'>('PLANNED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!goal || !startDate || !endDate) {
      setError('All fields are required.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/projects/${projectId}/sprints`, {
        goal,
        startDate,
        endDate,
        status,
      });
      onCreated(response.data);
      onClose();
      setGoal('');
      setStartDate('');
      setEndDate('');
      setStatus('PLANNED');
      setError('');
    } catch (err) {
      console.error('Failed to create sprint:', err);
      setError('Failed to create sprint.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create Sprint</h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Goal</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border p-2 rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSprintModal;
