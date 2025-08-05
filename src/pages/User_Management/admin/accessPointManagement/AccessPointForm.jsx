import React, { useState } from 'react';
import { createAccessPoint } from '../../../services/accessPointService';
import { useNavigate } from 'react-router-dom';

const AccessPointForm = () => {
  const [form, setForm] = useState({ endpoint_path: '', method: 'GET', module: '', is_public: false });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAccessPoint(form);
    navigate('/user-management/access-points');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Access Point</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Endpoint Path</label>
          <input
            name="endpoint_path"
            value={form.endpoint_path}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-300"
            placeholder="/api/resource"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Method</label>
          <select
            name="method"
            value={form.method}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Module</label>
          <input
            name="module"
            value={form.module}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Auth Management"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_public"
            checked={form.is_public}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-gray-700 font-medium">Public</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default AccessPointForm;
