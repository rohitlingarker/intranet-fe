import { useState, useEffect } from 'react';

function ChangeLeaveDatesModal({
  open,
  onClose,
  onSave,
  currentStart,
  currentEnd,
}) {
  const [start, setStart] = useState(currentStart);
  const [end, setEnd] = useState(currentEnd);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStart(currentStart);
      setEnd(currentEnd);
      setError('');
    }
  }, [open, currentStart, currentEnd]);

  // Check if a date string is weekend
  const isWeekend = (dateStr) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6; // Sunday=0, Saturday=6
  };

  // Handler for start date change
  const handleStartChange = (value) => {
    if (isWeekend(value)) {
      setError('Weekends (Saturday and Sunday) are not allowed to be selected as start dates. Please choose a weekday.');
    } else {
      setError('');
      setStart(value);
      // Optional: enforce start <= end, if needed you can adjust end date here as well
    }
  };

  // Handler for end date change
  const handleEndChange = (value) => {
    if (isWeekend(value)) {
      setError('Weekends (Saturday and Sunday) are not allowed to be selected as end dates. Please choose a weekday.');
    } else {
      setError('');
      setEnd(value);
      // Optional: enforce end >= start, if needed you can adjust start date here as well
    }
  };

  return open ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Change Leave Dates</h3>
        <label className="block mb-2 font-medium">Start Date</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2 mb-3"
          value={start}
          onChange={e => handleStartChange(e.target.value)}
        />
        <label className="block mb-2 font-medium">End Date</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={end}
          onChange={e => handleEndChange(e.target.value)}
        />
        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              setError('');
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition"
            onClick={() => {
              if (start && end) {
                if (isWeekend(start) || isWeekend(end)) {
                  setError('Weekends (Saturday and Sunday) are not allowed as start or end dates. Please select a weekday.');
                  return;
                }
                onSave(start, end);
                setError('');
                onClose();
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default ChangeLeaveDatesModal;