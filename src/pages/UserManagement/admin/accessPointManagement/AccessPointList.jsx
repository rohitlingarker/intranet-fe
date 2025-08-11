import React, { useEffect, useState } from 'react';
import { listAccessPoints, deleteAccessPoint } from '../../../../services/accessPointService';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Button from "../../../../components/Button/Button";
import Pagination from "../../../../components/Pagination/pagination";
 
const AccessPointList = () => {
  const [aps, setAps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 🔹 pagination state
  const itemsPerPage = 6; // 🔹 2 rows of 3 cards
 
  const navigate = useNavigate();
 
  useEffect(() => {
    listAccessPoints().then(res => setAps(res.data));
  }, []);
 
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this access point?')) {
      await deleteAccessPoint(id);
      setAps(prev => prev.filter(ap => ap.access_id !== id));
    }
  };
 
  // 🔹 Pagination logic
  const totalPages = Math.ceil(aps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAps = aps.slice(startIndex, endIndex);
 
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
 
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
 
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Access Points</h2>
      </div>
 
      {aps.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">No access points found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAps.map(ap => (
              <div
                key={ap.access_id}
                className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{ap.endpoint_path}</h3>
                <p className="text-sm text-gray-600 mb-1"><strong>Method:</strong> {ap.method}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Module:</strong> {ap.module}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Public:</strong> {ap.is_public ? 'Yes' : 'No'}</p>
                <p className="text-sm text-gray-600 mb-4"><strong>Permission:</strong> {ap.permission_code || 'N/A'}</p>
 
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/user-management/access-points/${ap.access_id}`)}
                    className="flex items-center w-full justify-center gap-2 bg-green-500 text-white px-2 py-2 rounded-lg hover:bg-green-600 transition-all shadow"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Button>
                  <Button
                    onClick={() => navigate(`/user-management/access-points/edit/${ap.access_id}`)}
                    className="flex items-center w-full justify-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all shadow"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(ap.access_id)}
                    className="flex items-center w-full justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
 
          {/* 🔹 Pagination controls */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
        </>
      )}
    </div>
  );
};
 
export default AccessPointList;