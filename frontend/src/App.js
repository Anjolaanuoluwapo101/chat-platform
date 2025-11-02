import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Messages from './components/Messages';
import authService from './services/auth';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Individual Messages */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Navigate to={`/messages/${authService.getCurrentUser()?.username}`} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:username"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
