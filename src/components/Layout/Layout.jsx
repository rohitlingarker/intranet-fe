import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ paddingLeft: "16rem" }}>
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* ✅ Nested routes render here */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
