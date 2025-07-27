import React, { useEffect, useState } from "react";
import EmployeCard from "../../components/admin/EmployeCard.jsx";
import EmployeeModal from "../../components/admin/EmployeModal";
import EmployeeUpdateForm from "../../components/admin/EmployeUpdate";
import AddEmployeModal from "../../components/admin/AddEmployeModal";
import "../../components/admin/EmployeCard.css";
import axios from "axios";
import { FiSearch, FiPlus } from "react-icons/fi";

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [employeeToUpdate, setEmployeeToUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/admin/employees",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEmployes(response.data);
      setFilteredEmployes(response.data);
    } catch (err) {
      console.error("Error fetching employes:", err);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:5001/api/admin/employees/detailse/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching employee details:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const results = employes.filter(
      (employe) =>
        (employe.name &&
          employe.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employe.prenom &&
          employe.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employe.position &&
          employe.position.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployes(results);
  }, [searchTerm, employes]);

  const handleCardClick = async (employe) => {
    try {
      setSelectedEmployee(employe);
      const details = await fetchEmployeeDetails(employe._id);
      setEmployeeDetails(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to load employee details:", error);
    }
  };

  const handleAddEmployee = async (newEmployee) => {
    try {
      const formData = new FormData();
      Object.keys(newEmployee).forEach((key) => {
        if (key !== "profilePhoto") {
          formData.append(key, newEmployee[key]);
        }
      });

      if (newEmployee.profilePhoto) {
        formData.append("profilePhoto", newEmployee.profilePhoto);
      }

      const response = await axios.post(
        "http://localhost:5001/api/admin/employees/ajout",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setEmployes([...employes, response.data.employee]);
      setFilteredEmployes([...filteredEmployes, response.data.employee]);
      setIsAddModalOpen(false);
      console.log("new", newEmployee);
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const handleUpdateEmployee = async (id, updatedData) => {
    try {
      const formData = new FormData();
      Object.keys(updatedData).forEach((key) => {
        if (key !== "profilePhoto" && updatedData[key] !== null) {
          formData.append(key, updatedData[key]);
        }
      });

      if (updatedData.profilePhoto instanceof File) {
        formData.append("profilePhoto", updatedData.profilePhoto);
      }
      // Ajout de l'ID dans FormData si nécessaire par le backend
      formData.append("id", id);

      const response = await axios.post(
        `http://localhost:5001/api/admin/employees/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Mise à jour réussie :", updatedData);
      // Mise à jour de l'état local
      setEmployes(
        employes.map((emp) => (emp._id === id ? response.data.employee : emp))
      );
      setFilteredEmployes(
        filteredEmployes.map((emp) =>
          emp._id === id ? response.data.employee : emp
        )
      );

      setIsUpdateModalOpen(false);
      return response.data;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const handelDetlete = async (employeId) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cet employé ?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:5001/api/admin/employees/${employeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEmployes((prev) => prev.filter((p) => p._id !== employeId));
        setFilteredEmployes((prev) => prev.filter((p) => p._id !== employeId));
      } catch (error) {
        console.log("erreur de suppression", error);
        alert("Échec de la suppression");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmployeeDetails(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setEmployeeToUpdate(null);
  };

  return (
    <div className="employes-page">
      <div className="employes-header">
        <h1 className="employe-page-title">Employés</h1>
        <button
          className="add-employee-btn"
          onClick={() => setIsAddModalOpen(true)}
          style={{ fontSize: "1.4rem" }}
        >
          <FiPlus className="add-icon" style={{ fontSize: "1.8rem" }} />
          Ajouter un employé
        </button>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ fontSize: "1.2rem" }}
          />
        </div>
      </div>

      <div className="employe-list">
        {filteredEmployes.length > 0 ? (
          filteredEmployes.map((employe) => (
            <EmployeCard
              key={employe._id}
              employe={employe}
              onClick={() => handleCardClick(employe)}
              onDelete={() => handelDetlete(employe._id)}
              onUpdate={handleUpdateEmployee}
            />
          ))
        ) : (
          <div className="no-results">
            <p>Aucun employé trouvé</p>
          </div>
        )}
      </div>

      {isModalOpen && employeeDetails && (
        <EmployeeModal employeeData={employeeDetails} onClose={closeModal} />
      )}

      {isAddModalOpen && (
        <AddEmployeModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddEmployee}
        />
      )}

      {isUpdateModalOpen && employeeToUpdate && (
        <EmployeeUpdateForm
          employe={employeeToUpdate}
          onClose={closeUpdateModal}
          onUpdate={handleUpdateEmployee}
        />
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Employes;
