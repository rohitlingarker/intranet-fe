import { useState, useEffect } from 'react';

function ChangeLeaveTypeModal({ open, onClose, onSave, currentTypeId, allTypes }) {
  const [selected, setSelected] = useState(currentTypeId ?? (allTypes[0]?.leaveTypeId ?? ''));

  useEffect(() => {
    if (open) setSelected(currentTypeId ?? (allTypes[0]?.leaveTypeId ?? ''));
  }, [open, currentTypeId, allTypes]);
  
  const isLoading = allTypes.length === 0;

  return open ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Change Leave Type</h3>
        {isLoading ? (
          <div>Loading leave types...</div>
        ) : (
          <select
            className="w-full border rounded px-3 py-2"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            {allTypes.map(type =>
              <option key={type.leaveTypeId} value={type.leaveTypeId}>
                {type.leaveName}
              </option>
            )}
          </select>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition"
            onClick={() => {
              if (selected && selected !== currentTypeId) {
                onSave(selected);
                onClose();
              }
            }}
            disabled={isLoading || selected === currentTypeId}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default ChangeLeaveTypeModal;