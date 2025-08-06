import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

import Summary from "./Summary";
import Backlog from "./Backlog/Backlog";
import Board from "./Board";
import SprintBoard from "./Sprint/SprintBoard";
import Lists from "./lists";

import Navbar from "../../../components/Navbar/Navbar"; // Adjust if needed

const ProjectTabs = () => {
  const { projectId } = useParams();
  const location = useLocation();

  const [projectName, setProjectName] = useState("");
  const [notFound, setNotFound] = useState(false);

  const getSelectedTabFromLocation = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "summary";
  };

  const [selectedTab, setSelectedTab] = useState(getSelectedTabFromLocation());

  useEffect(() => {
    if (projectId) {
      axios
        .get(`http://localhost:8080/api/projects/${projectId}`)
        .then((res) => {
          setProjectName(res.data.name);
          setNotFound(false);
        })
        .catch(() => {
          setNotFound(true);
        });
    }
  }, [projectId]);

  useEffect(() => {
    setSelectedTab(getSelectedTabFromLocation());
  }, [location.search]);

  const renderTabContent = () => {
    if (!projectId) return null;
    const pid = parseInt(projectId, 10);

    switch (selectedTab) {
      case "summary":
        return <Summary projectId={pid} projectName={projectName} />;
      case "backlog":
        return <Backlog projectId={pid} />;
      case "board":
        return <Board projectId={pid} projectName={projectName} />;
      case "sprint":
        return <SprintBoard projectId={pid} projectName={projectName} />;
      case "lists":
        return <Lists projectId={pid} />;
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
    { name: "Summary", path: `/projects/${projectId}?tab=summary` },
    { name: "Backlog", path: `/projects/${projectId}?tab=backlog` },
    { name: "Board", path: `/projects/${projectId}?tab=board` },
    { name: "Sprints", path: `/projects/${projectId}?tab=sprint` },
    { name: "Lists", path: `/projects/${projectId}?tab=lists` },
  ];

  const navItemsWithActive = navItems.map((item) => ({
    ...item,
    active: item.path === location.pathname + location.search,
  }));

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Navbar Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Project name and Navbar in same line */}
          <h2 className="text-lg font-semibold text-indigo-900 leading-none mr-4">
            {projectName}
          </h2>
          <Navbar logo={null} navItems={navItemsWithActive} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto w-full px-4 py-4">{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default ProjectTabs;
