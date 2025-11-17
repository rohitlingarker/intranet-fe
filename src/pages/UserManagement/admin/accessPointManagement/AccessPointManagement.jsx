import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AccessPointList from "./AccessPointList";
import Navbar from "../../../../components/Navbar/Navbar";
import { Search } from "lucide-react"; // Import Search icon

export default function AccessPointManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(""); // ✅ New state for search term

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
      onClick: () =>
        navigate("/user-management/access-points/admin/access-point-mapping"),
      isActive:
        location.pathname ===
        "/user-management/access-points/admin/access-point-mapping",
    },
{
      name: "Access Point Create Bulk",
      onClick: () => navigate("/user-management/access-points/create-bulk"),
      isActive:
        location.pathname === "/user-management/access-points/create-bulk",
    },
    {
      name: "Access Permission Mapping Bulk",
      onClick: () =>
        navigate(
          "/user-management/access-point-map-permission-bulk"
        ),
      isActive:
        location.pathname ===
        "/user-management/access-point-map-permission-bulk",
    },

  ];

  return (
    <div>
      {/* Reusable Navbar */}
      <Navbar logo="Access Points" navItems={navItems} />

      {/* Main content */}
      <div className="p-6">
        {/* ✅ Sticky Search Bar Container */}
        <div className="sticky top-0 z-10 bg-gray-100 pb-4 pt-1">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Access Point Management</h2>
              <p className="mt-1 text-gray-600">Manage access points here.</p>
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
        
        {/* AccessPointList receives the search term */}
        <AccessPointList searchTerm={searchTerm} /> 
      </div>
    </div>
  );
}