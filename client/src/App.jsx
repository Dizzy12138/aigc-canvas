import React, { useContext } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ProjectList from './components/ProjectList';
import CanvasEditor from './components/CanvasEditor';

function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function NavBar() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
      <Link to="/" style={{ marginRight: '8px' }}>
        Home
      </Link>
      {token ? (
        <>
          <Link to="/projects" style={{ marginRight: '8px' }}>
            Projects
          </Link>
          <button type="button" onClick={handleLogout}>
            Logout ({user?.username})
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '8px' }}>
            Login
          </Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <div>
      <NavBar />
      <div style={{ padding: '16px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/projects"
            element={(
              <ProtectedRoute>
                <ProjectList />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/projects/:id"
            element={(
              <ProtectedRoute>
                <CanvasEditor />
              </ProtectedRoute>
            )}
          />
          <Route path="/" element={<Navigate to="/projects" />} />
        </Routes>
      </div>
    </div>
  );
}