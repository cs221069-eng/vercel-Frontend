import { Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated, clearLocalSession, getRoleHomePath } from "./utils/auth";
import LoginPage from "./component/LoginPage";
import AdminDashboard1 from "./component/AdminDashboard1";
import AdminDashboard2 from "./component/AdminDashboard2";
import AdminDashboard3 from "./component/AdminDashboard3";
import StudentDashboard1 from "./component/StudentDashboard1";
import StudentDashboard2 from "./component/StudentDashboard2";
import TeacherDashboard1 from "./component/TeacherDashboard1";
import TeacherDashboard2 from "./component/TeacherDashboard2";
import TeacherProjects from "./component/TeacherDashboard3";
import TeacherReports from "./component/TeacherReports";

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role") || "";

  if (!isAuthenticated()) {
    clearLocalSession();
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return children;
}

function LoginRoute() {
  const role = localStorage.getItem("role") || "";

  if (isAuthenticated()) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/admin-dashboard-1"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard1 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard-2"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard2 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard-3"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard3 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard-1"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard1 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard-2"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard2 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-dashboard-1"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard1 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-dashboard-2"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard2 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-projects"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherProjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-reports"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherReports />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
