import React, { useState, useEffect } from "react";
import axios from "axios";

import { FiX } from "react-icons/fi";
const TaskEmployeUpdate = ({ taskToEdit, projects, onUpdateTask, onClose }) => {
  const [taskData, setTaskData] = useState({
    title: taskToEdit.title,
    description: taskToEdit.description,
    type: taskToEdit.type,
    status: taskToEdit.status,
    deadline: taskToEdit.deadline || "",
    projectId: taskToEdit.project?._id || null,
    assignedToId: taskToEdit.assignedTo?._id || null,
    progress: taskToEdit.progress || 0,
    intervention: taskToEdit.intervention || "on_site",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (taskData.type !== "long") {
      setTaskData((prev) => ({ ...prev, deadline: "" }));
    }
  }, [taskData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: name === "progress" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!taskData.title || !taskData.type) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (taskData.type === "long" && !taskData.deadline) {
      setError("Veuillez spécifier une deadline pour les tâches longues.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/employee/tasks/update/${taskToEdit._id}`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (onUpdateTask) onUpdateTask(response.data.task);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
      console.error(err.response?.data);
    }
  };
  console.log("task to edit  ", taskToEdit);
  console.log("task data", taskData);

  return (
    <div className="modal-overlay">
      <form className="add-task-form" onSubmit={handleSubmit}>
        <h2>Modifier la tâche</h2>
        <span className="close-btn" onClick={onClose}>
          <FiX />
        </span>

        {error && <div className="error-message">{error}</div>}

        <label>Titre *</label>
        <input
          type="text"
          name="title"
          value={taskData.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={taskData.description}
          onChange={handleChange}
        />

        <label>Type *</label>
        <select
          name="type"
          value={taskData.type}
          onChange={handleChange}
          required
        >
          <option value="daily">Journalier</option>
          <option value="long">Long terme</option>
        </select>

        {taskData.type === "long" && (
          <>
            <label>Deadline *</label>
            <input
              type="date"
              name="deadline"
              value={
                taskData.deadline
                  ? new Date(taskData.deadline).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleChange}
              required
            />
          </>
        )}

        <label>Statut</label>
        <select name="status" value={taskData.status} onChange={handleChange}>
          <option value="pending">En attente</option>
          <option value="inProgress">En cours</option>
          <option value="completed">Complétée</option>
          <option value="late">En retard</option>
        </select>

        <label>Projet *</label>
        <select
          name="projectId"
          value={taskData.projectId}
          onChange={handleChange}
        >
          {/* <option value="">--Séléctionner un projet--</option> */}
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>

        <label>Avancement (%)</label>
        <input
          type="number"
          name="progress"
          value={taskData.progress}
          onChange={handleChange}
          min={0}
          max={100}
        />

        <label>Type d'intervention</label>
        <select
          name="intervention"
          value={taskData.intervention}
          onChange={handleChange}
        >
          <option value="on_site">Sur site</option>
          <option value="remote">À distance</option>
        </select>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskEmployeUpdate;
