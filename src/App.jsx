import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import LoginPage from './pages/LoginPage';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
//import Users from './pages/Users';
//import Leave from './pages/Leave';
//import Timesheets from './pages/Timesheets';
//import Calendar from './pages/Calendar';

import Sidebar from './pages/Projects/manager/Sidebar';

import ProjectDashboard from './pages/Projects/manager/ProjectDashboard';
import Summary from './pages/Projects/manager/Summary';
import Backlog from './pages/Projects/manager/Backlog/Backlog';
import  Board  from './pages/Projects/manager/Board';
import CreateProjectModal from './pages/Projects/manager/CreateProjectModal';
import ProjectTabs from './pages/Projects/manager/ProjectTabs';
import ReadOnlyDashboard from './pages/Projects/User/ReadOnlyDashboard';
import AdminDashboard from './pages/Projects/Admin/admindashboard';
import UserDashboard from './pages/Projects/User/userdashboard';
import UserBacklog from './pages/Projects/User/Backlog/userbacklog';
import UserProjectTabs from './pages/Projects/User/UserProjectTabs';
import ProjectList from './pages/Projects/manager/ProjectList';


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const ProjectManager = () => {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        onSelectProject={() => {}}
        onCreateProject={() => setShowCreateProjectModal(true)}
        onToggleSidebar={() => {}}
        selectedProjectId={null}
        collapsed={false}
        projects={[]}
        starredTasksCount={0}
      />

      <div className="flex-1 flex flex-col">
        <ProjectTabs selectedTab="summary" onTabSelect={() => {}} />
        <main className="flex-1 overflow-auto bg-white">
          <Summary project={null} tasks={[]} />
        </main>
      </div>

      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onProjectCreated={() => {}}
      />
    </div>
  );
};

const DeveloperProjectView = () => (
  <div className="p-6 text-xl font-semibold text-gray-800">Developer Project Page</div>
);

const ManagerProjectView = () => (
  <div className="p-6 text-xl font-semibold text-gray-800">Manager Project Page</div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/dashboard" element={<AdminDashboard />} />
        <Route path="/projects/developer" element={<ReadOnlyDashboard />} />
        <Route path="/projects/manager" element={<ProjectDashboard />} />
        {/* <Route path="/users" element={<Users />} /> */}
        {/* <Route path="/leave" element={<Leave />} /> */}
        {/* <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/calendar" element={<Calendar />} /> */}
        <Route path="/projects/*" element={<ProjectManager />} />
        <Route path="/projects/:projectId" element={<ProjectTabs />} />
        <Route path="/projects/user/:projectId" element={<UserProjectTabs />} />
        <Route path="/projects/list" element={<ProjectList />} />

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
