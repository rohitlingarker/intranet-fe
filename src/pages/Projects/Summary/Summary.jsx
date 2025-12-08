// src/pages/Projects/Summary/Summary.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Skeletons
import HeaderSkeleton from "./skeletons/HeaderSkeleton";
import ScopeSkeleton from "./skeletons/ScopeSkeleton";
import StatusSkeleton from "./skeletons/StatusSkeleton";
import ChartCardSkeleton from "./skeletons/ChartCardSkeleton";
import ListCardSkeleton from "./skeletons/ListCardSkeleton";

// Widgets
import ScopeAndProgress from "./widgets/ScopeAndProgress";
import StatusOverview from "./widgets/StatusOverview";
import TypesOfWork from "./widgets/TypesOfWork";
import TeamWorkload from "./widgets/TeamWorkload";
import PriorityDistribution from "./widgets/PriorityDistribution";
import EpicProgress from "./widgets/EpicProgress";

const Summary = ({ projectId, projectName }) => {
  const [projectData, setProjectData] = useState({
    epics: null,
    stories: null,
    tasks: null,
    bugs: null,
    statuses: null,
    users: null,
    stage: null,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!projectId || !token) return;
    const base = import.meta.env.VITE_PMS_BASE_URL;
    const headers = { Authorization: `Bearer ${token}` };

    const fetch = (url, key) => {
      axios.get(url, { headers })
        .then((res) => setProjectData((p) => ({ ...p, [key]: res.data || [] })))
        .catch(() => setProjectData((p) => ({ ...p, [key]: [] })));
    };

    axios.get(`${base}/api/projects/${projectId}`, { headers })
      .then((res) => setProjectData((p) => ({ ...p, stage: res.data?.currentStage || "INITIATION" })))
      .catch(() => setProjectData((p) => ({ ...p, stage: "UNKNOWN" })));

    fetch(`${base}/api/projects/${projectId}/epics`, "epics");
    fetch(`${base}/api/projects/${projectId}/stories`, "stories");
    fetch(`${base}/api/projects/${projectId}/tasks`, "tasks");
    fetch(`${base}/api/testing/bugs/projects/${projectId}/summaries`, "bugs");
    fetch(`${base}/api/projects/${projectId}/statuses`, "statuses");
    fetch(`${base}/api/projects/${projectId}/members-with-owner`, "users");
  }, [projectId, token]);

  const isDataReady = {
    work: projectData.epics && projectData.stories && projectData.tasks && projectData.bugs,
    statuses: projectData.statuses,
    users: projectData.users,
  };

  const allWork = useMemo(() => {
    if (!isDataReady.work) return [];
    return [...projectData.tasks, ...projectData.stories, ...projectData.bugs];
  }, [projectData.epics, projectData.stories, projectData.tasks, projectData.bugs, isDataReady.work]);

  return (
    <motion.div
      className="bg-white mt-2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.36 }}
    >
      {/* HEADER */}
      {!projectData.stage ? (
        <HeaderSkeleton />
      ) : (
        <div className="mb-6 px-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
                {projectName || "Project"}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Overview & progress at a glance
              </p>
            </div>
            <div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Stage: {projectData.stage}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SCOPE */}
      <div className="mb-4">
        {!isDataReady.work || !isDataReady.statuses ? (
          <ScopeSkeleton />
        ) : (
          <ScopeAndProgress
            epics={projectData.epics}
            stories={projectData.stories}
            statuses={projectData.statuses}
            tasks={projectData.tasks}
            bugs={projectData.bugs}
          />
        )}
      </div>

      {/* STATUS */}
      <div className="mb-4">
        {!isDataReady.work || !isDataReady.statuses ? (
          <StatusSkeleton />
        ) : (
          <StatusOverview workItems={allWork} statuses={projectData.statuses} />
        )}
      </div>

      {/* BOTTOM FLOAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {!isDataReady.work ? (
            <ChartCardSkeleton />
          ) : (
            <PriorityDistribution
              tasks={projectData.tasks}
              stories={projectData.stories}
              bugs={projectData.bugs}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!isDataReady.work ? (
            <ListCardSkeleton />
          ) : (
            <TypesOfWork
              tasks={projectData.tasks}
              stories={projectData.stories}
              epics={projectData.epics}
              bugs={projectData.bugs}
            />
          )}

          {!isDataReady.work || !isDataReady.users ? (
            <ListCardSkeleton />
          ) : (
            <TeamWorkload workItems={allWork} users={projectData.users} />
          )}
        </div>
      </div>

      {/* EPICS */}
      <div className="my-4">
        {!isDataReady.work || !isDataReady.statuses ? (
          <ListCardSkeleton />
        ) : (
          <EpicProgress
            epics={projectData.epics}
            stories={projectData.stories}
            tasks={projectData.tasks}
            bugs={projectData.bugs}
            statuses={projectData.statuses}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Summary;
