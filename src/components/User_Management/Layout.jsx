// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./header";       // Adjust path if needed
import Sidebar from "./Sidebar";     // You must create or already have this component

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
