import { useState } from "react";
import { getPermissionsByRole } from "../../../../services/roleManagementService";
import Pagination from "../../../../components/Pagination/pagination";
import { showStatusToast } from "../../../../components/toastfy/toast";

const PermissionManagement = ({ roles }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ✅ Pagination states for roles
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Pagination states for permissions inside modal
  const [permCurrentPage, setPermCurrentPage] = useState(1);
  const permItemsPerPage = 5;

  // ✅ Filter roles by search
  const filteredRoles = roles.filter((role) =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Fetch permissions when a role is selected
  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setLoading(true);
    setShowModal(true);
    try {
      const res = await getPermissionsByRole(role.role_uuid);
      setRolePermissions(res.data || []);
      setPermCurrentPage(1);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      showStatusToast("Failed to fetch permissions for this role", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Permission pagination logic
  const indexOfLastPerm = permCurrentPage * permItemsPerPage;
  const indexOfFirstPerm = indexOfLastPerm - permItemsPerPage;
  const currentPermissions = rolePermissions.slice(indexOfFirstPerm, indexOfLastPerm);
  const totalPermPages = Math.ceil(rolePermissions.length / permItemsPerPage);

  return (
    <div className="space-y-8">
      {/* Permission Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Permission by Role
          </h3>
          <input
            type="text"
            placeholder="Search role..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-64"
          />
        </div>

        {/* Role List Display */}
        {roles.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No roles found.</p>
        ) : (
          <div>
            <ul className="space-y-2">
              {currentRoles.map((role) => (
                <li
                  key={role.role_uuid}
                  className={`flex justify-between items-center p-3 border rounded-md cursor-pointer ${
                    selectedRole?.role_uuid === role.role_uuid
                      ? "bg-blue-100 border-blue-300"
                      : "bg-gray-50 hover:bg-blue-50"
                  }`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <span className="font-medium text-gray-800">
                    {role.role_name}
                  </span>
                </li>
              ))}
            </ul>

            {/* ✅ Role Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevious={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  onNext={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Modal for Permissions Display */}
      {showModal && selectedRole && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Permissions for Role: {selectedRole.role_name}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRole(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500 text-center py-4">
                Loading permissions...
              </p>
            ) : rolePermissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No permissions assigned to this role.
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {currentPermissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-md bg-gray-50"
                    >
                      <div>
                        <span className="font-medium text-gray-800">
                          {permission.code}
                        </span>
                        {permission.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Permissions Pagination */}
                {totalPermPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={permCurrentPage}
                      totalPages={totalPermPages}
                      onPrevious={() =>
                        setPermCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      onNext={() =>
                        setPermCurrentPage((prev) =>
                          Math.min(prev + 1, totalPermPages)
                        )
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;
