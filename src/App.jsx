import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import LoginPage from './pages/LoginPage';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';

import Sidebar from './pages/Projects/manager/Sidebar';
import ProjectDashboard from './pages/Projects/manager/ProjectDashboard';
import Summary from './pages/Projects/manager/Summary';
import Backlog from './pages/Projects/manager/Backlog/Backlog';
import Board from './pages/Projects/manager/Board';
import CreateProjectModal from './pages/Projects/manager/CreateProjectModal';
import ProjectTabs from './pages/Projects/manager/ProjectTabs';

import ReadOnlyDashboard from './pages/Projects/User/ReadOnlyDashboard';
import AdminDashboard from './pages/Projects/Admin/admindashboard';
import UserProjectTabs from './pages/Projects/User/UserProjectTabs';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const ProjectManager = () => {
  const [showCreateProjectModal, setShowCreateProjectModal] = React.useState(false);

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

// Component to save last visited path on every navigation
const SaveLastPath = () => {
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location.pathname]);

  return null;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const lastPath = localStorage.getItem('lastPath');
      // Redirect to lastPath only if valid and not root/login
      if (lastPath && lastPath !== '/' && lastPath !== '/login') {
        navigate(lastPath, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        {/* Removed "/" redirect because handled in useEffect */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/dashboard" element={<AdminDashboard />} />
        <Route path="/projects/developer" element={<ReadOnlyDashboard />} />
        <Route path="/projects/manager" element={<ProjectDashboard />} />
        <Route path="/projects/*" element={<ProjectManager />} />
        <Route path="/projects/:projectId" element={<ProjectTabs />} />
        <Route path="/projects/user/:projectId" element={<UserProjectTabs />} />
      </Routes>

      <SaveLastPath />
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
