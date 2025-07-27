import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./TaskAddForm.module.css";
const initialState = {
  title: "",
  description: "",
  type: "daily",
  status: "pending",
  deadline: undefined,
  projectId: null,
  assignedToId: null,
  progress: 0,
  intervention: "on_site",
};

const TaskAddForm = ({ onTaskAdded, onClose }) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    type: "daily",
    status: "pending",
    deadline: undefined,
    projectId: null,
    assignedToId: null,
    progress: 0,
    intervention: "on_site",
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskData.type !== "long") {
      setTaskData((prev) => ({ ...prev, deadline: "" }));
    }
  }, [taskData.type]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/admin/projects/cards`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`http://localhost:5001/api/admin/employees/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setProjects(projectsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError("Erreur de chargement des données.");
        console.error(err);
      }
    };
    fetchData();
  }, []);

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

    if (!taskData.title || !taskData.type || !taskData.projectId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (taskData.type === "long" && !taskData.deadline) {
      setError("Veuillez spécifier une deadline pour les tâches longues.");
      return;
    }
    console.log("Task data envoyée :", taskData);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/admin/tasks/create`,
        taskData, // envoie l'objet JSON
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json", // très important
          },
        }
      );

      if (onTaskAdded) onTaskAdded(response.data.task);

      // Réinitialisation
      setTaskData({
        title: "",
        description: "",
        type: "daily",
        status: "pending",
        deadline: undefined,
        projectId: null,
        assignedToId: null,
        progress: 0,
        intervention: "on_site",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
      console.error(err.response?.data);
    }
  };

  return (
    <form className={styles.addTaskForm} onSubmit={handleSubmit}>
      <h2>Ajouter une tâche</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}

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
            value={taskData.deadline}
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
        required
      >
        <option value="">-- Sélectionner un projet --</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>

      <label>Employé assigné</label>
      <select
        name="assignedToId"
        value={taskData.assignedToId}
        onChange={handleChange}
      >
        <option value="">-- Aucun --</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name}
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
      <div style={{ display: "flex", gap: "2rem" }}>
        <button type="submit">Créer la tâche</button>
        <button type="button" onClick={onClose}>
          Annuler
        </button>
      </div>
    </form>
  );
};

export default TaskAddForm;
