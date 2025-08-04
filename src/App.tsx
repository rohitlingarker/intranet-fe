import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// These should be created already in your src/contexts/
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// These are your pages/components; update the paths as actually in your app!
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Projects from './pages/Projects';


// NOTE: If these files are `.jsx`, the import works just the same!
// @ts-ignore
import AdminLeavePannel from './pages/leave_management/AdminLeavePannel';
// @ts-ignore
import EmployeeLeavePannel from './pages/leave_management/EmployeeLeavePannel';

// @ts-ignore
import AdminPanel from '../src/pages/leave_management/AdminPanel';
// @ts-ignore
import EmployeePanel from "../src/pages/leave_management/EmployeePanel"

import Timesheets from './pages/Timesheets';
import Calendar from './pages/Calendar';

// Child component containing all routes and role redirects
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Not logged in: show Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Redirect based on role (employees go to /leave-management, admins to /leave)
  if (
    window.location.pathname === '/' ||
    window.location.pathname === '/leave' ||
    window.location.pathname === '/leave-management'
  ) {
    if (user?.role === 'Employee' && window.location.pathname !== '/leave-management') {
      return <Navigate to="/leave-management" replace />;
    }
    if (user?.role === 'Manager' && window.location.pathname !== '/leave') {
      return <Navigate to="/leave" replace />;
    }
  }

  const employeeId = user?.id;

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/leave" element={<EmployeePanel employeeId={employeeId} role={user?.role?.toLocaleLowerCase()} />} />
        {/* <Route path='/admin' element={<ProtectedRoute allowedRoles={['Manager']}><AdminPanel /></ProtectedRoute>}></Route> */}
       <Route path='/leave-management' element={<EmployeePanel employeeId={employeeId} role={user?.role?.toLocaleLowerCase()} />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/calendar" element={<Calendar />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
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
