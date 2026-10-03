import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProblemList from "../pages/ProblemList";
import ProblemDetail from "../pages/ProblemDetail";
import NotFound from "../pages/NotFound";

const Placeholder = ({ name }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-primary-400 mb-2">{name}</h1>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Problems — public browsing, no login needed */}
      <Route path="/problems" element={<ProblemList />} />
      <Route path="/problems/:slug" element={<ProblemDetail />} />
      <Route
        path="/problems/:slug/solve"
        element={
          <ProtectedRoute>
            <MainLayout><Placeholder name="Editor (Module 11)" /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Contests */}
      <Route
        path="/contests"
        element={<MainLayout><Placeholder name="Contests" /></MainLayout>}
      />
      <Route
        path="/leaderboard"
        element={<MainLayout><Placeholder name="Leaderboard" /></MainLayout>}
      />

      {/* Dashboard (protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;