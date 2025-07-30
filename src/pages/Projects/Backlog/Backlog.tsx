import React, { useState } from "react";
import CreateEpic from "./epic";
import CreateSprint from "./sprint";
import CreateTaskModal from "./tasks";
import CreateUserStory from "./userstory";

export default function Backlog() {
  const [showEpic, setShowEpic] = useState(false);
  const [showSprint, setShowSprint] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [showUserStory, setShowUserStory] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Backlog Management</h1>

      {/* Button Group */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowEpic(!showEpic)}
        >
          {showEpic ? "Hide Epic" : "Create Epic"}
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowSprint(!showSprint)}
        >
          {showSprint ? "Hide Sprint" : "Create Sprint"}
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowUserStory(!showUserStory)}
        >
          {showUserStory ? "Hide Story" : "Create Story"}
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowTask(!showTask)}
        >
          {showTask ? "Hide Task" : "Create Task"}
        </button>
      </div>

      {/* Conditional Sections */}
      <div className="space-y-8">
        {showEpic && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create Epic</h2>
            <CreateEpic />
          </div>
        )}

        {showSprint && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create Sprint</h2>
            <CreateSprint />
          </div>
        )}

        {showUserStory && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create User Story</h2>
            <CreateUserStory />
          </div>
        )}

        {showTask && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create Task</h2>
            <CreateTaskModal />
          </div>
        )}
      </div>
    </div>
  );
}
