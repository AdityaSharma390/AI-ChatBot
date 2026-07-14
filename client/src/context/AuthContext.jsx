import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default anonymous user — no login required
  const [user] = useState({
    _id: 'anonymous',
    name: 'User',
    email: ''
  });
  const [loading] = useState(false);
  const [error] = useState(null);

  // No-op functions to keep the interface compatible
  const login = async () => ({ success: true });
  const register = async () => ({ success: true });
  const logout = () => {};
  const setUser = () => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
