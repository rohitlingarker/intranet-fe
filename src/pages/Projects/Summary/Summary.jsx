// Summary/Summary.jsx
"use client";
import React, { Suspense, useMemo, useEffect } from "react";
import useDashboardData from "./useDashboardData";
import { preloadAllWidgets } from "./preloadWidgets";

// Lazy widgets
const ScopeAndProgress = React.lazy(() => import("./widgets/ScopeAndProgress"));
const StatusOverview = React.lazy(() => import("./widgets/StatusOverview"));
const TypesOfWork = React.lazy(() => import("./widgets/TypesOfWork"));
const TeamWorkload = React.lazy(() => import("./widgets/TeamWorkload"));
const PriorityDistribution = React.lazy(() => import("./widgets/PriorityDistribution"));
const EpicProgress = React.lazy(() => import("./widgets/EpicProgress"));

// Skeletons
import HeaderSkeleton from "./skeletons/HeaderSkeleton";
import ScopeSkeleton from "./skeletons/ScopeSkeleton";
import StatusSkeleton from "./skeletons/StatusSkeleton";
import ChartCardSkeleton from "./skeletons/ChartCardSkeleton";
import ListCardSkeleton from "./skeletons/ListCardSkeleton";

const HeaderSection = React.memo(function HeaderSection({ stage, projectName, loadingStage }) {
  if (loadingStage) return <HeaderSkeleton />;
  return (
    <div className="mb-6 px-1">
      <h1 className="text-2xl font-semibold">{projectName || "Project"}</h1>
      <p className="text-sm text-gray-500">Overview & progress at a glance</p>
      <div className="mt-2">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border">
          Stage: {stage || "UNKNOWN"}
        </span>
      </div>
    </div>
  );
});

export default function Summary({ projectId, projectName }) {
  const { data, loading } = useDashboardData(projectId);

  // preload bundles during idle
  useEffect(() => {
    preloadAllWidgets();
  }, []);

  // combine work items only when available - memoized
  const allWorkItems = useMemo(() => {
    if (!data.tasks || !data.stories || !data.bugs) return [];
    return [...(data.tasks || []), ...(data.stories || []), ...(data.bugs || [])];
  }, [data.tasks, data.stories, data.bugs]);

  return (
    <div className="bg-white mt-2 p-4">
      <HeaderSection stage={data.stage} projectName={projectName} loadingStage={loading.stage} />

      <div className="mb-4">
        <Suspense fallback={<ScopeSkeleton />}>
          {loading.epics || loading.stories || loading.tasks || loading.bugs ? (
            <ScopeSkeleton />
          ) : (
            <ScopeAndProgress
              epics={data.epics}
              stories={data.stories}
              tasks={data.tasks}
              bugs={data.bugs}
              statuses={data.statuses}
            />
          )}
        </Suspense>
      </div>

      <div className="mb-4">
        <Suspense fallback={<StatusSkeleton />}>
          {loading.statuses || loading.stories || loading.tasks || loading.bugs ? (
            <StatusSkeleton />
          ) : (
            <StatusOverview workItems={allWorkItems} statuses={data.statuses} />
          )}
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Suspense fallback={<ChartCardSkeleton />}>
            {loading.tasks || loading.stories || loading.bugs ? (
              <ChartCardSkeleton />
            ) : (
              <PriorityDistribution tasks={data.tasks} stories={data.stories} bugs={data.bugs} />
            )}
          </Suspense>
        </div>

        <div className="flex flex-col gap-4">
          <Suspense fallback={<ListCardSkeleton />}>
            {loading.tasks || loading.stories || loading.bugs ? (
              <ListCardSkeleton />
            ) : (
              <TypesOfWork tasks={data.tasks} stories={data.stories} epics={data.epics} bugs={data.bugs} />
            )}
          </Suspense>

          <Suspense fallback={<ListCardSkeleton />}>
            {loading.users || loading.tasks || loading.stories || loading.bugs ? (
              <ListCardSkeleton />
            ) : (
              <TeamWorkload workItems={allWorkItems} users={data.users} />
            )}
          </Suspense>
        </div>
      </div>

      <div className="mt-4">
        <Suspense fallback={<ListCardSkeleton />}>
          {loading.epics || loading.statuses || loading.tasks || loading.stories || loading.bugs ? (
            <ListCardSkeleton />
          ) : (
            <EpicProgress epics={data.epics} stories={data.stories} tasks={data.tasks} bugs={data.bugs} statuses={data.statuses} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
