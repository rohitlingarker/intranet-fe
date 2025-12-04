"use client";

import React from "react";
import { useNavigate, useParams, useLocation, Outlet, NavLink } from "react-router-dom";
import TopTabs from "./components/TopTabs";



const TestManagement = ({ projectId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId: pid } = useParams();

  // Get selected sub-tab (overview, test-design, execution, reports)
  const getSelectedSubTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get("sub") || "overview";
  };

  const selectedSubTab = getSelectedSubTab();

  // Tab click handler
  const handleTabChange = (tab) => {
    navigate(`/projects/${pid}?tab=test-management&sub=${tab}`);
  };

  return (
    <div className="p-4">
      {/* Title */}
      <h1 className="text-xl font-semibold mb-4 text-slate-700">
        Test Management
      </h1>

      {/* Top Tabs */}
      <TopTabs selectedTab={selectedSubTab} onTabChange={handleTabChange} />

      {/* Nested Tab Content */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default TestManagement;
