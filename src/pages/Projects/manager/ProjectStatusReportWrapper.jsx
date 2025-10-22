// ProjectStatusReportWrapper.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectStatusReport from './ProjectStatusReport';
import { useParams } from 'react-router-dom'; 

function ProjectStatusReportWrapper() {
  const { projectId } = useParams();
  console.log('Wrapper loaded with projectId:', projectId);
  const [projectData, setProjectData] = useState(null);
  const authToken = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${authToken}` };

  useEffect(() => {
    if (!projectId) return;
    async function fetchData() {
      try {
        const [
          projectRes,
          epicsRes,
          storiesRes,
          tasksRes,
          sprintsRes,
          bugsRes,
          usersRes,
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/bugs/project/${projectId}`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users`, { headers }),
        ]);

        const projectDetails = projectRes.data;

        const combinedIssues = [
          ...epicsRes.data.map(item => ({
            id: item.id,
            title: item.title,
            assignee: item.assignee,
            type: 'Epic',
            status: item.status,
            storyPoints: item.storyPoints || 0,
            estimate: item.estimate || 0,
            created: item.created || item.createdAt || '-',
          })),
          ...storiesRes.data.map(item => ({
            id: item.id,
            title: item.title,
            assignee: item.assignee,
            type: 'Story',
            status: item.status,
            storyPoints: item.storyPoints || 0,
            estimate: item.estimate || 0,
            created: item.created || item.createdAt || '-',
          })),
          ...tasksRes.data.map(item => ({
            id: item.id,
            title: item.title,
            assignee: item.assignee,
            type: 'Task',
            status: item.status,
            storyPoints: item.storyPoints || 0,
            estimate: item.estimate || 0,
            created: item.created || item.createdAt || '-',
          })),
          ...bugsRes.data.map(item => ({
            id: item.id,
            title: item.title,
            assignee: item.assignee,
            type: 'Bug',
            status: item.status,
            storyPoints: item.storyPoints || 0,
            estimate: item.estimate || 0,
            created: item.created || item.createdAt || '-',
          })),
        ];

        const sprints = sprintsRes.data.map(sprint => ({
          id: sprint.id,
          name: sprint.name,
          done: sprint.done || 0,
          in_progress: sprint.in_progress || 0,
          todo: sprint.todo || 0,
          storyPoints: {
            estimated: sprint.storyPointsEstimated || 0,
            completed: sprint.storyPointsCompleted || 0,
          },
        }));

        const totalEstimated = sprints.reduce((sum, sp) => sum + (sp.storyPoints.estimated || 0), 0);
        const totalCompleted = sprints.reduce((sum, sp) => sum + (sp.storyPoints.completed || 0), 0);
        const progressPercent = totalEstimated > 0 ? (totalCompleted / totalEstimated) * 100 : 0;

        const risks = projectDetails.risks?.map(risk => ({
          id: risk.id,
          title: risk.title,
          severity: risk.severity,
        })) || [];

        const projectInfo = {
          id: projectDetails.id,
          name: projectDetails.name,
          status: projectDetails.status === 'ACTIVE' ? 'In Progress' : projectDetails.status,
          progress: Math.round(progressPercent),
          startDate: projectDetails.startDate || '2025-01-01',
          endDate: projectDetails.endDate || '2025-12-31',
          risks,
        };

        setProjectData({ project: projectInfo, sprints, issues: combinedIssues });
      } catch (error) {
        console.error('Failed to load data', error);
      }
    }

    fetchData();
  }, [projectId, authToken]);

  if (!projectData) return <div>Loading project data...</div>;

  return <ProjectStatusReport projectData={projectData} />;
}

export default ProjectStatusReportWrapper;
