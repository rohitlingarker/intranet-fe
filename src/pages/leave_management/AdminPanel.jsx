import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Clock, Check, Calendar, User, Search, X, Hand } from "lucide-react";
import AddEmployeeModal from "../../components/leave-management/models/AddEmployeeModal";
import AddLeaveTypeModal from "../../components/leave-management/models/AddLeaveTypeModal";
import ActionDropdown from "../../components/leave-management/models/ActionDropdown";
// import useAuth from "../../contexts/AuthContext";
import HandleLeaveRequestAndApprovals from "../../components/leave-management/models/HandleLeaveRequestAndApprovals";

const AdminPanel = ({ employeeId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Status");
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddLeaveTypeModalOpen, setIsAddLeaveTypeModalOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [adminLeaveRequests, setAdminLeaveRequests] = useState([]);
  const [resultMsg, setResultMsg] = useState(null);
  const pendingCount = adminLeaveRequests.filter(req => req.status.toLowerCase() === 'pending').length;
  const approvedCount = adminLeaveRequests.filter(req => req.status.toLowerCase() === 'approved').length;

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // leave history and admin requests
  useEffect(() => {
    axios
      .post("http://localhost:8080/api/leave-requests/manager/history", {
        managerId: employeeId,
      })
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAdminLeaveRequests(arr.map(toLeaveRequest));
      })
      .catch((err) => console.error("Failed to fetch leave requests:", err));
  }, []);

  useEffect(() => {
    if (resultMsg) {
      const timer = setTimeout(() => setResultMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [resultMsg]);

  console.log("Admin Leave Requests:", adminLeaveRequests);


  const filteredAdminRequests = adminLeaveRequests.filter((request) => {
    const matchesSearch =
      request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "Status" || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRequests(filteredAdminRequests.map((req) => req.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (id, checked) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, id]);
    } else {
      setSelectedRequests(selectedRequests.filter((reqId) => reqId !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Leave Management
          </h1>
          <p className="text-gray-600">Handle leave requests and approvals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add People
          </button>
          <button
            onClick={() => setIsAddLeaveTypeModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Leave Type
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {approvedCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Available Days</p>
              <p className="text-2xl font-semibold text-gray-900">18</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <HandleLeaveRequestAndApprovals user={user} employeeId={employeeId} />

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
      />
      <AddLeaveTypeModal
        isOpen={isAddLeaveTypeModalOpen}
        onClose={() => setIsAddLeaveTypeModalOpen(false)}
      />
    </div>
  );
};

export default AdminPanel;
