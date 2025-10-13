import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // default collapsed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Collapse automatically on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(true); // keep collapsed by default
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar manually
  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "ml-[5.5rem]" : "ml-[17rem]"
        }`} // increased margin for visible gap
      >
        <Header onToggleSidebar={handleToggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50 rounded-tl-xl shadow-inner">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
