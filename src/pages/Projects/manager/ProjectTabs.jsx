import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Summary from "../Summary/Summary.jsx";
import BacklogAndSprints from "./BacklogAndSprints";
import Board from "./Board";
import ProjectStatusReportWrapper from "./ProjectStatusReportWrapper";
import Timeline from "./Timeline";

import Navbar from "../../../components/Navbar/Navbar";
import TestManagement from "../Testmanagement/TestManagementHome";
import RiskRegisterPage from "./riskManagement/RiskRegisterPage";
import { Calendar } from "antd";

const ProjectTabs = () => {
  const { projectId } = useParams();
  console.log(projectId);
  console.log("URL", window.location.href);
  
  
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [projectName, setProjectName] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Get tab from URL OR default to summary
  const getSelectedTabFromLocation = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "summary";
  };

  const [selectedTab, setSelectedTab] = useState(getSelectedTabFromLocation());

  // Update selected tab when URL changes
  useEffect(() => {
    setSelectedTab(getSelectedTabFromLocation());
  }, [location.search]);

  // ⭐ NEW — Auto redirect test-management → test-management/overview
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "test-management") {
      navigate(
        `/projects/${projectId}?tab=test-management/overview`,
        { replace: true }
      );
    }
  }, [location.search, navigate, projectId]);

  // Fetch project details
  useEffect(() => {
    if (projectId && token) {
      axios
        .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setProjectName(res.data.name);
          setNotFound(false);
        })
        .catch(() => {
          setNotFound(true);
        });
    }
  }, [projectId, token]);

  // Render content for each tab
  const renderTabContent = () => {
    if (!projectId) return null;
    const pid = parseInt(projectId, 10);
    if (selectedTab === "risk-management") {
      return <RiskRegisterPage projectId={pid} />;
    }
    if (selectedTab === "summary") {
      return <Summary projectId={pid} projectName={projectName} />;
    }
    if (selectedTab === "backlog") {
      return <BacklogAndSprints projectId={pid} />;
    }
    if (selectedTab === "board") {
      return <Board projectId={pid} projectName={projectName} />;
    }
    // if (selectedTab === "status-report") {
    //   return <ProjectStatusReportWrapper projectId={pid} />;
    // }
    if (selectedTab === "timelines") {
      return <Timeline projectId={pid} />;
    }
    if (selectedTab.startsWith("test-management")) {
      return <TestManagement projectId={pid} />;
    }
    if (selectedTab === "calendar") {
      return <Calendar projectId={pid} />;
    }

    return null;
  };

  if (!projectId) {
    return <div className="p-6 text-slate-400">No project selected.</div>;
  }

  if (notFound) {
    return <div className="p-6 text-red-500">Project not found.</div>;
  }

  const navItems = [
   
    { name: "Summary", tab: "summary" },
    { name: "Backlog", tab: "backlog" },
    { name: "Board", tab: "board" },
     { name: "Risk Management", tab: "risk-management" },
    // { name: "Status Report", tab: "status-report" },
    { name: "Test Management", tab: "test-management" },
      { name: "Timelines", tab:"timelines" },
    { name: "Calendar", tab: "calendar" },
  ];

  const navItemsWithActive = navItems.map((item) => ({
    name: item.name,
    onClick: () => navigate(`/projects/${projectId}?tab=${item.tab}`),
    isActive: selectedTab === item.tab,
  }));

  return (
    <div>
      {/* Top Navbar */}
      <header className="bg-white mb-4">
        <Navbar logo={null} navItems={navItemsWithActive} />
      </header>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default ProjectTabs;
