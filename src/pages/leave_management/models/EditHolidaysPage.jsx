// src/pages/EditHolidaysPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Edit, Trash, Save, XCircle } from 'lucide-react'; // Icons for actions

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditHolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // State for inline editing
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch all holidays when the component mounts
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/holidays/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHolidays(response.data);
      } catch (err) {
        setError('Failed to fetch holidays. Please try again later.');
        toast.error('Failed to fetch holidays.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHolidays();
  }, [token]);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setDebouncedQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handlers for starting and canceling edits
  const handleEditClick = (holiday) => {
    setEditingHolidayId(holiday.holidayId);
    setEditedData({ ...holiday });
  };

  const handleCancelEdit = () => {
    setEditingHolidayId(null);
    setEditedData({});
  };
  
  // Handler for input changes during editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handler for saving an updated holiday
  const handleSaveHoliday = async (holidayId) => {
    try {
      await axios.put(`${BASE_URL}/api/holidays/update`, editedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Holiday updated successfully!');
      setHolidays(holidays.map(h => h.holidayId === holidayId ? editedData : h));
      handleCancelEdit(); // Exit editing mode
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update holiday.');
    }
  };

  // Handler for deleting a holiday
  const handleDeleteHoliday = async (holidayId) => {
    // It's a good practice to confirm deletion
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await axios.delete(`${BASE_URL}/api/holidays/delete/${holidayId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Holiday deleted successfully!');
        setHolidays(holidays.filter(h => h.holidayId !== holidayId));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete holiday.');
      }
    }
  };

  if (isLoading) return <div className="p-6">Loading holidays...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Manage Holidays</h1>
        <button 
          onClick={() => navigate(-1)} // Go back to the previous page
          className="mb-4 px-4 py-2 bg-indigo-900 text-white hover:bg-indigo-800  hover:bg-gray-400 rounded-md font-medium"
        >
          ← Back
        </button>
      </div>
      
      {/* Search Bar */}
        <div className="mb-4 relative w-full max-w-md">
            <input
            type="text"
            placeholder="Search by Employee ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-4 py-2 rounded w-full shadow-sm"
            onFocus={() => setShowSuggestions(true)}
            />

            {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded w-full shadow-md mt-1 max-h-48 overflow-y-auto z-20">
                {suggestions.map((s, i) => (
                <li
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                    {s}
                </li>
                ))}
            </ul>
            )}

            {searchQuery && (
            <button
                onClick={() => {
                setSearchQuery("");
                setDebouncedQuery("");
                setSuggestions([]);
                }}
                className="absolute right-2 top-2 text-gray-500 hover:text-black"
            >
                ✕
            </button>
            )}
        </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-heading">Holiday Name</th>
              <th className="px-4 py-3 font-heading">Date</th>
              <th className="px-4 py-3 font-heading">Type</th>
              <th className="px-4 py-3 font-heading">State</th>
              <th className="px-4 py-3 font-heading">Country</th>
              <th className="px-4 py-3 font-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.holidayId} className="border-t hover:bg-gray-50">
                {editingHolidayId === holiday.holidayId ? (
                  // Editing Mode Row
                  <>
                    <td className="px-4 py-2">
                      <input type="text" name="holidayName" value={editedData.holidayName} onChange={handleInputChange} className="border rounded p-1 w-full" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="date" name="holidayDate" value={new Date(editedData.holidayDate).toISOString().split('T')[0]} onChange={handleInputChange} className="border rounded p-1 w-full" />
                    </td>
                    <td className="px-4 py-2">
                       <select name="type" value={editedData.type} onChange={handleInputChange} className="border rounded p-1 w-full">
                            <option value="NATIONAL">National</option>
                            <option value="REGIONAL">Regional</option>
                            <option value="OPTIONAL">Optional</option>
                        </select>
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" name="holidayState" value={editedData.state} onChange={handleInputChange} placeholder={holiday.state || '-'} readOnly className="border rounded p-1 w-full" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" name="holidayCountry" value={editedData.country} onChange={handleInputChange} placeholder={holiday.country || '-'} readOnly className="border rounded p-1 w-full" />
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button onClick={() => handleSaveHoliday(holiday.holidayId)} className="p-2 text-green-500 hover:text-green-800" title='Save'><Save size={20} /></button>
                      <button onClick={handleCancelEdit} className="p-2 text-red-500 hover:text-red-700" title='Cancel'><XCircle size={20} /></button>
                    </td>
                  </>
                ) : (
                  // Display Mode Row
                  <>
                    <td className="px-4 py-2">{holiday.holidayName}</td>
                    <td className="px-4 py-2">{new Date(holiday.holidayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-4 py-2">{holiday.type}</td>
                    <td className="px-4 py-2">{holiday.state ? holiday.state : '-'}</td>
                    <td className="px-4 py-2">{holiday.country ? holiday.country : '-'}</td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button onClick={() => handleEditClick(holiday)} className="p-2 text-blue-600 hover:text-blue-800" title='Edit'><Edit size={20} /></button>
                      <button onClick={() => handleDeleteHoliday(holiday.holidayId)} className="p-2 text-red-600 hover:text-red-800" title='Delete'><Trash size={20} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditHolidaysPage;