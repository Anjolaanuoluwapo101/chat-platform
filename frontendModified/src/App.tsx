import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Messages from './components/messages/Messages';
import GroupList from './components/group/GroupList';
import CreateGroup from './components/group/CreateGroup';
import GroupMessages from './components/group/GroupMessages';
import Dashboard from './components/others/Dashboard';
import authService from './services/auth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
              // <ProtectedRoute>
              <Messages />
              // </ProtectedRoute>
            }
          />

          {/* Group Messages */}
          {/* Groups */}
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/create"
            element={
              <ProtectedRoute>
                <CreateGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupMessages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App