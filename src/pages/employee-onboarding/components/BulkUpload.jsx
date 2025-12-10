"use client";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function BulkUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  // ---------------------------
  // File Select Handler
  // ---------------------------
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    const validExtensions = ["xlsx", "xls", "csv"];
    const ext = selected.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      toast.error("❌ Invalid file format. Upload .xlsx / .xls / .csv only.");
      return;
    }

    setFile(selected);
  };

  // ---------------------------
  // Submit File to API
  // ---------------------------
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setResult(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/bulk_create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(res.data);

      toast.success("✔ Bulk upload completed!", { autoClose: 1500 });

    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed", {
        autoClose: 1500,
      });
    }

    setUploading(false);
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

      <h1 className="text-2xl font-semibold mb-2">Bulk Upload Offer Letters</h1>
      <p className="text-gray-600 mb-6">
        Upload an Excel file (.xlsx / .xls / .csv) to create multiple offers at once.
      </p>

      {/* File Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
          id="fileUpload"
        />

        <label
          htmlFor="fileUpload"
          className="cursor-pointer text-blue-600 hover:underline"
        >
          {file ? (
            <span className="text-green-600 font-semibold">{file.name}</span>
          ) : (
            "Click to choose an Excel file"
          )}
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={resetForm}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Reset
        </button>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Results Summary */}
      {result && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border">
          <h2 className="text-xl font-semibold mb-3">Upload Summary</h2>

          <div className="grid grid-cols-2 gap-4 text-gray-800">
            <p>Total Rows: <strong>{result.total_rows}</strong></p>
            <p>Processed Rows: <strong>{result.processed_rows}</strong></p>
            <p>Success Count: <strong className="text-green-600">{result.successful_count}</strong></p>
            <p>Failed Count: <strong className="text-red-600">{result.failed_count}</strong></p>
            <p>Skipped Rows: <strong>{result.skipped_rows}</strong></p>
          </div>

          {/* Failed List */}
          {result.failed_offers?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-red-600 mb-2">Failed Entries</h3>
              <ul className="text-sm text-gray-700 bg-white p-3 rounded-lg border max-h-40 overflow-auto">
                {result.failed_offers.map((fail, idx) => (
                  <li key={idx} className="py-1 border-b last:border-0">
                    Row {fail.row}: {fail.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
