import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  // Sidebar is hidden (collapsed) by default
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Collapse automatically on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar manually
  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setIsSidebarOpen((prev) => !prev);
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
        <Header
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 p-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
