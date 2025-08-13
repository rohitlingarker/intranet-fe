import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    phone: '',
    hireDate: '',
    jobTitle: '',
    managerId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Prepare payload to match backend
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      gender: formData.gender,
      phone: formData.phone,
      hireDate: formData.hireDate,
      jobTitle: formData.jobTitle,
      password: formData.password,
      managerId: formData.managerId, // Uncomment if backend expects managerId as string
      // manager: { employeeId: formData.managerId } // Uncomment if backend expects object
    };
    if (formData.managerId) {
      payload.managerId = { employeeId: formData.managerId }; // assuming manager expects an employee object.
    }
    try {
      await axios.post(`${BASE_URL}/api/employee/register`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      setSuccess('Employee added successfully!');
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1000);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        phone: '',
        hireDate: '',
        jobTitle: '',
        managerId: '',
        password: '',
      });
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to add employee. Please try again!'
      );
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData, [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2">
      <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <User className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Employee</h2>
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
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text" name="firstName" value={formData.firstName}
                onChange={handleChange} required
                className="input"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text" name="lastName" value={formData.lastName}
                onChange={handleChange} required
                className="input"
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                name="gender" value={formData.gender}
                onChange={handleChange} required
                className="input"
              >
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel" name="phone" value={formData.phone}
                onChange={handleChange} maxLength={10}
                className="input"
                placeholder="Optional"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required
                className="input"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <input
                type="date" name="hireDate" value={formData.hireDate}
                onChange={handleChange} required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text" name="jobTitle" value={formData.jobTitle}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Software Engineer"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager Employee ID
              </label>
              <input
                type="text" name="managerId" value={formData.managerId}
                onChange={handleChange}
                className="input"
                placeholder="Ex: PAVEMP12345"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password" name="password" value={formData.password}     
                onChange={handleChange} 
                className="input"
                placeholder="Enter password"
              />
          </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
      {/* Tailwind CSS input and btn class shorthands for clarity */}
      <style>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #D1D5DB;
          border-radius: 0.5rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
          font-size: 1rem;
        }
        .input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 2px #6366F133;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: background 0.2s, color 0.2s;
        }
      `}</style>
    </div>
  );
};

export default AddEmployeeModal;
