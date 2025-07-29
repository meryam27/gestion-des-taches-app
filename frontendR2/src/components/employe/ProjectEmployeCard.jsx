import React, { useState } from "react";
// import "./ProjectEmployeCard.css";
import defaultProject from "../../assets/images/project-default.jpg";
import defaultProfil from "../../assets/images/profil-default.jpeg";
import ProjectEmployeModal from "./ProjectEmployeModal.jsx";
import "../admin/ProjectCard.css";

const ProjectEmployeCard = ({ project }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  console.log("ProjectCard", project);
  return (
    <>
      <div className="project-card" onClick={handleCardClick}>
        <div className="project-card-header">
          {project.logo ? (
            <img
              src={`http://localhost:5001/public/${project.logo}`}
              alt="Logo du projet"
              className="project-logo"
            />
          ) : (
            <img
              src={defaultProject}
              alt="Logo du projet"
              className="project-logo"
            />
          )}

          <div className="project-info">
            <h3 className="project-title">{project.name}</h3>
            <p className="project-company">
              {project.company} • {project.city}
            </p>
          </div>
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
        <ProjectEmployeModal
          project={project}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProjectEmployeCard;
