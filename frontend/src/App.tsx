import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { supabase, isMockSupabase } from "./lib/supabase";
import { ToastProvider } from "./components/ToastProvider";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import DriverDashboard from "./pages/DriverDashboard";
import Stations from "./pages/Stations";
import StationDetails from "./pages/StationDetails";
import OperatorDashboard from "./pages/OperatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyReservations from "./pages/MyReservations";
import AdminStations from "./pages/AdminStations";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import OperatorQueue from "./pages/OperatorQueue";
import OperatorReservations from "./pages/OperatorReservations";
import StationOwnerDashboard from "./pages/StationOwnerDashboard";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Notifications from "./pages/Notifications";

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective home based on role
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "station_owner") return <Navigate to="/station-owner" replace />;
    if (user.role === "operator") return <Navigate to="/operator" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const { setUser, login } = useAuthStore();

  useEffect(() => {
    if (isMockSupabase) {
      const token = localStorage.getItem("quickfuel_token");
      const user = localStorage.getItem("quickfuel_user");
      if (token && !user) {
        setUser(null);
      }
      return;
    }

    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setUser(null);
        return;
      }
      
      if (session?.user) {
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              login(profile, session.access_token);
            } else {
              // Fallback if profile not found
              login({
                id: session.user.id,
                role: (session.user.user_metadata?.role as any) || 'driver',
                full_name: session.user.user_metadata?.full_name || 'User',
                email: session.user.email,
                phone: session.user.phone || '',
              }, session.access_token);
            }
          });
      }
    }).catch(() => {
      setUser(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              login(profile, session.access_token);
            }
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, login]);

  return (
    <Router>
      <ToastProvider />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<DashboardLayout />}>
          {/* Driver Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["driver"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stations"
            element={
              <ProtectedRoute allowedRoles={["driver"]}>
                <Stations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stations/:id"
            element={
              <ProtectedRoute allowedRoles={["driver"]}>
                <StationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={["driver"]}>
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["driver", "operator", "admin", "station_owner"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["driver", "operator", "admin", "station_owner"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Operator Routes */}
          <Route
            path="/operator"
            element={
              <ProtectedRoute allowedRoles={["operator"]}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator/queue"
            element={
              <ProtectedRoute allowedRoles={["operator"]}>
                <OperatorQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator/reservations"
            element={
              <ProtectedRoute allowedRoles={["operator"]}>
                <OperatorReservations />
              </ProtectedRoute>
            }
          />

          {/* Station Owner Routes */}
          <Route
            path="/station-owner"
            element={
              <ProtectedRoute allowedRoles={["station_owner"]}>
                <StationOwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stations"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminStations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
