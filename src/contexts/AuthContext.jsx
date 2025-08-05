import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    let mockUser = null;

    if (username === 'admin' && password === 'admin123') {
      mockUser = {
        id: '1',
        name: 'John Administrator',
        email: 'admin@company.com',
        role: 'System Administrator',
      };
    } else if (username === 'developer' && password === 'dev123') {
      mockUser = {
        id: '2',
        name: 'Dev User',
        email: 'developer@company.com',
        role: 'Developer',
      };
    } else if (username === 'manager' && password === 'manager123') {
      mockUser = {
        id: '3',
        name: 'Manager User',
        email: 'manager@company.com',
        role: 'Manager',
      };
    }

    if (mockUser) {
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('userRole', mockUser.role);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userRole');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
