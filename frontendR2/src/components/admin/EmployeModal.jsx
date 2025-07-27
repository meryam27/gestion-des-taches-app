import React, { useState, useEffect } from "react";
import "./EmployeModal.css";
import defaultProjectLogo from "../../assets/images/project-default.jpg";
import { FiX, FiExternalLink, FiZap } from "react-icons/fi";
import ProjectModal from "../../components/admin/ProjectModel.jsx";

const EmployeModal = ({ employeeData, onClose }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const { employee, projects } = employeeData;

  // Lorsqu'on clique sur un projet, on enregistre le projet cliqué
  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  // Dès que selectedProject change, on ouvre la modale du projet et ferme celle de l'employé
  useEffect(() => {
    if (selectedProject) {
      setShowProjectModal(true);
      onClose(); // Ferme la modale Employé
    }
  }, [selectedProject, onClose]);

  // Ferme la modale de projet
  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  // Affiche un badge de priorité coloré
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: { label: "Haute", color: "#f44336", bg: "#ffebee" },
      medium: { label: "Moyenne", color: "#ff9800", bg: "#fff8e1" },
      low: { label: "Basse", color: "#4caf50", bg: "#e8f5e9" },
    };
    const { label, color, bg } = priorityMap[priority] || {
      label: priority,
      color: "#9e9e9e",
      bg: "#f5f5f5",
    };
    return (
      <span
        className="priority-badge-employe"
        style={{ backgroundColor: bg, color }}
      >
        {label} Priorité
      </span>
    );
  };

  return (
    <>
      <div className="modal-overlay-employe" onClick={onClose}>
        <div
          className="modal-container-employe"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-modal-btn-employe" onClick={onClose}>
            <FiX size={24} />
          </button>

          <div className="modal-header-employe">
            <div className="employee-avatar-employe">
              {employee.profilePhoto ? (
                <img src={employee.profilePhoto} alt={employee.name} />
              ) : (
                <div className="avatar-placeholder-employe">
                  {employee.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="employee-header-info-employe">
              <h2 style={{ fontSize: "2.5rem" }}>{employee.name}</h2>
              <p style={{ fontSize: "1.5rem" }} className="position">
                {employee.position}
              </p>
              <p style={{ fontSize: "1.2rem" }} className="email">
                {employee.email}
              </p>
            </div>
          </div>

          <div className="modal-body-employe">
            <div className="details-section-employe">
              <h3 style={{ fontSize: "2rem" }}>Informations Personnelles</h3>
              <hr />
              <div className="detail-grid-employe">
                <div className="detail-item-employe">
                  <span
                    className="detail-label-employe"
                    style={{ fontSize: "1.3rem" }}
                  >
                    CIN :
                  </span>
                  <span
                    className="detail-value-employe"
                    style={{ fontSize: "1.3rem" }}
                  >
                    {employee.cin}
                  </span>
                </div>
                <div className="detail-item-employe">
                  <span className="detail-label-employe">Position :</span>
                  <span
                    className="detail-value-employe"
                    style={{ fontSize: "1.3rem" }}
                  >
                    {employee.position || "Non spécifié"}
                  </span>
                </div>
              </div>
            </div>

            <div className="projects-section-employe">
              <h3 style={{ fontSize: "1.5rem", letterSpacing: "0.1rem" }}>
                Projets Assignés ({projects.length})
              </h3>

              {projects.length > 0 ? (
                <div className="projects-grid-employe">
                  {projects.map((project, index) => (
                    <div className="project-card-employe" key={index}>
                      <div className="project-header-employe">
                        <img
                          src={project.logo || defaultProjectLogo}
                          alt={project.company || "Projet"}
                          className="project-logo-employe"
                        />
                        <div className="project-meta-employe">
                          <h4>{project.name}</h4>
                          <p className="company">{project.company}</p>
                        </div>
                      </div>

                      <div className="project-footer-employe">
                        {getPriorityBadge(project.priority)}
                        <button
                          className="project-link-employe"
                          onClick={() => handleProjectClick(project)}
                          aria-label={`Voir les détails du projet ${project.name}`}
                        >
                          <FiExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-projects-employe">
                  Aucun projet assigné pour le moment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProjectModal && selectedProject && (
        <ProjectModal
          projectData={selectedProject}
          onClose={closeProjectModal}
          style={{ zInde: 1000 }}
        />
      )}
    </>
  );
};

export default EmployeModal;
