// src/services/projectService.js
import axios from "axios";

const RMS_BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const projectService = {
  // Fetch all projects from backend
  getProjects: async () => {
    try {
      const response = await fetch(`${RMS_BASE_URL}/api/projects/get-projects`, getAuthHeader());
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      
      // Enriched data: mapping backend fields to UI needs + adding mock resource data
      return result.data.map(project => ({
        ...project,
        id: project.pmsProjectId.toString(), // UI expects string 'id'
        clientName: `Client ${project.clientId.substring(0, 5)}`, // Mocking a readable client name
        progress: Math.floor(Math.random() * 100), // Random progress for UI
        readiness: project.dataStatus === "COMPLETE" ? "Ready" : "Not Ready",
        // Mocking allocations as backend doesn't provide them yet
        allocations: [
          { id: "RES-101", name: "Alex Rivera", role: "Lead Dev", type: "Billable", allocation: 100, start: "2026-02-01", end: "2026-10-01" },
          { id: "RES-204", name: "Sam Chen", role: "UI Designer", type: "Shadow", allocation: 50, start: "2026-03-01", end: "2026-06-01" }
        ]
      }));
    } catch (error) {
      console.error("Project Service Error:", error);
      throw error;
    }
  }
};