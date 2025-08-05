import React, { useEffect, useState } from 'react';
import { getAccessPoint, updateAccessPoint, listModules } from '../../../services/accessPointService';
import { useParams, useNavigate } from 'react-router-dom';

const AccessPointEdit = () => {
  const { access_id } = useParams();
  const [form, setForm] = useState(null);
  const [modules, setModules] = useState([]);
  const [accessPointData, setAccessPointData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch modules list
    listModules().then(res => {
      setModules(res.data);
    });

    // Fetch existing access point data
    getAccessPoint(access_id).then(res => {
      setAccessPointData(res.data);
      setForm({
        endpoint_path: res.data.endpoint_path,
        method: res.data.method,
        module: res.data.module,
        is_public: res.data.is_public,
      });
    });
  }, [access_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateAccessPoint(access_id, form);
    navigate('/user-management/access-points');
  };

  const handleDeletePermission = async () => {
    if (!accessPointData?.permission_id) return;
    
    setIsDeleting(true);
    try {
      // Call the unmap permission API
      const response = await fetch(`http://localhost:8000/admin/access-points/${access_id}/unmap-permission/${accessPointData.permission_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh the access point data to reflect the change
        const updatedData = await getAccessPoint(access_id);
        setAccessPointData(updatedData.data);
      } else {
        console.error('Failed to delete permission');
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!form) return <div className="text-center mt-10 text-gray-600 text-lg">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-blue-600 text-center">Edit Access Point</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Endpoint Path</label>
          <input
            name="endpoint_path"
            value={form.endpoint_path}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">Method</label>
          <select
            name="method"
            value={form.method}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">Module</label>
          <select
            name="module"
            value={form.module}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Module</option>
            {modules.map((mod, idx) => (
              <option key={idx} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_public"
            checked={form.is_public}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600"
          />
          <label className="text-gray-700 font-medium">Public</label>
        </div>

        {/* Permission Display with Delete Button */}
        {accessPointData && accessPointData.permission_code && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-800">
                Permission: {accessPointData.permission_code}
              </span>
              <button
                type="button"
                onClick={handleDeletePermission}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default AccessPointEdit;
