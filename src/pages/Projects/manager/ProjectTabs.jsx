import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Summary from "./Summary";
import Backlog from "./Backlog/Backlog";
import Board from "./Board";
import SprintBoard from "./Sprint/SprintBoard";
import Lists from "./lists";

import Navbar from "../../../components/Navbar/Navbar"; // Custom Navbar

const ProjectTabs = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [selectedTab, setSelectedTab] = useState("summary");
  const [notFound, setNotFound] = useState(false);

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

  const navItems = [
    { name: "Summary", path: "summary" },
    { name: "Backlog", path: "backlog" },
    { name: "Board", path: "board" },
    { name: "Sprints", path: "sprint" },
    { name: "Lists", path: "lists" },
  ];

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

  return (
    <div className="flex flex-col h-full">
      {/* Navbar with tabs, no icons */}
      <Navbar
        logo={projectName || "Project"}
        navItems={navItems.map((item) => ({
          ...item,
          onClick: () => setSelectedTab(item.path),
          isActive: selectedTab === item.path,
          icon: null, // explicitly no icon
        }))}
      />

      {/* Main Content */}
      <div className="flex-1 bg-slate-50 overflow-auto">{renderTabContent()}</div>
    </div>
  );
};

export default ProjectTabs;
