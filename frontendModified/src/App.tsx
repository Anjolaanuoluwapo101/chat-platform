import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Messages from './components/messages/Messages';
import GroupList from './components/group/GroupList';
import GroupMessages from './components/group/GroupMessages';
import Dashboard from './components/others/Dashboard';
import Privacy from './components/others/Privacy';
import authService from './services/auth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Landing from './components/marketing/Landing';
import Pricing from './components/marketing/Pricing';
import About from './components/marketing/About';
import Changelog from './components/marketing/Changelog';


// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// Redirects "/messages" to the current user's own inbox, since there is no
// backend endpoint for listing all conversations - the only real DM view
// is the authenticated user's own inbox at /messages/:username.
const MessagesIndexRedirect = () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser?.username) {
    return <Navigate to="/login" />;
  }
  return <Navigate to={`/messages/${currentUser.username}`} />;
};

// Shows the marketing Landing page for logged-out visitors, redirects
// authenticated users straight to their dashboard.
const RootRoute = () => {
  return authService.isAuthenticated() ? <Navigate to="/dashboard" /> : <Landing />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Marketing pages */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/changelog" element={<Changelog />} />

          {/* Individual Messages */}
          <Route
            path="/messages"
            element={<MessagesIndexRedirect />}
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
          {/* Note: "/groups/create" removed - group creation is only reachable
              via the CreateGroupModal launched from GroupList, per wireframe bug fix. */}
          <Route path="/groups/create" element={<Navigate to="/groups" />} />
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

          <Route path="/privacy" element={
            <ProtectedRoute>
              <Privacy />
            </ProtectedRoute>
          } />

          <Route path="/" element={<RootRoute />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App