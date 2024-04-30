import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('https://bitsconnect.onrender.com/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const data = await response.json();
        setCurrentUser(data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error fetching user details:', error.message);
        setCurrentUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
    return () => {}; // Optional cleanup mechanism
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://bitsconnect.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errMsg = (await response.json()).message || 'Login failed';
        throw new Error(errMsg);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsLoading(false);
    navigate('/login');
  }, [navigate]);

  const value = useMemo(() => ({
    currentUser, 
    isLoggedIn, 
    login, 
    logout, 
    isLoading,
    setIsLoggedIn,  
    setCurrentUser 
  }), [currentUser, isLoggedIn, isLoading, login, logout]); // Include navigate in the dependency array

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function PrivateRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return isLoggedIn ? children : <Navigate to="/login" />;
}

export function PublicRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return isLoggedIn ? <Navigate to="/home" /> : children;
}
