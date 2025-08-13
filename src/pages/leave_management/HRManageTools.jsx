import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddEmployeeModal from "./models/AddEmployeeModal";
import AddLeaveTypeModal from "./models/AddLeaveTypeModal";
import { Trash } from "lucide-react";
import ActionDropdown from "./models/ActionDropdownHrTools";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
 
const HRManageTools = ({ user }) => {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddLeaveTypeModalOpen, setIsAddLeaveTypeModalOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [editLeaveType, setEditLeaveType] = useState(null);
  const navigate = useNavigate();
 
  const isHR = user?.role?.toLowerCase() === "hr";
 
  useEffect(() => {
    fetchLeaveTypes();
  }, []);
 
  const fetchLeaveTypes = () => {
    axios
      .get("http://localhost:8080/api/leave/get-all-leave-types")
      .then((res) => setLeaveTypes(res.data))
      .catch((err) => console.error("Failed to fetch leave types", err));
  };
 
  if (!isHR) {
    return (
      <div className="text-red-600 font-semibold p-4">
        Access Denied: HR Only
      </div>
    );
  }
 
 const handleDeleteLeaveType = async (leaveTypeId) => {
  try {
    await axios.delete(
      `http://localhost:8080/api/leave/delete-leave-type/${leaveTypeId}`
    );
    toast.success("Leave type deleted successfully");
 
    // Remove deleted leave from UI without refetching
    setLeaveTypes(prev => prev.filter(lt => lt.leaveTypeId !== leaveTypeId));
 
    // Or, if you want to ensure fresh data from backend:
    // fetchLeaveTypes();
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error("Failed to delete leave type");
  }
};
 
 
  // useEffect(()=>{
  //   fetchLeaveTypes()
  // })
 
  // Extract unique keys from the first item
  const tableHeaders = leaveTypes.length > 0 ? Object.keys(leaveTypes[0]) : [];
  console.log("hhaja", leaveTypes);
 
  return (
    <div className="space-y-6 py-6 px-6">
      <h1 className="text-2xl font-bold text-gray-800">HR Tools</h1>
      <p className="text-gray-600 mb-2">Manage employees and leave types.</p>
 
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button
          onClick={() => setIsAddEmployeeModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add Employee
        </button>
        <button
          onClick={() => {
            setEditLeaveType(null);
            setIsAddLeaveTypeModalOpen(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Leave Type
        </button>
        <button
          onClick={() => navigate("/employee-leave-balance")}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Edit Leave Balance
        </button>
      </div>
 
      <div className="overflow-x-auto border rounded-md max-w-full">
        <table className="min-w-max text-sm text-left border-collapse relative w-[800px]">
          <thead className="bg-gray-100 text-base">
            <tr>
              {tableHeaders.map((header, i) => (
                <th
                  key={header}
                  className={`border px-4 py-3 min-w-[200px] capitalize bg-gray-100 ${
                    i === 0
                      ? "sticky left-0 z-20" // First column
                      : i === 1
                      ? "sticky left-[200px] z-20" // Second column
                      : ""
                  }`}
                >
                  {header}
                </th>
              ))}
              <th className="border px-4 py-3 min-w-[160px] bg-gray-100 z-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHeaders.length + 1}
                  className="text-center py-6 text-gray-500"
                >
                  No leave types found.
                </td>
              </tr>
            ) : (
              leaveTypes.map((lt, index) => (
                <tr key={index} className="border-t">
                  {tableHeaders.map((key, i) => (
                    <td
                      key={key}
                      className={`border px-4 py-2 min-w-[200px] bg-white ${
                        i === 0
                          ? "sticky left-0 z-10" // First column body
                          : i === 1
                          ? "sticky left-[200px] z-10" // Second column body
                          : ""
                      }`}
                    >
                      {String(lt[key])}
                    </td>
                  ))}
                  <td className="border px-4 py-2 min-w-[160px] bg-white">
                    <ActionDropdown
                      onEdit={() => {
                        setEditLeaveType(lt);
                        setIsAddLeaveTypeModalOpen(true);
                      }}
                      onDelete={() => handleDeleteLeaveType(lt.leaveTypeId)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
 
      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
      />
      <AddLeaveTypeModal
        isOpen={isAddLeaveTypeModalOpen}
        onClose={() => {
          setIsAddLeaveTypeModalOpen(false);
          setEditLeaveType(null);
        }}
        editData={editLeaveType}
        onSuccess={() => {
          fetchLeaveTypes();
          setEditLeaveType(null);
          setIsAddLeaveTypeModalOpen(false);
        }}
      />
    </div>
  );
};
 
export default HRManageTools;