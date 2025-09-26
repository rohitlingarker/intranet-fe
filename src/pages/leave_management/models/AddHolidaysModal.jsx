import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  X,
  CalendarDays,
  Text,
  Tag,
  MapPin,
  Hash,
  Download,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";

// --- Configuration ---
const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

// --- Helper UI Component ---
const InputGroup = ({ label, icon, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
      {children}
    </div>
  </div>
);

// --- Main Component ---
export default function AddHolidaysModal({ isOpen, onClose, onSuccess }) {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("NATIONAL");
  const [state, setState] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHolidays([]);
      setDate("");
      setDescription("");
      setType("NATIONAL");
      setState("");
      setYear(new Date().getFullYear().toString());
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleAddHoliday = () => {
    setError("");
    if (!date || !description || !year) {
      setError("Date, Description, and Year are required.");
      return;
    }
    if (type === "REGIONAL" && !state) {
      setError("Please specify the state for a regional holiday.");
      return;
    }
    const newHoliday = {
      id: Date.now(),
      date,
      description,
      type,
      state: type === "REGIONAL" ? state : null,
      year,
    };
    setHolidays([...holidays, newHoliday]);
    setDate("");
    setDescription("");
    setState("");
  };

  const handleRemoveHoliday = (idToRemove) => {
    setHolidays(holidays.filter((holiday) => holiday.id !== idToRemove));
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError("");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/holidays/template/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "holidays_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download template. Please try again.");
      setError("Could not download the template file.");
    } finally {
      setDownloading(false);
    }
  };

  // --- [FIXED] Excel Upload Logic ---
  // --- [FIXED] Excel Upload Logic ---
  // --- [FIXED] Excel Upload Logic ---
  // --- [FINAL FIXED] Excel Upload Logic ---
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);
  setError("");

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // FIX #1: Add `blankrows: true` to ensure the library reads all rows,
      // preventing it from incorrectly stopping before your data row.
      const dataAsArray = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        blankrows: true, 
      });

      console.log("Raw data from Excel:", dataAsArray); // Helpful for debugging

      const headers = dataAsArray[0].map(h => String(h).trim());
      // FIX #2: Filter out any truly empty rows after reading them all.
      // This makes the logic more robust.
      const dataRows = dataAsArray.slice(1).filter(row => row.some(cell => cell != null && cell !== ''));

      if (dataRows.length === 0) {
          toast.error("No valid data rows found after the header.");
          setError("No data was found in the Excel file after the header row.");
          return;
      }

      const headerMap = headers.reduce((acc, header, index) => {
        acc[header] = index;
        return acc;
      }, {});
      
      const requiredHeaders = ['holiday_date', 'holiday_name', 'type', 'year'];
      for (const rh of requiredHeaders) {
          if (headerMap[rh] === undefined) {
              throw new Error(`Missing required header column: "${rh}"`);
          }
      }

      const parsedHolidays = dataRows.map((row, rowIndex) => {
        const dateValue = row[headerMap['holiday_date']];
        const name = row[headerMap['holiday_name']];
        const description = row[headerMap['holiday_description']];
        const type = row[headerMap['type']];
        const year = row[headerMap['year']];
        const state = row[headerMap['state']];
        const country = row[headerMap['country']];

        if (dateValue === undefined || name === undefined || type === undefined || year === undefined) {
          throw new Error(`Row ${rowIndex + 2}: Missing required values for date, name, type, or year.`);
        }
        
        // FIX #3: Proactively handle Excel's numeric date format.
        let holidayDate;
        if (typeof dateValue === 'number') {
            // Excel stores dates as serial numbers (days since 1900).
            // This formula correctly converts it to a JS Date object.
            holidayDate = new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0) + dateValue * 86400000);
        } else {
            // Fallback for string dates
            holidayDate = new Date(dateValue);
        }

        if (isNaN(holidayDate.getTime())) {
          throw new Error(`Row ${rowIndex + 2}: Invalid date format in 'holiday_date' column.`);
        }
        
        // Format the date to "YYYY-MM-DD"
        const y = holidayDate.getUTCFullYear();
        const m = (holidayDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const d = holidayDate.getUTCDate().toString().padStart(2, '0');
        const formattedDate = `${y}-${m}-${d}`;

        return {
          id: Date.now() + rowIndex,
          date: formattedDate,
          name: name, // Keep original name from Excel
          description: description || name, // Use description, fallback to name
          type: String(type).toUpperCase(),
          state: String(type).toUpperCase() === 'REGIONAL' ? state : null,
          year: String(year),
          country: country || 'India', // Set a default country
        };
      });

      setHolidays(prev => [...prev, ...parsedHolidays]);
      toast.success(`${parsedHolidays.length} holidays were successfully imported.`);
    } catch (err) {
      toast.error(`Failed to parse file: ${err.message}`);
      setError(`Failed to parse file: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  reader.readAsArrayBuffer(file);
};

  // --- [FIXED] Form Submission Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (holidays.length === 0) {
      setError(
        "Please add at least one holiday to the list before submitting."
      );
      return;
    }
    setSubmitting(true);
    setError("");

    // FIX: Map the frontend state to the exact backend entity structure.
    const payload = holidays.map(({ id, ...rest }) => ({
      holidayName: rest.name || rest.description, // Use 'name' from Excel, fallback to manual 'description'
      holidayDate: rest.date,
      holidayDescription: rest.description,
      type: rest.type,
      state: rest.state,
      country: rest.country || "India", // Set default country
      year: parseInt(rest.year, 10),
    }));

    try {
      await axios.post(`${BASE_URL}/api/holidays/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${holidays.length} holiday(s) added successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Add Company Holidays
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full p-1 transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Manual Add Form */}
          <div className="bg-slate-50 p-6 rounded-xl border space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputGroup
                label="Date *"
                icon={<CalendarDays className="h-5 w-5 text-gray-400" />}
              >
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 pl-10 border bg-white rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </InputGroup>
              <div className="lg:col-span-2">
                <InputGroup
                  label="Description *"
                  icon={<Text className="h-5 w-5 text-gray-400" />}
                >
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Diwali"
                    className="w-full p-2 pl-10 border bg-white rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </InputGroup>
              </div>
              <InputGroup
                label="Type *"
                icon={<Tag className="h-5 w-5 text-gray-400" />}
              >
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 pl-10 border bg-white rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
                >
                  <option value="NATIONAL">National</option>
                  <option value="REGIONAL">Regional</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
              </InputGroup>
              <InputGroup
                label="Year *"
                icon={<Hash className="h-5 w-5 text-gray-400" />}
              >
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2025"
                  className="w-full p-2 pl-10 border bg-white rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </InputGroup>
              {type === "REGIONAL" && (
                <InputGroup
                  label="State *"
                  icon={<MapPin className="h-5 w-5 text-gray-400" />}
                >
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g., Telangana"
                    className="w-full p-2 pl-10 border bg-white rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </InputGroup>
              )}
            </div>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleAddHoliday}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus size={20} />
                Add to List
              </button>
            </div>
          </div>

          {/* Excel Section */}
          <div className="p-4 border-2 border-dashed rounded-lg">
            <div className="text-center mb-4">
              <p className="font-semibold text-gray-700">
                Or use an Excel file
              </p>
              <p className="text-sm text-gray-500">
                Download the template, fill it out, and upload it here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleDownloadTemplate}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-wait"
              >
                <Download size={18} />
                {downloading ? "Downloading..." : "Download Template"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-wait"
              >
                <Upload size={18} />
                {uploading ? "Parsing File..." : "Upload Excel"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* List of Holidays */}
          <div className="space-y-2">
            {holidays.length > 0 && (
              <>
                <h3 className="font-semibold text-gray-800">
                  Holidays to Add ({holidays.length})
                </h3>
                <ul className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {holidays.map((holiday) => (
                    <li
                      key={holiday.id}
                      className="p-3 flex items-center justify-between gap-4 bg-white"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {holiday.name || holiday.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {holiday.date} ({holiday.year}) - {holiday.type}
                          {holiday.type === "REGIONAL" && `, ${holiday.state}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(holiday.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || holidays.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Submitting..."
              : `Submit ${holidays.length} Holiday(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
