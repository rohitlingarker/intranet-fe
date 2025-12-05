"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import CreateTestPlan from "./TestPlans/pages/CreateTestPlan";
import EditTestPlan from "./TestPlans/pages/EditTestPlan";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function TestPlans() {
  const { projectId } = useParams();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);

  const [storyTitles, setStoryTitles] = useState({}); // Store multiple story titles

  const token = localStorage.getItem("token");

  // ------------------------------------------
  // FETCH PLANS
  // ------------------------------------------
  const fetchPlans = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/plans/projects/${projectId}?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      const plansArray = Array.isArray(response.data)
        ? response.data
        : [response.data];

      setPlans(plansArray);

      if (plansArray.length > 0) {
        setSelectedPlan(plansArray[0].id);
      }
    } catch (error) {
      console.error("Error fetching test plans:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [projectId, token]);

  const active = plans.find((p) => p.id === selectedPlan);

  // ------------------------------------------
  // FETCH SCENARIOS FOR SELECTED PLAN
  // ------------------------------------------
  const fetchScenarios = async (planId) => {
    if (!planId) return;

    setLoadingScenarios(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/scenarios/plans/${planId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setScenarios(response.data || []);
    } catch (error) {
      console.error("Failed to fetch scenarios:", error);
      setScenarios([]);
    } finally {
      setLoadingScenarios(false);
    }
  };

  useEffect(() => {
    if (selectedPlan) fetchScenarios(selectedPlan);
  }, [selectedPlan]);

  // ------------------------------------------
  // FETCH STORY TITLE FOR LINKED STORY
  // ------------------------------------------
  const fetchStoryTitle = async (storyId) => {
    if (!storyId) return;

    if (storyTitles[storyId]) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStoryTitles((prev) => ({
        ...prev,
        [storyId]: res.data.title || "Untitled Story",
      }));
    } catch (error) {
      console.error("Error fetching story title:", error);
      setStoryTitles((prev) => ({
        ...prev,
        [storyId]: "Unknown Story",
      }));
    }
  };

  useEffect(() => {
    scenarios.forEach((sc) => {
      if (sc.linkedStoryId) fetchStoryTitle(sc.linkedStoryId);
    });
  }, [scenarios]);

  // ------------------------------------------
  // DELETE CONFIRM TOAST
  // ------------------------------------------
  const showConfirmToast = (message, onConfirm) => {
    toast(
      ({ closeToast }) => (
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 mb-2">Confirm Delete</h3>
          <p className="text-sm text-gray-600">{message}</p>

          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-3 py-1 border rounded-md text-sm"
              onClick={() => closeToast()}
            >
              Cancel
            </button>

            <button
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              onClick={() => {
                closeToast();
                onConfirm();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: "confirm-delete",
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: "bg-white shadow-lg rounded-lg border max-w-sm w-full mx-auto",
      }
    );
  };

  const handleDelete = (id) => {
    showConfirmToast("Are you sure you want to delete this test plan?", async () => {
      try {
        await axios.delete(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/plans/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updated = plans.filter((plan) => plan.id !== id);
        setPlans(updated);

        if (selectedPlan === id && updated.length > 0) {
          setSelectedPlan(updated[0].id);
        }

        toast.success("Test Plan deleted successfully!", {
          position: "top-right",
        });
      } catch (error) {
        console.error("Failed to delete plan:", error);
        toast.error("Failed to delete the test plan");
      }
    });
  };

  // ------------------------------------------
  // PRIORITY & STATUS COLORS
  // ------------------------------------------
  const priorityColors = {
    HIGH: "bg-red-100 text-red-600",
    MEDIUM: "bg-yellow-100 text-yellow-600",
    LOW: "bg-green-100 text-green-600",
  };

  const statusColors = {
    DRAFT: "bg-gray-200 text-gray-700",
    ACTIVE: "bg-blue-100 text-blue-600",
    COMPLETED: "bg-green-100 text-green-600",
  };

  // ------------------------------------------
  // RENDER UI
  // ------------------------------------------
  return (
    <div className="p-6 space-y-6 text-[#1A2B3F]">
      <div>
        <h1 className="text-2xl font-semibold">Test Plans</h1>
      </div>

      {/* TOP BAR */}
      <div className="flex justify-end items-center">
        <button
          className="flex items-center bg-blue-600 text-white text-sm px-4 py-2 rounded-lg gap-2"
          onClick={() => setOpenCreateModal(true)}
        >
          <Plus size={16} /> New Test Plan
        </button>
      </div>

      {/* PLANS TABLE */}
      <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
        <table className="w-full text-sm table-auto">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-3 px-6 text-center">Plan Name</th>
              <th className="py-3 px-6 text-center">Objective</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className={`border-t hover:bg-gray-50 cursor-pointer ${
                  selectedPlan === plan.id ? "bg-gray-100" : ""
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <td className="py-4 px-6 font-medium align-top">{plan.name}</td>

                <td className="py-4 px-6 text-gray-500 align-top max-w-xs whitespace-pre-wrap">
                  {plan.objective}
                </td>

                <td className="py-4 px-6 text-center align-top">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPlanId(plan.id);
                        setOpenEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(plan.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SELECTED PLAN DETAILS */}
      {active && (
        <div className="bg-white border shadow-sm rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold">{active.name} Details</h2>
          <p className="text-sm text-gray-500">{active.objective}</p>

          <h3 className="text-md font-semibold">Test Scenarios</h3>

          {loadingScenarios ? (
            <div className="text-sm text-gray-500">Loading scenarios...</div>
          ) : scenarios.length === 0 ? (
            <div className="text-sm text-gray-400 italic">
              No scenarios found for this test plan.
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-gray-800">
                      {sc.title}
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        priorityColors[sc.priority] || "bg-gray-200"
                      }`}
                    >
                      {sc.priority}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${statusColors[sc.status]}`}
                    >
                      {sc.status}
                    </span>

                    {sc.linkedStoryId && (
                      <span className="text-gray-600">
                        Linked Story:{" "}
                        {storyTitles[sc.linkedStoryId] || "Loading..."}
                      </span>
                    )}

                    <span className="text-gray-700">
                      Test Cases: {sc.caseCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {openCreateModal && (
        <CreateTestPlan
          projectId={projectId}
          mode="modal"
          onClose={() => setOpenCreateModal(false)}
          onSuccess={() => {
            setOpenCreateModal(false);
            fetchPlans();
          }}
        />
      )}

      {/* EDIT MODAL */}
      {openEditModal && editPlanId && (
        <EditTestPlan
          projectId={projectId}
          planId={editPlanId}
          mode="modal"
          onClose={() => setOpenEditModal(false)}
          onSuccess={() => {
            setOpenEditModal(false);
            fetchPlans();
          }}
        />
      )}
    </div>
  );
}
