import React, { createContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={{ isAuthenticated: false, user: null, role: null }}>
      {children}
    </AuthContext.Provider>
  );
};