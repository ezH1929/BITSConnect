import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';  // Make sure this path is correct and context is properly exported
import '../assets/styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();  // Using the useAuth hook to access the context
  const { setCurrentUser } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token);  // Storing the token securely in localStorage
        setIsLoggedIn(true);  // Setting login state to true using the context method
        navigate('/home');  // Redirect to home page on successful login
        // Fetch user details here after authentication state is set
        fetchUserDetails(); // Call function to fetch user details
      } else {
        throw new Error(data.msg || 'An error occurred during login.');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      alert('Login failed: ' + error.message);  // Provide feedback to user on failure
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await fetch('http://localhost:3001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const userData = await response.json();
      console.log('User details:', userData);
      setCurrentUser(userData); 
      // Handle user details as needed
    } catch (error) {
      console.error('Error fetching user details:', error.message);
    }
  };

  const handleSignUp = () => {
    navigate('/signup');  // Navigate to signup page
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <h1>Welcome to Our Site</h1>
        <p>Join us and explore new possibilities.</p>
      </div>
      <div className="login-right">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          <div className="input-group">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="email" placeholder=" " required />
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-group">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} id="password" placeholder=" " required />
            <label htmlFor="password">Password</label>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="show-password-button">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="login-button">Log In</button>
          <button type="button" onClick={handleSignUp} className="signup-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
