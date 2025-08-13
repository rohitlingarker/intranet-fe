import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AccessPointList from "./AccessPointList";
import Navbar from "../../../../components/Navbar/Navbar";
export default function AccessPointManagement() {
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
      onClick: () =>
        navigate("/user-management/access-points/admin/access-point-mapping"),
      isActive:
        location.pathname ===
        "/user-management/access-points/admin/access-point-mapping",
    },
  ];
 
  return (
    <div>
      {/* ✅ Reusable Navbar */}
      <Navbar logo="Access Points" navItems={navItems} />
 
      {/* ✅ Main content */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Access Point Management</h2>
            <p className="mt-2 text-gray-600">Manage access points here.</p>
          </div>
        </div>
        <AccessPointList />
      </div>
    </div>
  );
}