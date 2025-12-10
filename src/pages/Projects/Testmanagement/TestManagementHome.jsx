"use client";

import TopTabs from "./TopTabs";
import { useParams, useLocation } from "react-router-dom";
import Overview from "./Overview";
import TestPlans from "./TestPlans";
import TestDesign  from "./TestDesign/TestDesign";
import TestExecution from "./TestExecution/TestExecution";
import BugPage from "./Bug/BugPage";


// import Execution from "./Execution";
// import Reports from "./Reports";
import { useEffect, useState } from "react";

export default function TestManagement() {
  const { projectId } = useParams();
  const location = useLocation();

  const getSelectedTabFromLocation = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "test-management/overview";
  };

  const [selectedTab, setSelectedTab] = useState(getSelectedTabFromLocation());

  useEffect(() => {
    setSelectedTab(getSelectedTabFromLocation());
  }, [location.search]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case "test-management/overview":
        return <Overview projectId={projectId} />;

      case "test-management/test-plans":
        return <TestPlans projectId={projectId} />;

      case "test-management/test-design":
        return <TestDesign projectId={projectId} />;

      case "test-management/test-execution":   // ⭐ FINAL EXECUTION TAB
        return <TestExecution projectId={projectId} />;

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
    }else if(selectedTab === "test-management/test-bugs") {
      return <BugPage />;
    }
  };

  return (
    <div className="w-full">
      <TopTabs selectedTab={selectedTab} projectId={projectId} />
      <div>{renderTabContent()}</div>
    </div>
  );
}};
