import React, { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import defaultPhoto from "../../assets/images/profil-default.jpeg";

const NavbarAdmin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profil, setProfil] = useState({});
  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5001/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setProfil(res.data.data))
      .catch((err) => console.log("ERROR : ", err));
  }, []);

  const profileImageSrc =
    profil.profilePhoto && profil.profilePhoto !== "default-avatar.png"
      ? profil.profilePhoto
      : defaultPhoto;

  return (
    <>
      {/* Bouton menu pour petits écrans */}
      <button className="toggle-button d-lg-none" onClick={toggleMenu}>
        {menuOpen ? (
          <i className="fa-solid fa-xmark"></i>
        ) : (
          <i className="fas fa-bars"></i>
        )}
      </button>

      {/* Barre de navigation principale */}
      <div
        className={`navbar ${menuOpen ? "menu-open" : ""}`}
        style={{ zIndex: "100" }}
      >
        <div className="logo">
          <img src={logo} alt="logo" className="logo-entreprise" />
        </div>
        <div className="menu">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-home"></i>
          </NavLink>
          <NavLink
            to="/admin/projets"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-folder"></i>
          </NavLink>
          <NavLink
            to="/admin/taches"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-list-check"></i>
          </NavLink>
          <NavLink
            to="/admin/employes"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-users"></i>
          </NavLink>
          <NavLink
            to="/admin/profil"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-address-card"></i>
          </NavLink>
        </div>

        <div className="profil-connecte text-white rounded-circle d-flex justify-content-center align-items-center">
          <img src={profileImageSrc} alt="Profile" />
        </div>

        <div className="deconnexion text-body-secondary">
          <button>Déconnexion</button>
        </div>
      </div>
    </>
  );
};

export default NavbarAdmin;
