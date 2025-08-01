import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { Navigate } from "react-router-dom";
import StatsPage from "./pages/employe/StatsPage";
import Taches from "./pages/employe/Taches";
import Favorites from "./pages/employe/Favorites";
import Profil from "./pages/employe/ProfilPage";
import Login from "./pages/login";
import NavbarAdmin from "./components/admin/NavbarAdmin";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ProjetsAdmin from "./pages/admin/ProjetsAdmin";
import Employes from "./pages/admin/Employes";
import ProfilPage from "./pages/admin/ProfilPage";
import TasksPage from "./pages/admin/TasksPage";
import NavbarEmploye from "./components/employe/NavbarEmploye";
import ProjectEmployePage from "./pages/employe/ProjectEmployePage";
function App() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const path = location.pathname;
  return (
    <>
      {role === "employee" &&
        (path == "/employe/dashboard" ||
          path == "/employe/projets" ||
          path == "/employe/taches" ||
          path == "/employe/favorites" ||
          path == "/employe/profil") && <NavbarEmploye />}
      {role === "admin" &&
        (path == "/admin/dashboard" ||
          path == "/admin/projets" ||
          path == "/admin/employes" ||
          path == "/admin/profil" ||
          path == "/admin/taches") && <NavbarAdmin />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/employe/dashboard"
          element={
            <>
              <ProtectedRoute role="employee">
                <StatsPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/projets"
          element={
            <>
              <ProtectedRoute role="employee">
                <ProjectEmployePage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/taches"
          element={
            <>
              <ProtectedRoute role="employee">
                <Taches />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/favorites"
          element={
            <>
              <ProtectedRoute role="employee">
                <Favorites />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/profil"
          element={
            <>
              <ProtectedRoute role="employee">
                <Profil />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <>
              <ProtectedRoute role="admin">
                <DashboardAdmin />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/admin/projets"
          element={
            <>
              <ProtectedRoute role="admin">
                <ProjetsAdmin />
              </ProtectedRoute>
            </>
          }
        />

        <Route
          path="/admin/employes"
          element={
            <>
              <ProtectedRoute role="admin">
                <Employes />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/admin/taches"
          element={
            <>
              <ProtectedRoute role="admin">
                <TasksPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/admin/profil"
          element={
            <>
              <ProtectedRoute role="admin">
                <ProfilPage />
              </ProtectedRoute>
            </>
          }
        />

        {/* cette methode s'appelle cath-path pour tous les routes non definie  */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
