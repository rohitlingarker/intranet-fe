import React, { useEffect, useState, useMemo } from 'react';
import { listAccessPoints, deleteAccessPoint } from '../../../../services/accessPointService';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Button from "../../../../components/Button/Button";
import Pagination from "../../../../components/Pagination/pagination";
import Modal from '../../../../components/Modal/modal';
import { showStatusToast } from '../../../../components/toastfy/toast';

// ✅ Accept searchTerm prop
const AccessPointList = ({ searchTerm }) => { 
  const [aps, setAps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccessPointId, setSelectedAccessPointId] = useState(null);
  const itemsPerPage = 6;
 
  const navigate = useNavigate();
 
  useEffect(() => {
    listAccessPoints().then(res => setAps(res.data));
  }, []);

  // ✅ 1. Filter the Access Points based on the search term
  const filteredAps = useMemo(() => {
    if (!searchTerm) return aps;

    const lowerCaseSearch = searchTerm.toLowerCase();

    return aps.filter(ap => 
      ap.endpoint_path.toLowerCase().includes(lowerCaseSearch) ||
      ap.module.toLowerCase().includes(lowerCaseSearch)
    );
  }, [aps, searchTerm]); // Recalculate whenever aps or searchTerm changes

  // ✅ 2. Reset pagination whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDeleteClick = (id) => {
    setSelectedAccessPointId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAccessPoint(selectedAccessPointId);
      // Update the main list of access points
      setAps((prev) => prev.filter((ap) => ap.access_uuid !== selectedAccessPointId));
      showStatusToast("Access Point Successfully deleted", "success");
    } catch (err) {
      showStatusToast("Failed to delete access point", "error");
    } finally {
      setShowDeleteModal(false);
      setSelectedAccessPointId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAccessPointId(null);
  };

  // ✅ Use filteredAps for pagination calculations
  const totalPages = Math.ceil(filteredAps.length / itemsPerPage); 
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAps = filteredAps.slice(startIndex, endIndex); // ✅ Paginate the filtered list
 
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
 
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
 
  return (
    <div className="bg-gray-100 min-h-screen -mx-6 -mt-6 p-6"> {/* Remove padding/margins handled by parent */}
      
      {/* Check the filtered length for empty state */}
      {filteredAps.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          {searchTerm 
            ? `No access points found matching "${searchTerm}".`
            : "Loading..."
          }
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Map over the paginated filtered list */}
            {paginatedAps.map(ap => (
              <div
                key={ap.access_uuid}
                className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border flex flex-col"
              >
                {/* ... Card content remains the same ... */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3 break-words overflow-wrap-anywhere">
                  {ap.endpoint_path}
                </h3>
                
                <div className="flex-grow mb-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong className="font-medium">Method:</strong> 
                    <span className="ml-1">{ap.method}</span>
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    <strong className="font-medium">Module:</strong> 
                    <span className="ml-1">{ap.module}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong className="font-medium">Public:</strong> 
                    <span className="ml-1">{ap.is_public ? 'Yes' : 'No'}</span>
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    <strong className="font-medium">Permission:</strong> 
                    <span className="ml-1">{ap.permission_code || 'N/A'}</span>
                  </p>
                </div>
 
                {/* Action buttons */}
                <div className="space-y-2 mt-auto">
                  <Button
                    onClick={() => navigate(`/user-management/access-points/${ap.access_uuid}`)}
                    className="flex items-center w-full justify-center gap-2 bg-green-500 text-white px-2 py-2 rounded-lg hover:bg-green-600 transition-all shadow"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Button>
                  <Button
                    onClick={() => navigate(`/user-management/access-points/edit/${ap.access_uuid}`)}
                    className="flex items-center w-full justify-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all shadow"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(ap.access_uuid)}
                    className="flex items-center w-full justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
 
          {/* Pagination controls */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title="Confirm Deletion"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-6">
            Please confirm you really want to delete the access point
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleCancelDelete}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
 
export default AccessPointList;