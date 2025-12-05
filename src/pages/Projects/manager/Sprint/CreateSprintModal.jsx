import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateSprintModal = ({ isOpen, projectId, onClose, onCreated }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    status: "PLANNING",
    projectId: projectId.toString(),
  });

  const [duration, setDuration] = useState("1W"); // 1W, 2W, 3W, CUSTOM
  const [customWeeks, setCustomWeeks] = useState("");

  const token = localStorage.getItem("token");
  const [projectName, setProjectName] = useState("");
  const [showDecimalWarning, setShowDecimalWarning] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjectName(response.data.name || "Unknown Project");
      } catch (error) {
        toast.error("Error fetching project details.");
      }
    };

    if (projectId) fetchProject();
  }, [projectId, token]);

  // Convert datetime to yyyy-MM-ddTHH:mm:ss
  const toLocalDateTime = (datetimeStr) =>
    datetimeStr.length === 16 ? `${datetimeStr}:00` : datetimeStr;

  // Helper: Add weeks to start date
  const calculateEndDate = (start, weeks) => {
    if (!start || !weeks) return "";
    const date = new Date(start);
    date.setDate(date.getDate() + weeks * 7);
    return date.toISOString().slice(0, 16);
  };

  // Handle Start Date change
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;

    let newEnd = formData.endDate;

    if (duration !== "CUSTOM") {
      const w = parseInt(duration.replace("W", ""));
      newEnd = calculateEndDate(newStart, w);
    } else if (customWeeks !== "") {
      newEnd = calculateEndDate(newStart, parseInt(customWeeks));
    }

    setFormData({
      ...formData,
      startDate: newStart,
      endDate: newEnd,
    });
  };

  // Handle Duration dropdown
  const handleDurationChange = (e) => {
    const value = e.target.value;
    setDuration(value);

    if (value !== "CUSTOM") {
      const w = parseInt(value.replace("W", ""));
      const end = calculateEndDate(formData.startDate, w);

      setFormData({ ...formData, endDate: end });
      setCustomWeeks(""); // reset custom input
    }
  };

  // Form generic change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      goal: formData.goal || null,
      startDate: toLocalDateTime(formData.startDate),
      endDate: toLocalDateTime(formData.endDate),
      status: formData.status,
      projectId: parseInt(formData.projectId),
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Sprint created successfully!", { autoClose: 1000 });

      onCreated(response.data);

      // Reset
      setFormData({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        status: "PLANNING",
        projectId: projectId.toString(),
      });

      setDuration("1W");
      setCustomWeeks("");

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Sprint creation failed. Please check your inputs.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xl max-h-screen overflow-y-auto p-6 relative">
        <ToastContainer />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create a New Sprint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sprint Name */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
            />
          </div>

          {/* Goal */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Goal <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 p-2 rounded-md"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleStartDateChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
            />
          </div>

          {/* Duration Dropdown */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              value={duration}
              onChange={handleDurationChange}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="1W">1 Week</option>
              <option value="2W">2 Weeks</option>
              <option value="3W">3 Weeks</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* Custom Weeks Input */}
          {duration === "CUSTOM" && (
            <div>

              {/* Decimal Warning — shown only when user attempts decimal */}
              {showDecimalWarning && (
                <p className="text-red-500 text-sm mb-1">
                  ⚠ Decimal values are not allowed. Please enter whole numbers only.
                </p>
              )}

              <label className="block font-medium text-gray-700 mb-1">
                Enter Weeks <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={customWeeks}
                onChange={(e) => {
                  const value = e.target.value;

                  // If user types decimal → show warning, don't update input
                  if (value.includes(".")) {
                    setShowDecimalWarning(true);

                    // do NOT update state (block decimals)
                    return;
                  }

                  // If input is valid (digits only)
                  if (/^\d*$/.test(value)) {
                    setShowDecimalWarning(false); // hide warning
                    setCustomWeeks(value);

                    // update endDate if valid and startDate present
                    if (value !== "" && value !== "0" && formData.startDate) {
                      const weeks = parseInt(value);
                      const end = calculateEndDate(formData.startDate, weeks);
                      setFormData({ ...formData, endDate: end });
                    }
                  }
                }}
                placeholder="Enter number of weeks"
                className="w-full border border-gray-300 p-2 rounded-md"
              />

              {customWeeks !== "" && customWeeks === "0" && (
                <p className="text-red-500 text-sm mt-1">
                  Duration must be at least 1 week.
                </p>
              )}
            </div>
          )}


          {/* End Date ALWAYS visible */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>

            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              readOnly
              disabled
              className="w-full border border-gray-300 bg-gray-100 cursor-not-allowed p-2 rounded-md"
            />
          </div>

          {/* Project Readonly */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Project
            </label>
            <input
              type="text"
              value={projectName}
              disabled
              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;
