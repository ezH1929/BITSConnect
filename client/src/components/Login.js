import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';  // Ensure this path is correct
import '../assets/styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setCurrentUser } = useAuth();  // Combined destructuring for clarity

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://bitsconnect.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);  // Storing the token securely in localStorage
        setIsLoggedIn(true);  // Setting login state to true using the context method
        setCurrentUser(data.user);  // Save user data in context

        // Redirect based on admin status
        if (data.isAdmin) {
          navigate('/admin');  // Redirect to admin dashboard if user is an admin
        } else {
          navigate('/home');  // Redirect to home page or user dashboard for regular users
        }
      } else {
        throw new Error(data.msg || 'An error occurred during login.');
      }
    } catch ( error) {
      console.error('Login error:', error.message);
      alert('Login failed: ' + error.message);  // Provide feedback to user on failure
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
