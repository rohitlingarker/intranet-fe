import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
 
import Summary from "./Summary";
import BacklogAndSprints from "./BacklogAndSprints";
import Board from "./Board";
import ProjectStatusReportWrapper from "./ProjectStatusReportWrapper";
import Timeline from "./Timeline";
import Navbar from "../../../components/Navbar/Navbar";
 
// TEMPORARY PLACEHOLDER PAGE
const TestManagementHome = () => (
<div className="p-6 text-slate-700 text-lg">
    Test Management Module Coming Soon...
</div>
);
 
const ProjectTabs = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
 
  const [projectName, setProjectName] = useState("");
  const [notFound, setNotFound] = useState(false);
 
  const getSelectedTabFromLocation = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "summary";
  };
 
  const [selectedTab, setSelectedTab] = useState(getSelectedTabFromLocation());
 
  // Sync tab change based on URL
  useEffect(() => {
    setSelectedTab(getSelectedTabFromLocation());
  }, [location.search]);
 
  // Fetch project
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
 
  const renderTabContent = () => {
    if (!projectId) return null;
    const pid = parseInt(projectId, 10);
 
    switch (selectedTab) {
      case "summary":
        return <Summary projectId={pid} projectName={projectName} />;
 
      case "backlog":
        return <BacklogAndSprints projectId={pid} />;
 
      case "board":
        return <Board projectId={pid} projectName={projectName} />;
 
      case "status-report":
        return <ProjectStatusReportWrapper projectId={pid} />;
 
      case "timelines":
        return <Timeline projectId={pid} />;
 
      // ⭐ NEW TEST MANAGEMENT TAB
      case "test-management":
        return <TestManagementHome />;
 
      default:
        return null;
    }
  };
 
  if (!projectId) {
    return <div className="p-6 text-slate-400">No project selected.</div>;
  }
 
  if (notFound) {
    return <div className="p-6 text-red-500">Project not found.</div>;
  }
 
  // ------------------------------
  // UPDATED NAV ITEMS
  // ------------------------------
  const navItems = [
    { name: "Summary", tab: "summary" },
    { name: "Backlog", tab: "backlog" },
    { name: "Board", tab: "board" },
    { name: "Status Report", tab: "status-report" },
    { name: "Timelines", tab: "timelines" },
 
    // ⭐ NEW TEST MANAGEMENT TAB
    { name: "Test Management", tab: "test-management" },
  ];
 
  const navItemsWithActive = navItems.map((item) => ({
    name: item.name,
    onClick: () => navigate(`/projects/${projectId}?tab=${item.tab}`),
    isActive: selectedTab === item.tab,
  }));
 
  return (
<div>
<header className="bg-white mb-4">
<Navbar logo={null} navItems={navItemsWithActive} />
</header>
 
      <div>{renderTabContent()}</div>
</div>
  );
};
 
export default ProjectTabs;