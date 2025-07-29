import React, { useEffect, useState } from "react";
import defaultProject from "../../assets/images/project-default.jpg";
import defaultProfil from "../../assets/images/profil-default.jpeg";
const ProjectEmployeModal = ({ project, onClose }) => {
  const {
    assignedEmployees = [],
    city,
    company,
    description,
    logo,
    name,
    priority,
    progression,
    startDate,
    status,
    createdAt,
    updatedAt,
  } = project;
  console.log("employes", project);
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
          {logo ? (
            <img
              src={`http://localhost:5001/public/${logo}`}
              alt="Logo du projet"
              className="modal-logo"
            />
          ) : (
            <img
              src={defaultProject}
              alt="Logo du projet"
              className="modal-logo"
            />
          )}

          <div className="modal-title-container-projet">
            <h2 className="modal-title">{name}</h2>
            <p className="modal-subtitle">
              {company} • {city}
            </p>
            <p className="modal-subtitle small">
              Début : {startDate.slice(0, 10)}
            </p>
          </div>
        </div>
        <p className="modal-description">
          {description || "Aucune description disponible."}
        </p>
        <div className="modal-section">
          <strong>Crée le :</strong>
          <span>{createdAt.slice(0, 10)}</span>
        </div>{" "}
        <div className="modal-section">
          <strong>Mis à jour le :</strong> <span>{updatedAt.slice(0, 10)}</span>
        </div>{" "}
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

export default ProjectEmployeModal;
