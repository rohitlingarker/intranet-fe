import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Summary from "./Summary";
import Backlog from "./Backlog/Backlog";
import Board from "./Board";
import SprintBoard from "./Sprint/SprintBoard";
import Lists from "./ProjectStatusReport";
import Navbar from "../../../components/Navbar/Navbar";

const ProjectTabs = () => {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [projectName, setProjectName] = useState("");
  const [notFound, setNotFound] = useState(false);
  
  // ✅ Initialize tab only once from URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (!tabFromUrl) {
      // No tab in URL → set default tab as 'summary' and update URL
      setSearchParams({ tab: "summary" }, { replace: true });
      setSelectedTab("summary");
    } else {
      setSelectedTab(tabFromUrl);
    }
  }, [searchParams, setSearchParams]);

  // ✅ Handle tab changes (triggered by Navbar clicks)
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setSearchParams({ tab });
  };

  const [selectedTab, setSelectedTab] = useState(getSelectedTabFromLocation());

  useEffect(() => {
  if (selectedTab === "status-report") {
    navigate(`/projects/${projectId}/status-report`, { replace: true });
  }
}, [selectedTab, navigate, projectId]);


  // ✅ Fetch project details
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
        .catch(() => setNotFound(true));
    }
  }, [projectId, token]);

  // ✅ Render correct tab component
  const renderTabContent = () => {
    if (!projectId || !selectedTab) return null;
    const pid = parseInt(projectId, 10);

    switch (selectedTab) {
      case "summary":
        return <Summary projectId={pid} projectName={projectName} />;
      case "backlog":
        return <Backlog projectId={pid} projectName={projectName} />;
      case "board":
        return <Board projectId={pid} projectName={projectName} />;
      case "sprint":
        return <SprintBoard projectId={pid} projectName={projectName} />;
      case "status-report":
        return <Lists projectId={pid} />;
      default:
        return <Summary projectId={pid} projectName={projectName} />;
    }
  };

  if (!projectId)
    return <div className="p-6 text-slate-400">No project selected.</div>;
  if (notFound)
    return <div className="p-6 text-red-500">Project not found.</div>;

  const navItems = [
    { name: "Summary", tab: "summary" },
    { name: "Backlog", tab: "backlog" },
    { name: "Board", tab: "board" },
    { name: "Sprints", tab: "sprint" },
    { name: "Status Report", tab: "status-report" },
  ];

  // ✅ Navbar tabs with active highlight
  const navItemsWithActive = navItems.map((item) => ({
    name: item.name,
    onClick: () => handleTabChange(item.tab),
    isActive: selectedTab === item.tab,
  }));

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="top-0 z-50 border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-indigo-900 leading-none mr-4">
            {projectName}
          </h2>
          <Navbar logo={null} navItems={navItemsWithActive} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto w-full px-4 py-4">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default ProjectTabs;
