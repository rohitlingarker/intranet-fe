import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  listAccessPointsumapped,
  deleteAccessPoint,
  getUnmappedPermissions,
  assignPermissionToAccessPoint,
} from '../../../../services/accessPointService';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Plus, Trash2, X, Search } from 'lucide-react'; // ✅ Import Search icon
import Button from "../../../../components/Button/Button";
import Navbar from "../../../../components/Navbar/Navbar";
import Pagination from "../../../../components/Pagination/pagination";
import Modal from '../../../../components/Modal/modal';
import { showStatusToast } from "../../../../components/toastfy/toast"; 

const AccessPointMapping = () => {
  const [aps, setAps] = useState([]);
  const [unmappedPermissions, setUnmappedPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState(null);
  const [selectedAccessPointId, setSelectedAccessPointId] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // ✅ New state for search term
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const cardsPerPage = 6;
 
  const navigate = useNavigate();
  const location = useLocation();
 
  const navItems = [
    {
      name: "Access Points",
      onClick: () => navigate("/user-management/access-points"),
      isActive: location.pathname === "/user-management/access-points",
    },
    {
      name: "Add New",
      onClick: () => navigate("/user-management/access-points/create"),
      isActive: location.pathname === "/user-management/access-points/create",
    },
    {
      name: "Permission Mapping",
      onClick: () => navigate("/user-management/access-points/admin/access-point-mapping"),
      isActive: location.pathname === "/user-management/access-points/admin/access-point-mapping",
    },
  ];
 
  const fetchData = () => {
    listAccessPointsumapped().then(res => {
      setAps(res.data);
      setCurrentPage(1);
    });
  }

  useEffect(() => {
    fetchData();
  }, []);
 
  // ✅ Filter the Access Points based on the search term (endpoint or module)
  const filteredAps = useMemo(() => {
    if (!searchTerm) return aps;

    const lowerCaseSearch = searchTerm.toLowerCase();

    return aps.filter(ap => 
      ap.endpoint_path.toLowerCase().includes(lowerCaseSearch) ||
      ap.module.toLowerCase().includes(lowerCaseSearch)
    );
  }, [aps, searchTerm]); 
 
  // ✅ Reset pagination whenever the search term changes
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
      setAps((prev) => prev.filter((ap) => ap.access_id !== selectedAccessPointId));
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
 
  const handleAddPermission = async (accessPoint) => {
    setSelectedAccessPoint(accessPoint);
    setSelectedPermission(null);
    setLoading(true);
    try {
      const response = await getUnmappedPermissions();
      setUnmappedPermissions(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching unmapped permissions:', error);
      showStatusToast('Failed to load permissions', 'error');
    } finally {
      setLoading(false);
    }
  };
 
  const handleAssignPermission = async () => {
    if (!selectedPermission) {
      showStatusToast('Please select a permission', 'error');
      return;
    }
    setLoading(true);
    try {
      await assignPermissionToAccessPoint(
        selectedAccessPoint.access_id,
        selectedPermission.permission_id
      );
      showStatusToast('Permission assigned successfully!', 'success');
      setShowModal(false);
      // Re-fetch the unmapped list to reflect the change
      fetchData(); 
    } catch (error) {
      console.error('Error assigning permission:', error);
      showStatusToast('Failed to assign permission', 'error');
    } finally {
      setLoading(false);
    }
  };
 
  // ✅ Use filteredAps for pagination calculations and display
  const totalPages = Math.ceil(filteredAps.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredAps.slice(indexOfFirstCard, indexOfLastCard);
 
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
 
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
 
  return (
    <div>
      <Navbar logo="Access Points" navItems={navItems} />
 
      <div className="p-6 bg-gray-100 min-h-screen">
        
        {/* ✅ Sticky Search Bar Container */}
        <div className="sticky top-0 z-10 bg-gray-100 pb-4 pt-1 -mx-6 px-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-700">Access Point Mapping</h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Search endpoint or module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>
 
        {/* ✅ Use filteredAps length for empty state check */}
        {filteredAps.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            {searchTerm 
              ? `No unmapped access points found matching "${searchTerm}".`
              : "No unmapped access points found."
            }
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Map over currentCards (which is based on filteredAps) */}
              {currentCards.map((ap) => (
                <div
                  key={ap.access_id}
                  className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border flex flex-col"
                >
                  {/* Endpoint path with word wrapping */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 break-words overflow-wrap-anywhere">
                    {ap.endpoint_path}
                  </h3>
                  
                  {/* Details section with consistent spacing */}
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
                      onClick={() => navigate(`/user-management/access-points/${ap.access_id}`)}
                      className="flex items-center w-full justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all shadow"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Button>
                    <Button
                      onClick={() => handleAddPermission(ap)}
                      disabled={loading}
                      className="flex items-center w-full justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all shadow disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(ap.access_id)}
                      className="flex items-center w-full justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
 
            {filteredAps.length > cardsPerPage && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              </div>
            )}
          </>
        )}
 
        {/* Permission Assignment Modal (remains the same) */}
        {showModal && (
          <PermissionModal
            unmappedPermissions={unmappedPermissions}
            selectedAccessPoint={selectedAccessPoint}
            selectedPermission={selectedPermission}
            setSelectedPermission={setSelectedPermission}
            onClose={() => setShowModal(false)}
            onAssign={handleAssignPermission}
            loading={loading}
          />
        )}

        {/* Delete Confirmation Modal (remains the same) */}
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
    </div>
  );
};
 
const formatCode = (p) => p?.code ?? p?.permission_code ?? '(no code)';
const formatDesc = (p) => p?.description ?? p?.permission_description ?? '';
 
const PermissionModal = ({
  unmappedPermissions,
  selectedAccessPoint,
  selectedPermission,
  setSelectedPermission,
  onClose,
  onAssign,
  loading,
}) => {
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);
 
  const filtered = useMemo(() => {
    if (!query.trim()) return unmappedPermissions;
    const q = query.toLowerCase();
    return unmappedPermissions.filter(
      (p) =>
        formatCode(p).toLowerCase().includes(q) ||
        formatDesc(p).toLowerCase().includes(q)
    );
  }, [unmappedPermissions, query]);
 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Close logic if needed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Assign Permission</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
 
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 break-words">
            <strong>Access Point:</strong> {selectedAccessPoint?.endpoint_path}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Method:</strong> {selectedAccessPoint?.method}
          </p>
        </div>
 
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Permission:
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={
                  selectedPermission
                    ? `${formatCode(selectedPermission)} — ${formatDesc(selectedPermission)}`
                    : query
                }
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedPermission(null);
                }}
                placeholder="Search permissions..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => {
                  setQuery('');
                  setSelectedPermission(null);
                }}
                type="button"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
 
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-auto bg-white shadow-sm">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No matching permissions
                </div>
              ) : (
                filtered.map((permission) => (
                  <div
                    key={permission.permission_id}
                    onClick={() => {
                      setSelectedPermission(permission);
                      setQuery('');
                    }}
                    className={`cursor-pointer px-4 py-3 hover:bg-indigo-50 flex flex-col transition ${
                      selectedPermission?.permission_id === permission.permission_id
                        ? 'bg-indigo-100'
                        : ''
                    }`}
                  >
                    <div className="font-semibold text-sm truncate text-gray-900">
                      {formatCode(permission)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {formatDesc(permission)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
 
        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onAssign}
            disabled={!selectedPermission || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Permission'}
          </Button>
        </div>
      </div>
    </div>
  );
};
 
export default AccessPointMapping;