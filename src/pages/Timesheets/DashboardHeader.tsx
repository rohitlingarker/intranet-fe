import React, { useEffect, useState } from "react";

interface User {
  username: string;
  role: string;
}

const DashboardHeader: React.FC = () => {
  const [user, setUser] = useState<User>({ username: "", role: "" });

  useEffect(() => {
    // Fetch user details from API or local storage after login
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Fallback for guest user
      setUser({ username: "Guest User", role: "Viewer" });
    }
  }, []);

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user.username.split(" ")[0]}
        </h1>
        <p className="text-gray-500">
          Here's what's happening with your organization today.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="font-semibold">{user.username}</span>
          <span className="text-sm text-gray-500">{user.role}</span>
        </div>
        <div className="w-10 h-10 flex items-center justify-center bg-blue-800 text-white rounded-full">
          {user.username.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
