import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from 'react-dom'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Make sure to import the AuthProvider

const root = createRoot(document.getElementById('root')); // Use createRoot instead of ReactDOM.createRoot
root.render(
    <React.StrictMode>
    <BrowserRouter> {/* Wrap your app with BrowserRouter */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
