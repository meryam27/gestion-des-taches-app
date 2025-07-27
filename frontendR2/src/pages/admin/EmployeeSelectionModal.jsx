import React, { useState, useEffect } from "react";
import axios from "axios";
import EmployeSelected from "../../components/admin/EmployeSelected";
import { FiSearch, FiX, FiCheck } from "react-icons/fi";
import "./EmployeeSelectionModal.css";

const EmployeeSelectionModal = ({
  onClose,
  onSelectEmployees,
  initialSelection = [],
}) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Chargement initial des employés
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5001/api/admin/employees/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmployees(response.data);
      setFilteredEmployees(response.data);

      // Appliquer la sélection initiale après chargement
    const initialSelected = response.data.filter((emp) =>
  initialSelection.some((sel) => sel._id?.toString() === emp._id?.toString())
);

      setSelectedEmployees(initialSelected);
    } catch (err) {
      console.error("Erreur lors du chargement des employés :", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage selon la recherche
  useEffect(() => {
    const results = employees.filter(
      (employee) =>
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  // Sélection/désélection d'un employé
  const toggleEmployeeSelection = (employee) => {
    setSelectedEmployees((prev) => {
      const isSelected = prev.some((emp) => emp._id === employee._id);
      if (isSelected) {
        return prev.filter((emp) => emp._id !== employee._id);
      } else {
        return [...prev, employee];
      }
    });
  };

  const handleSubmit = () => {
    onSelectEmployees(selectedEmployees); // 👈 envoie la sélection au parent
    onClose();
  };

  return (
    <div className="employee-selection-modal-overlay">
      <div className="employee-selection-modal">
        <div className="modal-header">
          <h2>Sélectionner des employés</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
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
            />
          </div>
        </div>

        <div className="selection-info">
          <span className="selected-count">
            {selectedEmployees.length} employé(s) sélectionné(s)
          </span>
        </div>

        <div className="employees-list">
          {isLoading ? (
            <div className="loading">Chargement...</div>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <EmployeSelected
                key={employee._id}
                employee={employee}
                isSelected={selectedEmployees.some(
                  (emp) => emp._id === employee._id
                )}
                onClick={() => toggleEmployeeSelection(employee)}
              />
            ))
          ) : (
            <div className="no-results">Aucun employé trouvé</div>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button className="confirm-btn" onClick={handleSubmit}>
            <FiCheck /> Confirmer ({selectedEmployees.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionModal;
