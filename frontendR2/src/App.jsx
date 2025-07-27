import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { Navigate } from "react-router-dom";
import DashboardEmploye from "./pages/employe/DashboardEmploye";
import Projets from "./pages/employe/Projets";
import Taches from "./pages/employe/Taches";
import Prioritaires from "./pages/employe/Prioritaires";
import Profil from "./pages/employe/Profil";
import Login from "./pages/login";
import NavbarAdmin from "./components/admin/NavbarAdmin";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ProjetsAdmin from "./pages/admin/ProjetsAdmin";
import Employes from "./pages/admin/Employes";
import ProfilPage from "./pages/admin/ProfilPage";
import TasksPage from "./pages/admin/TasksPage";
function App() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const path = location.pathname;
  return (
    <>
      {role === "employe" &&
        (path == "/employe/dashboard" ||
          path == "/employe/projets" ||
          path == "/employe/taches" ||
          path == "/employe/prioritaires" ||
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
              <ProtectedRoute role="employe">
                <DashboardEmploye />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/projets"
          element={
            <>
              <ProtectedRoute role="employe">
                <Projets />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/taches"
          element={
            <>
              <ProtectedRoute role="employe">
                <Taches />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/prioritaires"
          element={
            <>
              <ProtectedRoute role="employe">
                <Prioritaires />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/employe/profil"
          element={
            <>
              <ProtectedRoute role="employe">
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
