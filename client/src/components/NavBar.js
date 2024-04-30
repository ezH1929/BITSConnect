import React from 'react';
import '../assets/styles/NavBar.css';  // Ensure CSS is properly linked

import { useAuth } from '../contexts/AuthContext';

function Navbar() {
    const { isLoggedIn, currentUser, logout } = useAuth();

    const userGreeting = isLoggedIn && currentUser ? (
        <>
            <p className="navbar-greeting">Welcome, {currentUser.username}!</p>
            <button className="navbar-button" onClick={logout}>Logout</button>
        </>
    ) : (
        <p className="navbar-greeting">Please log in</p>
    );

    return (
        <nav className="navbar">
            <h1 className="navbar-title">BitsConnect</h1>
            <div className="navbar-content">
                {userGreeting}
            </div>
        </nav>
    );
}

export default Navbar;
