import { Outlet } from "react-router-dom";
import Header from "../components/header";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
