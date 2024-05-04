import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Login.css'


function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        // Redirect to login page or directly log in the user
        navigate('/login', { replace: true });  // Using replace to avoid navigating back to signup via the browser's back button

      } else {
        throw new Error(data.msg || 'An error occurred during registration.');
      }
    } catch (error) {
      console.error('Registration error:', error.message);
      // Handle errors or show error message to user
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  

  return (
    <div className="signup-wrapper">
      <div className="signup-left">
        <h1>Welcome to website</h1>
        <p>Please create an account to get started.</p>
      </div>
      <div className="signup-right">
        <form onSubmit={handleSubmit} className="signup-form">
          <h2>Sign Up</h2>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              placeholder=" " // Invisible placeholder
            />
            <label htmlFor="username">Username</label>
          </div>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder=" " // Invisible placeholder
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-group password">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              placeholder=" " // Invisible placeholder
            />
            <label htmlFor="password">Password</label>
            <button type="button" onClick={togglePasswordVisibility} className="show-password-button">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
      </div>
    </div>
  );

}

export default Signup;
