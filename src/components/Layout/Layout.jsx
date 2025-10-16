import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
 
const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
 
  // Collapse automatically on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 
  // Toggle sidebar manually (for large screens)
  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} />
 
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 p-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
 
export default Layout;