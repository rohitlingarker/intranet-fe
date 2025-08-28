import { useState } from "react";
import { getPermissionsByRole } from "../../../../services/roleManagementService";
import Button from "../../../../components/Button/Button";
import Pagination from "../../../../components/Pagination/pagination"; // ✅ Import Pagination
import { showStatusToast } from "../../../../components/toastfy/toast";
const PermissionManagement = ({ roles }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showRoleList, setShowRoleList] = useState(false);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleShowRoleList = () => {
    setShowRoleList(true);
  };

  const handleRoleSelect = async (role) => {
    setShowRoleList(false);
    setSelectedRole(role);
    try {
      const res = await getPermissionsByRole(role.role_id);
      setRolePermissions(res.data);
      setShowPermissions(true);
      setCurrentPage(1); // ✅ Reset to first page when role changes
    } catch (err) {
      setShowPermissions(false);
      showStatusToast("Failed to fetch permissions for this role", "error");
    }
  };

  // ✅ Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPermissions = rolePermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rolePermissions.length / itemsPerPage);

  return (
    <div className="space-y-8">
      {/* Permission Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-700">Permission by Role</h3>
          <Button size="medium" variant="primary" onClick={handleShowRoleList}>
            View
          </Button>
        </div>

        {/* Role List Modal/Section */}
        {showRoleList && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Select a Role</h3>
              <button
                onClick={() => setShowRoleList(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </div>
            {roles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No roles found.</p>
            ) : (
              <ul className="space-y-2">
                {roles.map((role) => (
                  <li
                    key={role.role_id}
                    className="flex justify-between items-center p-3 border rounded-md bg-gray-50 cursor-pointer hover:bg-blue-100"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <span className="font-medium text-gray-800">{role.role_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Permissions Display Section */}
        {showPermissions && selectedRole && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">
                Permissions for Role: {selectedRole.role_name}
              </h3>
              <button
                onClick={() => setShowPermissions(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </div>

            {rolePermissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No permissions assigned to this role.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {currentPermissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-md bg-gray-50"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{permission.code}</span>
                        {permission.description && (
                          <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Pagination Component */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;
