import { useState } from "react";
import { getPermissionsByRole } from "../../../../services/roleManagementService";

const PermissionManagement = ({ roles }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showRoleList, setShowRoleList] = useState(false);

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
    } catch (err) {
      setShowPermissions(false);
      alert("Failed to fetch permissions for this role");
    }
  };

  return (
    <div className="space-y-8">
      {/* Permission Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-700">Permission by Role</h3>
          <button 
            onClick={handleShowRoleList}
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
          >
            View
          </button>
        </div>

        {/* Role List Modal/Section for Permission by Role */}
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

        {/* Permissions Display Section (for Permission by Role) */}
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
              <p className="text-gray-500 text-center py-4">No permissions assigned to this role.</p>
            ) : (
              <div className="space-y-2">
                {rolePermissions.map((permission, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-800">{permission.code}</span>
                      {permission.description && (
                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;