import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, PrivateRoute, PublicRoute } from './contexts/AuthContext'; // Import from AuthContext
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './pages/HomePage';
import GroupPage from './pages/GroupPage'; // Make sure the import path is correct
import Admin from "./pages/AdminDashboard";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
                <Route path="/groups/:groupId" element={<PrivateRoute><GroupPage /></PrivateRoute>} /> {/* New route for group details */}
            </Routes>
        </AuthProvider>
    );
}

export default App;
