import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import LoginPage from './pages/LoginPage';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Leave from './pages/Leave';
import Timesheets from './pages/Timesheets';
import Calendar from './pages/Calendar';

// Project Management Components
import { useProjectManager } from './pages/Projects/hooks/useProjectManager';
import { Sidebar } from './pages/Projects/Sidebar';
import { ProjectTabs } from './pages/Projects/ProjectTabs';
import { ProjectDashboard  } from './pages/Projects/ProjectDashboard';
import { Summary } from './pages/Projects/Summary';
import Backlog  from './pages/Projects/Backlog/Backlog';
import { Board } from './pages/Projects/Board';
import CreateProjectModal from './pages/Projects/CreateProjectModal';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const ProjectManager: React.FC = () => {
  const {
    state,
    createProject,
    createTask,
    updateTaskStatus,
    toggleTaskStar,
    selectProject,
    setSelectedTab,
    toggleSidebar
  } = useProjectManager();

  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const selectedProject = state.projects.find(p => p.id === state.selectedProjectId);
  const projectTasks = state.tasks.filter(task => task.projectId === state.selectedProjectId);
  const starredTasksCount = state.tasks.filter(task => task.isStarred).length;

  const renderMainContent = () => {
    if (!state.selectedProjectId) {
      return <Dashboard projects={state.projects} tasks={state.tasks} />;
    }

    if (!selectedProject) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Project not found</p>
        </div>
      );
    }

    switch (state.selectedTab) {
      case 'summary':
        return <Summary project={selectedProject} tasks={projectTasks} />;
      case 'backlog':
        return (
          <Backlog
            tasks={projectTasks}
            employees={state.employees}
            projectId={selectedProject.id}
            onCreateTask={createTask}
            onToggleTaskStar={toggleTaskStar}
          />
        );
      case 'board':
        return (
          <Board
            tasks={projectTasks}
            onUpdateTaskStatus={updateTaskStatus}
            onToggleTaskStar={toggleTaskStar}
          />
        );
      default:
        return <Summary project={selectedProject} tasks={projectTasks} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        projects={state.projects}
        selectedProjectId={state.selectedProjectId}
        collapsed={state.sidebarCollapsed}
        onSelectProject={selectProject}
        onCreateProject={() => setShowCreateProjectModal(true)}
        onToggleSidebar={toggleSidebar}
        starredTasksCount={starredTasksCount}
      />

      <div className="flex-1 flex flex-col">
        {state.selectedProjectId && (
          <ProjectTabs
            selectedTab={state.selectedTab}
            onTabSelect={setSelectedTab}
          />
        )}

        <main className="flex-1 overflow-auto">
          {renderMainContent()}
        </main>
      </div>

     <CreateProjectModal
  isOpen={showCreateProjectModal}
  onClose={() => setShowCreateProjectModal(false)}
  onProjectCreated={createProject}
/>

    </div>
  )
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/dashboard" element={<ProjectDashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/projects/*" element={<ProjectManager />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
