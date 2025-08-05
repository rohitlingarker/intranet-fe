import React, { useEffect, useState } from 'react';
import { getAccessPoint } from '../../../services/accessPointService';
import { useParams } from 'react-router-dom';

const AccessPointDetails = () => {
  const { access_id } = useParams();
  const [ap, setAp] = useState(null);

  useEffect(() => {
    getAccessPoint(access_id).then(res => setAp(res.data));
  }, [access_id]);

  if (!ap) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-6 text-center">🔍 Access Point Details</h2>
      
      <div className="space-y-4 text-gray-800">
        <p>
          <span className="font-medium text-gray-600">🔗 Path:</span> {ap.endpoint_path}
        </p>
        <p>
          <span className="font-medium text-gray-600">⚙️ Method:</span> {ap.method}
        </p>
        <p>
          <span className="font-medium text-gray-600">📦 Module:</span> {ap.module}
        </p>
        <p>
          <span className="font-medium text-gray-600">🌐 Public:</span> {ap.is_public ? 'Yes' : 'No'}
        </p>
        <p>
          <span className="font-medium text-gray-600">🛡️ Permission:</span> {ap.permission_code || 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default AccessPointDetails;
