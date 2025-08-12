import { useState, useEffect } from 'react';

export function CommentModal({
  open,
  onClose,
  onSave,
  comment,
  required,
  forceMandatory,
}) {
  const [value, setValue] = useState(comment ?? '');

  useEffect(() => {
    if (open) setValue(comment ?? '');
  }, [open, comment]);

  return open ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          Comment {required && <span className="text-red-600">*</span>}
        </h3>
        {forceMandatory && (
          <div className="text-red-500 mb-2">
            Comment is required.
          </div>
        )}
        <textarea
          className="w-full border rounded-lg px-3 py-2 bg-gray-50 mb-2"
          rows={3}
          value={value}
          autoFocus
          onChange={e => setValue(e.target.value)}
          placeholder={required ? "Enter comment (required)" : "Add comment (optional)"}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition ${required && !value.trim() ? 'opacity-60 pointer-events-none' : ''}`}
            disabled={required && !value.trim()}
            onClick={() => {
              if (!required || value.trim()) {
                onSave(value);
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

export default CommentModal;