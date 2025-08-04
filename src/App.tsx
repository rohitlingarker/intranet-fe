import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Projects from './pages/Projects';
import Leave from './pages/Leave';
import Timesheethistorypage from './pages/Timesheets/Timesheethistorypage';
import Calendar from './pages/Calendar';
import TimesheetApprovalPage from './pages/Timesheets/manager/pages/TimesheetApprovalPage';
import ApprovalTracker from './pages/Timesheets/Admin/ApprovalTracker'; 
import DashboardHeader from './pages/Timesheets/DashboardHeader';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
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
        <Route path="/users" element={<Users />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/timesheets" element={<Timesheethistorypage />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/timesheets/manager" element={<TimesheetApprovalPage />} />
        <Route path="/timesheets/admin/approval-tracker" element={<ApprovalTracker />} />
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