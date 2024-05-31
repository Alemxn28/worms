// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    setIsAuthenticated(auth === 'true');
    setUserRole(role);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
