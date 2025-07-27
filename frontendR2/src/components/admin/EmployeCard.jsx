import React, { useState } from "react";
import "./EmployeCard.css";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { FiTrash2, FiEdit } from "react-icons/fi";
import EmployeUpdate from "./EmployeUpdate";
import defaultProject from "../../assets/images/project-default.jpg";
const EmployeCard = ({ employe, onClick, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(employe);
    }
  };
  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await onUpdate(id, updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };
  console.log("EmployeCard", employe);
  return (
    <>
      <div className="employe-card" onClick={handleClick}>
        <div className="employe-actions">
          <button style={{ border: "none" }} onClick={handleEditClick}>
            <FiEdit className="edit-icon" title="Modifier" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(), onDelete(employe._id);
            }}
            style={{ border: "none" }}
          >
            <FiTrash2 className="delete-icon" title="Supprimer" />
          </button>
        </div>
        <div className="employe-avatar">
          {employe.profilePhoto ? (
            <img
              src={employe.profilePhoto}
              alt={`profile de ${employe.name}`}
            />
          ) : (
            <img src={defaultAvatar} alt="Avatar par défaut" />
          )}
        </div>
        <h3 className="employe-name">{employe.name}</h3>
        <p className="employe-position">{employe.position}</p>

        {/* Section pour afficher les logos des projets */}
        {employe.projects && employe.projects.length > 0 && (
          <div className="employe-projects">
            <div className="project-logos">
              {employe.projects.map((project) =>
                project.logo ? (
                  <img
                    key={project._id}
                    src={project.logo}
                    alt={`Logo ${project.name}`}
                    className="project-logo"
                    title={project.name}
                  />
                ) : (
                  <img
                    src={defaultProject}
                    alt="Logo par défaut"
                    className="project-logo"
                    title="Logo par défaut"
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <EmployeUpdate
          employe={employe}
          onUpdate={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default EmployeCard;
