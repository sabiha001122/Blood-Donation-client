import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DonorsPage from "./pages/DonorsPage";
import DonorDetailPage from "./pages/DonorDetailPage";
import DonationsPage from "./pages/DonationsPage";
import InstitutionsPage from "./pages/InstitutionsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import DonorSearchPage from "./pages/DonorSearchPage";
import RequestsPage from "./pages/RequestsPage";
import RequestFeedPage from "./pages/RequestFeedPage";

// Wrapper that redirects guests to /login.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-700">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// AdminRoute ensures the user is authenticated AND has admin role.
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-700">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donors"
            element={
              <ProtectedRoute>
                <DonorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donors/:id"
            element={
              <ProtectedRoute>
                <DonorDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <AdminRoute>
                <DonationsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/institutions"
            element={
              <AdminRoute>
                <InstitutionsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <RequestFeedPage />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<DonorSearchPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
