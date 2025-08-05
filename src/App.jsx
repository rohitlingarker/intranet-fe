import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import IntranetForm from './components/forms/IntranetForm'; 
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
// };

const AppRoutes = () => {
  // const { isAuthenticated } = useAuth();

  // if (!isAuthenticated) {
  //   return <LoginPage />;
  // }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/intranet-form" element={<IntranetForm />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      {/* <AuthProvider> */}
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </NotificationProvider>
      {/* </AuthProvider> */}
    </Router>
  );
}

export default App;