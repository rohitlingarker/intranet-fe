import React, { useState } from "react";
import CreateEpic from "./epic";
import CreateUserStory from "./userstory";
import CreateSprint from "./sprint";
import CreateTaskModal from "./tasks";
import { Plus } from "lucide-react";

const Backlog: React.FC = () => {
  const [issueType, setIssueType] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleSelect = (type: string) => {
    setIssueType(type);
    setShowDropdown(false);
  };

  const handleCloseForm = () => {
    setIssueType("");
  };

  const renderForm = () => {
    switch (issueType) {
      case "EPIC":
        return <CreateEpic onClose={handleCloseForm} />;
      case "STORY":
        return <CreateUserStory onClose={handleCloseForm} />;
      case "TASK":
        return <CreateTaskModal onClose={handleCloseForm} />;
      case "SPRINT":
        return <CreateSprint onClose={handleCloseForm} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Backlog</h1>

        {/* Buttons */}
        <div className="flex gap-3">
          {/* + Create Issue Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Create Issue
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md z-10">
                <button
                  onClick={() => handleSelect("EPIC")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  🧩 Epic
                </button>
                <button
                  onClick={() => handleSelect("STORY")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  📘 User Story
                </button>
                <button
                  onClick={() => handleSelect("TASK")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  ✅ Task
                </button>
              </div>
            )}
          </div>

          {/* + Create Sprint */}
          <button
            onClick={() => handleSelect("SPRINT")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={18} /> Create Sprint
          </button>
        </div>
      </div>

      {/* Render Form */}
      <div className="transition-all duration-300">{renderForm()}</div>
    </div>
  );
};

export default Backlog;
