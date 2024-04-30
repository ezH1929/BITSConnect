import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'client/src/contexts/AuthContext.js'; // Path may vary

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // User not logged in
    return <Navigate to="/login" />;
  }

  return children;
};
