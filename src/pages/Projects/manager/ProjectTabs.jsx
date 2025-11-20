import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Summary from "./Summary";
import Backlog from "./Backlog/Backlog";
import Board from "./Board";
import SprintBoard from "./Sprint/SprintBoard";
import ProjectStatusReportWrapper from "./ProjectStatusReportWrapper";
import BacklogAndSprints from "./BacklogAndSprints";

import Navbar from "../../../components/Navbar/Navbar";

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

  // ✅ Removed redirect for status-report — keeps navbar visible
  useEffect(() => {
    setSelectedTab(getSelectedTabFromLocation());
  }, [location.search]);

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

  const renderTabContent = () => {
    if (!projectId) return null;
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
        return <ProjectStatusReportWrapper projectId={pid} />;
      case "newone":
        return <BacklogAndSprints projectId={pid}/>
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

  const navItems = [
    { name: "Summary", tab: "summary" },
    { name: "Backlog", tab: "backlog" },
    { name: "Board", tab: "board" },
    { name: "Sprints", tab: "sprint" },
    { name: "Status Report", tab: "status-report" },
    {name: "newone", tab: "newone" }
  ];

  const navItemsWithActive = navItems.map((item) => ({
    name: item.name,
    onClick: () => navigate(`/projects/${projectId}?tab=${item.tab}`),
    isActive: selectedTab === item.tab,
  }));

  return (
    // <div className="flex flex-col h-screen">
    //   {/* ✅ Fixed Navbar (always visible) */}
    //   <header className="sticky top-0 z-50 border-b bg-white">
    //     <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
    //       <h2 className="text-lg font-semibold text-indigo-900 leading-none mr-4">
    //         {projectName}
    <div>
      <header className="bg-white mb-4">
          {/* </h2> */}
          <Navbar logo={null} navItems={navItemsWithActive} />
        {/* </div> */}
      </header>

      {/* ✅ Content below navbar */}
      {/* <main className="flex-1 overflow-auto bg-slate-50"> */}
        <div>
          {renderTabContent()}
        </div>
      {/* </main> */}
    </div>
  );
};

export default ProjectTabs;
