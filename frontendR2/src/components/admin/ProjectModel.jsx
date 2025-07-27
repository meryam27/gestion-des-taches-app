import React, { useEffect, useState } from "react";
import defaultProject from "../../assets/images/project-default.jpg";
import defaultProfil from "../../assets/images/profil-default.jpeg";
import axios from "axios";
import "./ProjectModal.css";

const ProjectModal = ({ project, onClose }) => {
  const [detailProject, setDetailProject] = useState(null);

  useEffect(() => {
    if (!project || !project._id) return;

    axios
      .get(`http://localhost:5001/api/admin/projects/${project._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setDetailProject(res.data.data); // Pas besoin de .data après !
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du projet:", err.message);
      });
  }, [project]);

  if (!detailProject) return null;
  console.log("Détail du projet:", detailProject);
  // destructuration directe
  const {
    assignedEmployees = [],
    city,
    company,
    description,
    logoUrl,
    name,
    priority,
    progression,
    startDate,
    status,
  } = detailProject;

  return (
    <div
      className="modal-overlay-project"
      onClick={onClose}
      style={{ display: "fixed" }}
    >
      <div
        className="modal-content-project"
        onClick={(e) => e.stopPropagation()}
        style={{ overflowY: "auto" }}
      >
        <button className="modal-close-project" onClick={onClose}>
          &times;
        </button>

        <div className="modal-header">
          <img
            src={logoUrl || defaultProject}
            alt="Logo du projet"
            className="modal-logo"
          />
          <div className="modal-title-container-projet">
            <h2 className="modal-title">{name}</h2>
            <p className="modal-subtitle">
              {company} • {city}
            </p>
            <p className="modal-subtitle small">Début : {startDate}</p>
          </div>
        </div>

        <p className="modal-description">
          {description || "Aucune description disponible."}
        </p>

        <div className="modal-section">
          <strong>Status :</strong>{" "}
          <span className={`badge status ${status}`}>{status}</span>
        </div>

        <div className="modal-section">
          <strong>Priorité :</strong>{" "}
          <span className={`badge priority ${priority}`}>{priority}</span>
        </div>

        <div className="modal-section">
          <strong>Progression :</strong>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progression}%` }}
            ></div>
          </div>
          <span>{progression}%</span>
        </div>

        <div className="modal-section">
          <strong>Équipe assignée :</strong>
          <div className="team-container">
            {assignedEmployees.length > 0 ? (
              <>
                <div className="team-scroll-container">
                  <div className="team-grid">
                    {assignedEmployees.map((employee, index) => (
                      <div key={index} className="team-card">
                        <div className="team-card-content">
                          <div className="employee-avatar-container">
                            <img
                              src={employee.profilePhoto || defaultProfil}
                              alt={employee.name}
                              className="team-avatar"
                            />
                          </div>
                          <div className="employee-info">
                            <h4>{employee.name}</h4>
                            <p className="position">{employee.position}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="employee-count">
                  {assignedEmployees.length} membre(s)
                </span>
              </>
            ) : (
              <div className="no-team">
                <img src={defaultProfil} alt="Aucun employé" />
                <p>Aucun membre assigné à ce projet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
