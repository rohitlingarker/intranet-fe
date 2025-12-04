import React, { useState, useEffect, useRef } from "react";
import { Country, State } from "country-state-city";
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
  Download,
  Upload,
  Globe,
} from "lucide-react";
import * as XLSX from "xlsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const InputGroup = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
        {icon}
      </span>
      {children}
    </div>
  </div>
);

export default function AddHolidaysModal({ isOpen, onClose, onSuccess }) {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("NATIONAL");
  const [countryCode, setCountryCode] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const countries = Country.getAllCountries();
  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];

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
      setCountry("");
      setState("");
      setError("");

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (type === "NATIONAL") {
      setState("ALL");
    } else {
      setState("");
    }
  }, [type]);

  // ---------------- Add Manual Holiday ----------------
  const handleAddHoliday = () => {
    setError("");

    if (!date || !description || !country || !state) {
      toast.error("Please fill all required fields.");
      return;
    }

    const newHoliday = {
      id: Date.now(),
      date,
      description,
      type,
      country,
      state,
      year: new Date(date).getFullYear(), // auto year
    };

    setHolidays((prev) => [...prev, newHoliday]);

    setDate("");
    setDescription("");
    setCountry("");
    setState("");
  };

  // ---------------- Remove Holiday ----------------
  const handleRemoveHoliday = (id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  // ---------------- Template Download ----------------
  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/holidays/template/download`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "holiday_template.xlsx";
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download template.");
    } finally {
      setDownloading(false);
    }
  };

  // ---------------- Excel Upload ----------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const parsed = rows.map((row, index) => ({
          id: Date.now() + index,
          date: row.holiday_date,
          description: row.holiday_name,
          type: row.type,
          country: row.country || "India",
          state: row.state || "ALL",
          year: new Date(row.holiday_date).getFullYear(),
        }));

        setHolidays((prev) => [...prev, ...parsed]);
        toast.success(`${parsed.length} holidays imported.`);
      } catch (err) {
        toast.error("Failed to parse Excel.");
      } finally {
        setUploading(false);
        fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // ---------------- Submit ----------------
  const handleSubmit = async () => {
    if (holidays.length === 0) {
      toast.error("Add at least one holiday.");
      return;
    }

    setSubmitting(true);

    const payload = holidays.map(({ id, ...rest }) => ({
      holidayName: rest.description,
      holidayDescription: rest.description,
      holidayDate: rest.date,
      type: rest.type,
      state: rest.state,
      country: rest.country,
      year: new Date(rest.date).getFullYear(),
    }));

    try {
      await axios.post(`${BASE_URL}/api/holidays/add`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Holidays added successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Failed to submit holidays.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Add Holidays</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* ONE SINGLE ENTERPRISE FORM */}
          <div className="bg-gray-50 p-6 rounded-xl border space-y-6">
            <h3 className="font-semibold text-gray-800 border-b pb-2">
              Holiday Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputGroup
                label="Holiday Date *"
                icon={<CalendarDays className="h-5 w-5 text-orange-500" />}
              >
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 pl-10 border rounded"
                />
              </InputGroup>

              <InputGroup
                label="Holiday Name *"
                icon={<Text className="h-5 w-5 text-blue-500" />}
              >
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 pl-10 border rounded"
                  placeholder="e.g., Diwali"
                />
              </InputGroup>

              <InputGroup
                label="Type *"
                icon={<Tag className="h-5 w-5 text-green-500" />}
              >
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 pl-10 border rounded"
                >
                  <option value="NATIONAL">National</option>
                  <option value="REGIONAL">Regional</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
              </InputGroup>

              <InputGroup
                label="Country *"
                icon={<Globe className="h-5 w-5 text-blue-500" />}
              >
                <select
                  value={country}
                  onChange={(e) => {
                    const selected = countries.find(
                      (c) => c.name === e.target.value
                    );
                    setCountry(e.target.value); // Full name → "India"
                    setCountryCode(selected?.isoCode); // ISO → "IN"
                    setState("");
                  }}
                  className="w-full p-2 pl-10 border rounded"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </InputGroup>

              <InputGroup
                label="State *"
                icon={<MapPin className="h-5 w-5 text-red-500" />}
              >
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={`w-full p-2 pl-10 border rounded 
                ${type === "NATIONAL" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={type === "NATIONAL"}
                >
                  {type === "NATIONAL" ? (
                    <option value="ALL">All</option>
                  ) : (
                    <>
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </InputGroup>
            </div>

            <p className="text-xs text-gray-500">
              * Year is automatically derived from the Holiday Date.
            </p>

            <div className="flex justify-center">
              <button
                onClick={handleAddHoliday}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
              >
                <Plus className="inline mr-2" /> Add Holiday
              </button>
            </div>
          </div>

          {/* EXCEL SECTION */}
          <div className="p-4 border-dashed border-2 rounded-lg text-center">
            <p className="font-semibold">Or import using Excel</p>
            <p className="text-gray-500 text-sm">Download → Fill → Upload</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
              <button
                onClick={handleDownloadTemplate}
                disabled={downloading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                <Download size={18} className="inline mr-2" />
                {downloading ? "Downloading..." : "Download Template"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <Upload size={18} className="inline mr-2" />
                {uploading ? "Processing..." : "Upload Excel"}
              </button>
            </div>
          </div>

          {/* ERRORS */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>
          )}

          {/* HOLIDAY LIST */}
          {holidays.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">
                Holidays Added ({holidays.length})
              </h3>
              <ul className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {holidays.map((h) => (
                  <li
                    key={h.id}
                    className="p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{h.description}</p>
                      <p className="text-sm text-gray-600">
                        {h.date} ({h.year}) - {h.type}{" "}
                        {h.state && `, ${h.state}`}
                      </p>
                    </div>

                    <button
                      className="text-red-600 hover:bg-red-100 p-2 rounded-full"
                      onClick={() => handleRemoveHoliday(h.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || holidays.length === 0}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
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
