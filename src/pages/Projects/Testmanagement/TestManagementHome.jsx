"use client";

import TopTabs from "./Toptabs";
import { useParams, useLocation } from "react-router-dom";
import Overview from "./Overview";
import TestPlans from "./TestPlans";
import TestDesign  from "./TestDesign/TestDesign";
import TestExecution from "./TestExecution";


// import Execution from "./Execution";
// import Reports from "./Reports";
import { useEffect, useState } from "react";

export default function TestManagement() {
  const { projectId } = useParams();       // ✅ REQUIRED FIX
  const location = useLocation();

  const getSelectedTabFromLocation = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "test-management/overview";
  };

  const [selectedTab, setSelectedTab] = useState(getSelectedTabFromLocation());

  // Update selected tab when URL changes
  useEffect(() => {
    setSelectedTab(getSelectedTabFromLocation());
  }, [location.search]);

  const renderTabContent = () => {
    if (selectedTab === "test-management/overview") {
      return <Overview projectId={projectId} />;
    }

    if (selectedTab === "test-management/test-plans") {
      return <TestPlans projectId={projectId} />;
    }

    if (selectedTab === "test-management/test-design") {
      return <TestDesign projectId={projectId} />;  // ✅ MAIN FIX
    }

    if (selectedTab === "test-management/execution") {
      return <div>Execution (work in progress)</div>;
      // return <Execution projectId={projectId} />;
    }

    if (selectedTab === "reports") {
      return <div>Reports (work in progress)</div>;
      // return <Reports projectId={projectId} />;
      return <Overview />;
    }else if (selectedTab === "test-management/test-design") {
      return <TestDesign />;
    }else if (selectedTab === "test-management/test-execution") {
      return <TestExecution />;
    }else if (selectedTab === "reports") {
      return <Reports />;
    }else if (selectedTab === "test-management/test-plans") {
      return <TestPlans />;
    }

    return null;
  };

  return (
    <div className="w-full">
      <TopTabs selectedTab={selectedTab} projectId={projectId} />
      <div>{renderTabContent()}</div>
    </div>
  );
}
