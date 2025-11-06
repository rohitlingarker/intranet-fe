// src/pages/EditHolidaysPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Edit, Trash2, Save, XCircle } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ConfirmationModal from "./ConfirmationModal";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditHolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [selectedLeaveTypeIdToDelete, setSelectedLeaveTypeIdToDelete] =
    useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  // const token = localStorage.getItem("token");

  // Fetch all holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/api/holidays/year/${new Date().getFullYear()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHolidays(response.data);
      } catch (err) {
        setError("Failed to fetch holidays. Please try again later.");
        toast.error("Failed to fetch holidays.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHolidays();
  }, [localStorage.getItem("token")]);

  // Handlers for editing
  const handleEditClick = (holiday) => {
    setEditingHolidayId(holiday.holidayId);
    setEditedData({ ...holiday });
  };

  const handleCancelEdit = () => {
    setEditingHolidayId(null);
    setEditedData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveHoliday = async (holidayId) => {
    try {
      setIsLoading(true);
      await axios.put(`${BASE_URL}/api/holidays/update`, editedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Holiday updated successfully!");
      setHolidays((holidays) =>
        holidays.map((h) => (h.holidayId === holidayId ? editedData : h))
      );
      handleCancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update holiday.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmation = (holidayId) => {
    setSelectedLeaveTypeIdToDelete(holidayId);
    setIsDeleteConfirmationOpen(true);
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      setIsLoading(true);
      await axios.delete(`${BASE_URL}/api/holidays/delete/${holidayId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Holiday deleted successfully!");
      setHolidays((holidays) =>
        holidays.filter((h) => h.holidayId !== holidayId)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete holiday.");
    } finally {
      setIsLoading(false);
      setIsDeleteConfirmationOpen(false);
    }
  };

  const filteredHolidays = holidays.filter((holiday) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      holiday.holidayName.toLowerCase().includes(lowerSearch) ||
      holiday.type.toLowerCase().includes(lowerSearch) ||
      (holiday.state || "").toLowerCase().includes(lowerSearch) ||
      (holiday.country || "").toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="relative p-6 space-y-4">
      {/* 🔹 Full-Screen Loading Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex justify-center items-center z-[9999] animate-fadeIn">
          <LoadingSpinner text="Please wait" />
        </div>
      )}

      <div className="flex items-center justify-between px-6 mb-4 ">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Manage Holidays</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)} // go back to previous page
          className="flex items-center text-blue-700 font-medium hover:text-blue-900 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 w-full flex justify-start items-center space-x-2 h-9">
        <input
          type="text"
          placeholder="Search by Holiday Name, Type, State or Country..."
          className="border rounded p-2 w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Holidays Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100 text-sm font-bolder">
            <tr>
              <th className="px-4 py-3 font-heading">Holiday Name</th>
              <th className="px-4 py-3 font-heading">Date</th>
              <th className="px-4 py-3 font-heading">Type</th>
              <th className="px-4 py-3 font-heading">State</th>
              <th className="px-4 py-3 font-heading">Country</th>
              <th className="px-4 py-3 font-heading">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredHolidays.map((holiday) => (
              <tr key={holiday.holidayId} className="border-t hover:bg-gray-50">
                {editingHolidayId === holiday.holidayId ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        name="holidayName"
                        value={editedData.holidayName}
                        onChange={handleInputChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        name="holidayDate"
                        value={
                          new Date(editedData.holidayDate)
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={handleInputChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 w-1/6">
                      <select
                        name="type"
                        value={editedData.type}
                        onChange={handleInputChange}
                        className="border rounded p-1 w-full"
                      >
                        <option value="NATIONAL">National</option>
                        <option value="REGIONAL">Regional</option>
                        <option value="OPTIONAL">Optional</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        name="state"
                        value={editedData.state || ""}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="border rounded p-1 w-full bg-gray-100 text-gray-400 hover:cursor-not-allowed"
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        name="country"
                        value={editedData.country || ""}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className="border rounded p-1 w-full bg-gray-100 text-gray-400 hover:cursor-not-allowed"
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => handleSaveHoliday(holiday.holidayId)}
                        className="p-2 text-green-500 hover:text-green-800"
                        title="Save"
                      >
                        <Save size={20} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="Cancel"
                      >
                        <XCircle size={20} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{holiday.holidayName}</td>
                    <td className="px-4 py-2">
                      {new Date(holiday.holidayDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </td>
                    <td className="px-4 py-2">{holiday.type}</td>
                    <td className="px-4 py-2">
                      {holiday.state ? holiday.state : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {holiday.country ? holiday.country : "-"}
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(holiday)}
                        className={`p-2 text-blue-600  ${holiday.isActive ? "hover:text-blue-800" : "text-opacity-15 cursor-not-allowed"}`}
                        title={holiday.isActive ? "Edit" : "This holiday cannot be edited."}
                        disabled={!holiday.isActive}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteConfirmation(holiday.holidayId)
                        }
                        className={`p-2 text-red-600  ${holiday.isActive ? "hover:text-red-800" : "text-opacity-15 cursor-not-allowed"}`}
                        title={holiday.isActive ? "Delete" : "This holiday cannot be deleted."}
                        disabled={!holiday.isActive}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this holiday?"
        onConfirm={() => handleDeleteHoliday(selectedLeaveTypeIdToDelete)}
        onCancel={() => setIsDeleteConfirmationOpen(false)}
      />
    </div>
  );
};

export default EditHolidaysPage;
