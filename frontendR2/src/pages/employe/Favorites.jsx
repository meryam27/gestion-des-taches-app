import React, { useEffect, useState } from "react";
import axios from "axios";
import FavoritesComp from "../../components/employe/FavoritesComp";
import { FiSearch } from "react-icons/fi";
const Favorites = () => {
  const [tasksFav, setTasksFav] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Toutes");
  const [projectFilter, setProjectFilter] = useState("Tous");
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [projects, setProjects] = useState([]);
  const fetchFav = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5001/api/employee/tasks/favorites",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTasksFav(res.data);
      setFilteredTasks(res.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFav();
  }, [tasksFav]);

  useEffect(() => {
    const fetchData = async () => {
      const projectsRes = await axios.get(
        "http://localhost:5001/api/employee/projects",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProjects(projectsRes.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = tasksFav;

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

    setFilteredTasks(result);
  }, [searchTerm, statusFilter, projectFilter, tasksFav]);

  const handelDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/employee/tasks/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTasksFav((prev) => prev.filter((task) => task._id != id));
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
    setTasksFav((prevTasks) =>
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
    ...new Set(tasksFav.map((task) => task.project?.name).filter(Boolean)),
  ];

  return (
    <div className="tasks-page-container">
      <main className="tasks-main-content">
        <div className="header-section">
          <h1 className="projet-page-title">Tâches Favorites</h1>
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
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <FavoritesComp
            favoritesTasks={filteredTasks}
            handelDelete={handelDelete}
            onEditTask={handleEditTask}
          />
        )}
      </main>
      {showEditModal && taskToEdit && (
        <TaskEmployeUpdate
          taskToEdit={taskToEdit}
          projects={projects}
          onUpdateTask={handleUpdateTask}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Favorites;
