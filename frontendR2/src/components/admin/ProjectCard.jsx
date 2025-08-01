import React, { useState } from "react";

import defaultProject from "../../assets/images/project-default.jpg";
import defaultProfil from "../../assets/images/profil-default.jpeg";
import ProjectModal from "./ProjectModel";
import { FiTrash2, FiEdit } from "react-icons/fi";
import "./ProjectCard.css";
const ProjectCard = ({ project, onDelete, handelEditClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (e) => {
    // Ne pas ouvrir le modal si clic sur les icônes
    if (e.target.closest(".edit-icon, .delete-icon")) return;
    setIsModalOpen(true);
  };
  const handelDeleteClick = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      onDelete(project._id);
    }
  };
  console.log("ProjectCard", project);
  return (
    <>
      <div className="project-card" onClick={handleCardClick}>
        <div className="project-card-header">
          <img
            src={project.logoUrl || defaultProject}
            alt="Logo du projet"
            className="project-logo"
          />
          <div className="project-info">
            <h3 className="project-title">{project.name}</h3>
            <p className="project-company">
              {project.company} • {project.city}
            </p>
          </div>
        </div>

        <div className="project-actions">
          <FiEdit
            className="edit-icon"
            title="Modifier"
            onClick={() => handelEditClick(project)}
            style={{ zIndex: 1000 }}
          />
          <FiTrash2
            className="delete-icon"
            title="Supprimer"
            onClick={() => handelDeleteClick()}
            style={{ zIndex: 1000 }}
          />
        </div>

        <div className="project-status">
          <span className={`badge status ${project.status}`}>
            {project.status}
          </span>
          <span className={`badge priority ${project.priority}`}>
            {project.priority}
          </span>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${project.progression}%` }}
            ></div>
          </div>
          <span className="progress-text">{project.progression}%</span>
        </div>

        <div className="assigned-employees">
          <div className="avatars">
            <img
              src={defaultProfil}
              alt="Aucun employé"
              className="employee-avatar"
              style={{ marginLeft: "2rem" }}
            />
          </div>
          <span className="employee-count">
            {project.assignedEmployees?.length || 0} membre(s)
          </span>
        </div>
      </div>

      {isModalOpen && (
        <ProjectModal project={project} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ProjectCard;
