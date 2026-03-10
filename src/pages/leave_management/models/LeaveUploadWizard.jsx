import React, { useState } from 'react';
import axios from 'axios';
import { X, FileText, UploadCloud, Download, CheckCircle2 } from 'lucide-react'; 
import ConfirmationModal from './ConfirmationModal';

const LeaveUploadWizard = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Download logic
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/leave-balance/download-template`, 
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Leave_Balance_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download template.");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById('excel-upload');
    if (fileInput) fileInput.value = "";
  };

  const onConfirmUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', 'admin');

    setIsUploading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/leave-balance/upload-accruals`, 
        formData
      );
      alert(res.data.message);
      onClose(); 
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg = errorData?.errors?.map(e => `Row ${e.rowNumber}: ${e.message}`).join('\n');
      alert(`Upload failed!\n${errorMsg || errorData.message}`);
    } finally {
      setIsUploading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Bulk Accrual Update</h2>
          <p className="text-xs text-gray-500 mt-1">Update employee leave balances via Excel</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-8">
        {/* Step 1: Download Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
            <h3 className="text-sm font-semibold text-gray-700">Download Template</h3>
          </div>
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center w-full gap-2 py-3 px-4 border-2 border-blue-100 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all font-medium text-sm"
          >
            <Download className="h-4 w-4" />
            Download Leave_Template.xlsx
          </button>
        </div>

        {/* Step 2: Upload Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
            <h3 className="text-sm font-semibold text-gray-700">Upload Completed File</h3>
          </div>

          {!file ? (
            <label className="group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform mb-3">
                  <UploadCloud className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Click or drag to upload</p>
                <p className="text-xs text-gray-400 mt-1">Support for .xlsx, .xls</p>
              </div>
              <input id="excel-upload" type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          ) : (
            <div className="relative group p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-900 truncate">{file.name}</p>
                <p className="text-xs text-green-600 font-medium">Ready for sync</p>
              </div>
              <button onClick={handleRemoveFile} className="p-1.5 hover:bg-green-100 rounded-md text-green-700 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
        <button 
          onClick={onClose} 
          className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => setShowConfirm(true)} 
          disabled={!file || isUploading} 
          className={`flex items-center gap-2 px-8 py-2.5 text-sm font-bold rounded-xl transition-all shadow-md ${
            !file || isUploading 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isUploading ? 'Processing...' : 'Sync Data'}
        </button>
      </div>

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm} 
          title="Sync Leave Balances"
          onConfirm={onConfirmUpload} 
          onCancel={() => setShowConfirm(false)} 
          message="Proceeding will update all employee records in the Excel. Ensure the data is accurate before confirming." 
        />
      )}
    </div>
  );
};

export default LeaveUploadWizard;