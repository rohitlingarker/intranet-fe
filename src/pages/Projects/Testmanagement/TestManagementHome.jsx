"use client";

import TopTabs from "./Toptabs";
import { Outlet } from "react-router-dom";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Overview from "./Overview";
import TestPlans from "./TestPlans";
import TestExecution from "./TestExecution";


// import Execution from "./Execution";
// import Reports from "./Reports";
import { useEffect, useState } from "react";  

export default function TestManagement() {

  const location = useLocation();
  const navigate = useNavigate();

  const getSelectedTabFromLocation = () => {
      const params = new URLSearchParams(location.search);
      return params.get("tab") || "overview";
    };
   
    const [selectedTab, setSelectedTab] = useState(getSelectedTabFromLocation());
   
    // Sync tab change based on URL
    useEffect(() => {
      setSelectedTab(getSelectedTabFromLocation());
    }, [location.search]);

  const renderTabContent = () => {
    if (selectedTab === "test-management/overview") {
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
  }
  
  return (
    <div className="w-full">
      <TopTabs selectedTab={selectedTab} />
      <div>{renderTabContent()}</div>
    </div>
  );
}
