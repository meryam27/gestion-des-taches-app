import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { NavLink } from "react-router-dom";

const NavbarEmploye = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      {/* Bouton menu pour petits écrans */}
      <button className="toggle-button d-lg-none" onClick={toggleMenu}>
        {menuOpen ? (
          <i class="fa-solid fa-xmark"></i>
        ) : (
          <i className="fas fa-bars"></i>
        )}
      </button>

      {/* Barre de navigation principale */}
      <div className={`navbar ${menuOpen ? "menu-open" : ""}`}>
        <div className="logo">
          <img src={logo} alt="logo" className="logo-entreprise" />
        </div>
        <div className="menu">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-home"></i>
          </NavLink>
          <NavLink
            to="/projets"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-folder"></i>
          </NavLink>
          <NavLink
            to="/taches"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-list-check"></i>
          </NavLink>
          <NavLink
            to="/prioritaires"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-star"></i>
          </NavLink>
          <NavLink
            to="/profil"
            className={({ isActive }) => (isActive ? "active" : "not-active")}
          >
            <i className="fa-solid fa-address-card"></i>
          </NavLink>
        </div>
        <div className="profil-connecte text-white rounded-circle d-flex justify-content-center align-items-center">
          NP
        </div>
        <div className="deconnexion text-body-secondary">
          <button>Déconnexion</button>
        </div>
      </div>
    </>
  );
};

export default NavbarEmploye;
