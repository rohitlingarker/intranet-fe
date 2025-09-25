import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Trash2, X } from "lucide-react";

// --- Configuration ---
const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

// --- Main Component ---
export default function AddHolidaysModal({ isOpen, onClose, onSuccess }) {
  // State for the list of holidays being added
  const [holidays, setHolidays] = useState([]);
  
  // State for the current form inputs
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("NATIONAL"); // Default type
  const [state, setState] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // State for UI feedback
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset the form whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setHolidays([]);
      setDate("");
      setDescription("");
      setType("NATIONAL");
      setState("");
      setYear(new Date().getFullYear().toString());
      setError("");
    }
  }, [isOpen]);

  const handleAddHoliday = () => {
    setError("");
    // --- Validation ---
    if (!date || !description || !year) {
      setError("Date, Description, and Year are required for each holiday.");
      return;
    }
    if (type === "REGIONAL" && !state) {
      setError("Please specify the state for a regional holiday.");
      return;
    }

    const newHoliday = {
      id: Date.now(), // Temporary unique ID for list management
      date,
      description,
      type,
      state: type === "REGIONAL" ? state : null,
      year,
    };

    setHolidays([...holidays, newHoliday]);

    // --- Clear inputs for the next entry ---
    setDate("");
    setDescription("");
    setState("");
  };

  const handleRemoveHoliday = (idToRemove) => {
    setHolidays(holidays.filter((holiday) => holiday.id !== idToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (holidays.length === 0) {
      setError("Please add at least one holiday to the list before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");

    // Prepare the payload for the backend (removing the temporary ID)
    const payload = holidays.map(({ id, ...rest }) => rest);

    try {
      await axios.post(`${BASE_URL}/api/holidays`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${holidays.length} holiday(s) added successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add Company Holidays</h2>
          <button onClick={onClose} className="hover:bg-gray-100 rounded-full p-1 transition">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* --- Add Holiday Form --- */}
          <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md shadow-sm"/>
              </div>
              {/* Description Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Diwali" className="mt-1 w-full p-2 border rounded-md shadow-sm"/>
              </div>
              {/* Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full p-2 border rounded-md shadow-sm">
                  <option value="NATIONAL">National</option>
                  <option value="REGIONAL">Regional</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
              </div>
               {/* Year Input */}
               <div>
                <label className="block text-sm font-medium text-gray-700">Year *</label>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g., 2025" className="mt-1 w-full p-2 border rounded-md shadow-sm"/>
              </div>
            </div>

            {/* --- Conditional State Input --- */}
            {type === 'REGIONAL' && (
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700">State *</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g., Telangana" className="mt-1 w-full p-2 border rounded-md shadow-sm"/>
              </div>
            )}
            
            <div className="flex justify-end">
              <button type="button" onClick={handleAddHoliday} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                <Plus size={18} />
                Add Holiday to List
              </button>
            </div>
          </div>
          
          {/* --- Error Display --- */}
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium">{error}</div>}

          {/* --- Holidays List --- */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Holidays to Add ({holidays.length})</h3>
            {holidays.length > 0 ? (
              <ul className="border rounded-lg divide-y">
                {holidays.map((holiday) => (
                  <li key={holiday.id} className="p-3 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{holiday.description}</p>
                      <p className="text-sm text-gray-600">
                        {holiday.date} ({holiday.year}) - {holiday.type}
                        {holiday.type === 'REGIONAL' && `, ${holiday.state}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleRemoveHoliday(holiday.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition">
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-500">
                <p>No holidays added yet.</p>
                <p className="text-sm">Use the form above to add holidays to the list.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- Footer and Submit Button --- */}
        <div className="p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || holidays.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : `Submit ${holidays.length} Holiday(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}