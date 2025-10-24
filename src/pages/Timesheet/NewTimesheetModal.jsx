import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Calendar,
  Clock,
  MapPin,
  FileText,
  DollarSign,
} from "lucide-react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTime from "../../components/forms/FormTime";
import FormDatePicker from "../../components/forms/FormDatePicker";
import Button from "../../components/Button/Button";
import { showStatusToast } from "../../components/toastfy/toast";
import { addEntryToTimesheet } from "./api";

const NewTimesheetModal = ({ isOpen, onClose, refreshData, onSuccess }) => {
  const [workDate, setWorkDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    projectId: "",
    taskId: "",
    fromTime: "",
    toTime: "",
    workType: "Office",
    description: "",
    isBillable: "Yes",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectInfo, setProjectInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch project information when modal opens
  useEffect(() => {
    const fetchProjectInfo = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/project-info`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log("Fetched project info:", data);
          setProjectInfo(data);
        } catch (error) {
          console.error("Error fetching project info:", error);
          showStatusToast("Failed to fetch project information", "error");
          setProjectInfo([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjectInfo();
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setWorkDate(new Date().toISOString().split("T")[0]);
      setEntries([]);
      setCurrentEntry({
        projectId: "",
        taskId: "",
        fromTime: "",
        toTime: "",
        workType: "Office",
        description: "",
        isBillable: "Yes",
      });
    }
  }, [isOpen]);

  const workTypeOptions = [
    { label: "Office", value: "Office" },
    { label: "Home", value: "Home" },
    { label: "Client Location", value: "Client Location" },
    { label: "Hybrid", value: "Hybrid" },
  ];

  const billableOptions = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ];

  const projectOptions =
    projectInfo?.map((project) => ({
      label: project.project || "Unknown Project",
      value: project.projectId.toString(),
    })) || [];

  console.log("Project Options:", projectOptions);

  const getTaskOptions = (projectId) => {
    if (!projectId) return [];
    const project = projectInfo?.find(
      (p) => p.projectId.toString() === projectId
    );
    const taskOptions =
      project?.tasks?.map((task) => ({
        label: task.task || "Unknown Task",
        value: task.taskId.toString(),
      })) || [];
    console.log(`Task Options for Project ${projectId}:`, taskOptions);
    return taskOptions;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEntry((prev) => ({
      ...prev,
      [name]: value,
      // Reset task when project changes
      ...(name === "projectId" && { taskId: "" }),
    }));
  };

  const isValid = (entry) => {
    return (
      entry.projectId &&
      entry.taskId &&
      entry.fromTime &&
      entry.toTime &&
      entry.description?.trim()
    );
  };

  const hasTimeOverlap = (newStart, newEnd) => {
    return entries.some((entry) => {
      const existingStart = new Date(`${workDate}T${entry.fromTime}`);
      const existingEnd = new Date(`${workDate}T${entry.toTime}`);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const handleAddEntry = () => {
    if (!isValid(currentEntry)) {
      showStatusToast("Please fill in all required fields", "error");
      return;
    }

    const newStart = new Date(`${workDate}T${currentEntry.fromTime}`);
    const newEnd = new Date(`${workDate}T${currentEntry.toTime}`);

    if (newStart >= newEnd) {
      showStatusToast("End time must be after start time", "error");
      return;
    }

    if (hasTimeOverlap(newStart, newEnd)) {
      showStatusToast("Time overlap detected with another entry!", "error");
      return;
    }

    const newEntry = {
      ...currentEntry,
      projectId: parseInt(currentEntry.projectId),
      taskId: parseInt(currentEntry.taskId),
      fromTime: newStart.toISOString(),
      toTime: newEnd.toISOString(),
      isBillable: currentEntry.isBillable === "Yes",
      description: currentEntry.description.trim(),
    };

    setEntries((prev) => [...prev, newEntry]);
    setCurrentEntry({
      projectId: "",
      taskId: "",
      fromTime: "",
      toTime: "",
      workType: "Office",
      description: "",
      isBillable: "Yes",
    });
    showStatusToast("Entry added successfully!", "success");
  };

  const handleRemoveEntry = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotalHours = () => {
    return entries.reduce((total, entry) => {
      const start = new Date(entry.fromTime);
      const end = new Date(entry.toTime);
      const hours = (end - start) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };

  const handleSubmit = async () => {
    if (entries.length === 0) {
      showStatusToast("Please add at least one entry", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = entries.map((entry) => ({
        projectId: entry.projectId,
        taskId: entry.taskId,
        description: entry.description,
        workLocation: entry.workType,
        fromTime: entry.fromTime,
        toTime: entry.toTime,
        otherDescription: "string",
      }));

      const response = await fetch(
        `${
          import.meta.env.VITE_TIMESHEET_API_ENDPOINT
        }/api/timesheet/create?workDate=${workDate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let message = "Failed to submit timesheet";
        try {
          message = await response.text();
        } catch {}
        showStatusToast(message || "Failed to submit timesheet", "error");
        setIsSubmitting(false);
        return;
      }

      showStatusToast("Timesheet submitted successfully!", "success");
      onSuccess?.();
      refreshData?.();
      onClose();
    } catch (error) {
      showStatusToast("Failed to submit timesheet", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6" />
              <h2 className="text-2xl font-bold">New Timesheet Entry</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Main Content: make this flex-1 and only this div scrollable */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading project information...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Date Selection */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Work Date
                  </h3>
                </div>
                <div className="max-w-xs">
                  <FormDatePicker
                    name="workDate"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Add New Entry Form */}
              <div className="mb-6 p-6 bg-white border-2 border-dashed border-blue-300 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Plus className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Add New Entry
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Project Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span>Project *</span>
                    </label>
                    <FormSelect
                      name="projectId"
                      value={currentEntry.projectId}
                      options={projectOptions}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Task Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span>Task *</span>
                    </label>
                    <FormSelect
                      name="taskId"
                      value={currentEntry.taskId}
                      options={getTaskOptions(currentEntry.projectId)}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Work Location */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>Work Location</span>
                    </label>
                    <FormSelect
                      name="workType"
                      value={currentEntry.workType}
                      options={workTypeOptions}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Start Time */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4" />
                      <span>Start Time *</span>
                    </label>
                    <FormTime
                      name="fromTime"
                      value={currentEntry.fromTime}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4" />
                      <span>End Time *</span>
                    </label>
                    <FormTime
                      name="toTime"
                      value={currentEntry.toTime}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Billable */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <DollarSign className="h-4 w-4" />
                      <span>Billable</span>
                    </label>
                    <FormSelect
                      name="isBillable"
                      value={currentEntry.isBillable}
                      options={billableOptions}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4 space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4" />
                    <span>Description *</span>
                  </label>
                  <FormInput
                    name="description"
                    value={currentEntry.description}
                    onChange={handleInputChange}
                    placeholder="Enter work description..."
                  />
                </div>

                {/* Add Entry Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleAddEntry}
                    disabled={!isValid(currentEntry)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Entry</span>
                  </Button>
                </div>
              </div>

              {/* Entries List */}
              {entries.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Added Entries ({entries.length})
                    </h3>
                    <div className="text-lg font-semibold text-blue-600">
                      Total Hours: {calculateTotalHours().toFixed(2)} hrs
                    </div>
                  </div>

                  <div className="space-y-3">
                    {entries.map((entry, index) => {
                      const start = new Date(entry.fromTime);
                      const end = new Date(entry.toTime);
                      const hours = (end - start) / (1000 * 60 * 60);
                      const project = projectInfo?.find(
                        (p) => p.projectId === entry.projectId
                      );
                      const task = project?.tasks?.find(
                        (t) => t.taskId === entry.taskId
                      );

                      return (
                        <div
                          key={index}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Project:
                                  </span>
                                  <p className="text-gray-800">
                                    {project?.project || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Task:
                                  </span>
                                  <p className="text-gray-800">
                                    {task?.task || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Time:
                                  </span>
                                  <p className="text-gray-800">
                                    {start.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}{" "}
                                    -{" "}
                                    {end.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Hours:
                                  </span>
                                  <p className="text-gray-800 font-semibold">
                                    {hours.toFixed(2)} hrs
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="font-medium text-gray-600">
                                  Description:
                                </span>
                                <p className="text-gray-800">
                                  {entry.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveEntry(index)}
                              className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Sticky Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            {entries.length > 0 && (
              <span>
                Total: {calculateTotalHours().toFixed(2)} hours for {workDate}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline" className="px-6 py-2">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={entries.length === 0 || isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
            >
              {isSubmitting ? "Submitting..." : "Submit Timesheet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTimesheetModal;
