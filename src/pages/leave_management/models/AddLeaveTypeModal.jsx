import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import axios from 'axios';

const defaultForm = {
  leaveTypeId: '',
  leaveName: '',
  description: '',
  maxDaysPerYear: '',
  maxCarryForward: '',
  requiresDocumentation: false,
  accrualRate: '',
  accrualFrequency: '',
  expiryDays: '',
  waitingPeriodDays: '',
  advanceNoticeDays: '',
  pastDateLimitDays: '',
  allowHalfDay: true,
  allowNegativeBalance: false,
  noticePeriodRestriction: false
};

const AddLeaveTypeModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Numeric fields as numbers or null
    const payload = {
      ...formData,
      maxDaysPerYear: formData.maxDaysPerYear === '' ? null : Number(formData.maxDaysPerYear),
      maxCarryForward: formData.maxCarryForward === '' ? 0 : Number(formData.maxCarryForward),
      accrualRate: formData.accrualRate === '' ? null : Number(formData.accrualRate),
      expiryDays: formData.expiryDays === '' ? null : Number(formData.expiryDays),
      waitingPeriodDays: formData.waitingPeriodDays === '' ? 0 : Number(formData.waitingPeriodDays),
      advanceNoticeDays: formData.advanceNoticeDays === '' ? 0 : Number(formData.advanceNoticeDays),
      pastDateLimitDays: formData.pastDateLimitDays === '' ? 0 : Number(formData.pastDateLimitDays),
    };

    try {
      await axios.post('http://localhost:8080/api/leave/add-leave-type', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      setSuccess('Leave type added successfully!');
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1000);
      setFormData(defaultForm);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to add leave type"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Leave Type</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">

          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Short Name*</label>
              <input
                name="leaveTypeId" type="text" required value={formData.leaveTypeId} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Sick Leave"
              />
            </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Name *</label>
              <input
                name="leaveName" type="text" required value={formData.leaveName} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Sick Leave"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Days Per Year</label>
              <input
                name="maxDaysPerYear" type="number" min="0" value={formData.maxDaysPerYear} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Carry Forward</label>
              <input
                name="maxCarryForward" type="number" min="0"
                value={formData.maxCarryForward}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Rate</label>
              <input
                name="accrualRate" type="number" step="0.01" min="0"
                value={formData.accrualRate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 1.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Frequency</label>
              <input
                name="accrualFrequency" type="text"
                value={formData.accrualFrequency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Monthly/Yearly"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Days</label>
              <input
                name="expiryDays" type="number" min="0"
                value={formData.expiryDays} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 365"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description" rows={2} value={formData.description} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Describe the leave type"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waiting Period Days</label>
              <input
                name="waitingPeriodDays" type="number" min="0"
                value={formData.waitingPeriodDays} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Notice Days</label>
              <input
                name="advanceNoticeDays" type="number" min="0"
                value={formData.advanceNoticeDays} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Past Date Limit Days</label>
              <input
                name="pastDateLimitDays" type="number" min="0"
                value={formData.pastDateLimitDays} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Booleans */}
          <div className="grid gap-1 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <input
                id="requiresDocumentation"
                type="checkbox"
                name="requiresDocumentation"
                checked={formData.requiresDocumentation}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="requiresDocumentation" className="text-sm font-medium text-gray-700">
                Requires Documentation
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="allowHalfDay"
                type="checkbox"
                name="allowHalfDay"
                checked={formData.allowHalfDay}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="allowHalfDay" className="text-sm font-medium text-gray-700">
                Allow Half Day
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="allowNegativeBalance"
                type="checkbox"
                name="allowNegativeBalance"
                checked={formData.allowNegativeBalance}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="allowNegativeBalance" className="text-sm font-medium text-gray-700">
                Allow Negative Balance
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="noticePeriodRestriction"
                type="checkbox"
                name="noticePeriodRestriction"
                checked={formData.noticePeriodRestriction}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="noticePeriodRestriction" className="text-sm font-medium text-gray-700">
                Notice Period Restriction
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-gray-800 border border-gray-300 hover:bg-gray-100 font-medium transition-colors"
              disabled={loading}
            >Cancel</button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
              disabled={loading}
            >{loading ? "Adding..." : "Add Leave Type"}</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddLeaveTypeModal;
