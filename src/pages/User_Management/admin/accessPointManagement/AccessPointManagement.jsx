import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccessPointList from './AccessPointList';

export default function AccessPointManagement() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Access Point Management</h2>
          <p className="mt-2 text-gray-600">Manage access points here.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/user-management/access-points/create')}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow"
          >
            + Add New
          </button>
          <button
            onClick={() => navigate('/admin/access-point-mapping')}
            className="bg-pink-900 text-white px-4 py-2 rounded-lg hover:bg-pink-900 transition-all shadow"
          >
            Mapping Permission
          </button>
        </div>
      </div>
      <AccessPointList />
    </div>
  );
}
