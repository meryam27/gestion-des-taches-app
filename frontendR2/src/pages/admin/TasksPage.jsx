///////////////////
import React, { useState, useEffect } from "react";
import TaskCard from "../../components/admin/TaskCard.jsx";
import "./TasksPage.css";
import { FiSearch, FiPlus } from "react-icons/fi";
import TaskAddForm from "./TaskAddForm.jsx";
import TaskEditForm from "./TaskEditForm.jsx";
import axios from "axios";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Toutes");
  const [projectFilter, setProjectFilter] = useState("Tous");
  const [employeeFilter, setEmployeeFilter] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/admin/tasks/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des tâches");
      }
      const data = await response.json();
      setTasks(data);
      setFilteredTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const projectsRes = await axios.get(
        "http://localhost:5001/api/admin/projects/cards",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const usersRes = await axios.get(
        "http://localhost:5001/api/admin/employees",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = tasks;

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(lowerSearch) ||
          task.description?.toLowerCase().includes(lowerSearch) ||
          task.project?.name?.toLowerCase().includes(lowerSearch) ||
          task.assignedTo?.name?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== "Toutes") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (projectFilter !== "Tous") {
      result = result.filter((task) => task.project?.name === projectFilter);
    }

    if (employeeFilter !== "Tous") {
      result = result.filter(
        (task) => task.assignedTo?.name === employeeFilter
      );
    }

    setFilteredTasks(result);
  }, [searchTerm, statusFilter, projectFilter, employeeFilter, tasks]);

  const handelTaskAdd = async () => {
    setShowModal(false);
    fetchTasks();
  };

  const handelDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/admin/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTasks((prev) => prev.filter((task) => task._id != id));
      setFilteredTasks((prev) => prev.filter((task) => task._id != id));
    } catch (error) {
      console.log("erreur lors de la suppression des taches ", error);
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    setFilteredTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    setShowEditModal(false);
  };

  // Récupérer les valeurs uniques pour les filtres dynamiques
  const uniqueProjects = [
    ...new Set(tasks.map((task) => task.project?.name).filter(Boolean)),
  ];
  const uniqueEmployees = [
    ...new Set(tasks.map((task) => task.assignedTo?.name).filter(Boolean)),
  ];

  return (
    <div className="tasks-page-container">
      <main className="tasks-main-content">
        <div className="header-section">
          <h1 className="projet-page-title">Tâches</h1>

          <button
            className="add-employee-btn"
            onClick={() => setShowModal(true)}
            style={{ fontSize: "1.4rem" }}
          >
            <FiPlus className="add-icon" style={{ fontSize: "1.8rem" }} />
            Ajouter une tâche
          </button>
        </div>
        <div className="search-filter-container">
          <div className="search-wrapper">
            <FiSearch
              className="search-icon"
              style={{ position: "absolute", top: "2rem" }}
            />
            <input
              type="text"
              placeholder="Rechercher tâches par titre, description, projet ou employé"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ fontSize: "1.25rem" }}
            />
          </div>
          <div className="filter-container">
            <div className="filter-wrapper">
              <label>Status : </label>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: "1.2rem" }}
              >
                <option>Toutes</option>
                <option value="inProgress">en cours</option>
                <option value="completed">terminé</option>
                <option value="late">en retard</option>
              </select>
            </div>

            <div className="filter-wrapper">
              <label>Projet : </label>
              <select
                className="filter-select"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                style={{ fontSize: "1.2rem" }}
              >
                <option>Tous</option>
                {uniqueProjects.map((proj, i) => (
                  <option key={i}>{proj}</option>
                ))}
              </select>
            </div>

            <div className="filter-wrapper">
              <label>Employé : </label>
              <select
                className="filter-select"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                style={{ fontSize: "1.2rem" }}
              >
                <option>Tous</option>
                {uniqueEmployees.map((emp, i) => (
                  <option key={i}>{emp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <TaskCard
            tasks={filteredTasks}
            handelDelete={handelDelete}
            onEditTask={handleEditTask}
          />
        )}
      </main>

      {showModal && (
        <TaskAddForm
          projects={projects}
          employees={users}
          onAddTask={handelTaskAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {showEditModal && taskToEdit && (
        <TaskEditForm
          taskToEdit={taskToEdit}
          projects={projects}
          users={users}
          onUpdateTask={handleUpdateTask}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default TasksPage;
