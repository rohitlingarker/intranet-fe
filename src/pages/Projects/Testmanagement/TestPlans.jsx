import { useState } from "react";
import { MoreHorizontal, Plus, Calendar, X } from "lucide-react";
import CreateTestPlan from "./TestPlans/pages/CreateTestPlan"; // ⭐ IMPORT MODAL FORM
import { useParams } from "react-router-dom";

export default function TestPlans() {
  const [selectedPlan, setSelectedPlan] = useState(1);
   const { projectId } = useParams();
  const [openModal, setOpenModal] = useState(false); // ⭐ MODAL STATE
  console.log("Project ID in TestPlans:", projectId);
  const plans = [
    {
      id: 1,
      name: "Release 3.0",
      sprint: "Sprint 10",
      status: "Active",
      coverage: 85,
      linkedStories: 5,
      stories: [
        { id: "US-101", title: "Login Feature" },
        { id: "US-102", title: "Forgot Password" },
        { id: "US-105", title: "User Profile" },
      ],
    },
    {
      id: 2,
      name: "UAT Phase 1",
      sprint: "Release 2.5",
      status: "Draft",
      coverage: 40,
      linkedStories: 0,
      stories: [],
    },
  ];

  const active = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="p-6 space-y-6 text-[#1A2B3F]">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-semibold">Test Plans</h1>
        <p className="text-sm text-gray-500">
          Manage test strategies and release coverage.
        </p>
      </div>

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div className="font-semibold text-sm text-gray-600">
          ACTIVE PLANS <span className="ml-1 text-blue-600">({plans.length})</span>
        </div>

        {/* ⭐ OPEN MODAL */}
        <button
          className="flex items-center bg-blue-600 text-white text-sm px-4 py-2 rounded-lg gap-2"
          onClick={() => setOpenModal(true)}
        >
          <Plus size={16} /> New Test Plan
        </button>
      </div>

      {/* PLANS TABLE */}
      <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-3 px-4 text-left">Plan Name</th>
              <th className="py-3 px-4 text-left">Sprint/Release</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Coverage</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPlan(plan.id)}
              >
                <td className="py-4 px-4">
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs text-gray-500">
                    {plan.linkedStories} Linked Stories
                  </div>
                </td>

                <td className="py-4 px-4 flex gap-2 items-center">
                  <Calendar size={16} className="text-gray-500" />
                  {plan.sprint}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      plan.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {plan.status}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="w-40 bg-gray-200 rounded-full h-2">
                    <div
                      style={{ width: `${plan.coverage}%` }}
                      className="h-2 bg-blue-600 rounded-full"
                    ></div>
                  </div>
                  <span className="text-xs ml-2 text-gray-600">
                    {plan.coverage}%
                  </span>
                </td>

                <td className="py-4 px-4 text-right">
                  <MoreHorizontal className="text-gray-500 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SELECTED PLAN DETAILS */}
      {active && (
        <div className="bg-white border shadow-sm rounded-xl p-6 space-y-4">

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {active.name} Details{" "}
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-lg ml-2">
                  Selected
                </span>
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <Calendar size={16} /> {active.sprint}
                <span>• {active.linkedStories} User Stories Linked</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="border text-sm px-4 py-2 rounded-lg">Edit</button>
              <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                ▶ Run Now
              </button>
            </div>
          </div>

          {/* STORIES GRID */}
          <div className="border rounded-xl p-5">

            <div className="text-sm mb-3 text-gray-700 font-medium">
              LINKED USER STORIES COVERAGE
            </div>

            <div className="grid grid-cols-3 gap-4">
              {active.stories.map((story) => (
                <div
                  key={story.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="text-green-600 font-bold text-xs">●</div>
                    <div className="font-semibold">{story.id} {story.title}</div>
                  </div>
                  <button className="text-sm text-blue-600">View</button>
                </div>
              ))}

              <div className="border border-dashed rounded-lg p-4 flex justify-center items-center text-gray-500 cursor-pointer">
                + Add Coverage
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ⭐ MODAL COMPONENT */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-xl shadow-lg p-6 relative">

            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setOpenModal(false)}
            >
              <X size={20} />
            </button>

            {/* FORM COMPONENT */}
            <CreateTestPlan projectId={projectId} closeModal={() => setOpenModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
