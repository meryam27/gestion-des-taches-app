import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FormulaireProjet.css";
import EmployeeSelectionModal from "../../pages/admin/EmployeeSelectionModal";
import { FiUpload, FiFolder, FiX } from "react-icons/fi";
const initialState = {
  name: "",
  description: "",
  company: "",
  city: "",
  status: "active",
  priority: "medium",
  startDate: "",
  endDate: "",
  assignedEmployeesCINs: [],
  assignedEmployeesPreview: [],
  logo: null,
};

const FormulaireProjet = ({
  setShowModal,
  newProject,
  setNewProject,
  setSuccess,
  setError,
  error,
  success,
}) => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = React.useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) =>
    setNewProject((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProject((prev) => ({
        ...prev,
        logo: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEmployees = (selectedEmployees) => {
    const CINs = selectedEmployees.map((e) => e.cin);
    setNewProject((prev) => ({
      ...prev,
      assignedEmployeesCINs: CINs,
      assignedEmployeesPreview: selectedEmployees,
    }));
    setShowEmployeeModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!newProject.name || !newProject.company || !newProject.city) {
      setError("Nom, Entreprise, Ville requis");
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    [
      "name",
      "description",
      "company",
      "city",
      "status",
      "priority",
      "startDate",
      "endDate",
    ].forEach((f) => form.append(f, newProject[f] || ""));
    (newProject.assignedEmployeesCINs || []).forEach((cin) =>
      form.append("assignedEmployeesCINs[]", cin)
    );
    if (newProject.logo) form.append("logo", newProject.logo);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5001/api/admin/projects/ajout", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Projet créé !");
      setNewProject(initialState);
      setTimeout(() => setShowModal(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur création projet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="project-modal">
        <div className="modal-header">
          <h2 style={{ fontSize: "2rem" }}>Nouveau Projet</h2>
          <button
            className="close-btn"
            onClick={() => {
              setShowModal(false);
              setNewProject(initialState);
            }}
          >
            <FiX style={{ fontSize: "2rem" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Les autres champs du formulaire restent inchangés */}
          <div className="form-group">
            <div className="photo-upload-section">
              <div
                className="photo-preview"
                onClick={triggerFileInput}
                style={{
                  backgroundImage: preview ? `url(${preview})` : "none",
                }}
              >
                {!preview && <FiFolder className="default-photo-icon" />}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="upload-btn"
                onClick={triggerFileInput}
                style={{ fontSize: "1.2rem" }}
              >
                <FiUpload className="upload-icon" />
                {preview ? "Changer le logo" : "Ajouter un logo"}
              </button>
            </div>
            {/* ************************************************ */}
            <label>Nom du projet *</label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              required
              placeholder="Nom du projet"
              style={{ fontSize: "1.2rem" }}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              placeholder="Description du projet..."
              rows="3"
              style={{ fontSize: "1.2rem" }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Entreprise *</label>
              <input
                type="text"
                name="company"
                value={newProject.company}
                onChange={handleInputChange}
                required
                placeholder="Nom de l'entreprise"
                style={{ fontSize: "1.2rem" }}
              />
            </div>

            <div className="form-group">
              <label>Ville *</label>
              <input
                type="text"
                name="city"
                value={newProject.city}
                onChange={handleInputChange}
                required
                placeholder="Ville du projet"
                style={{ fontSize: "1.2rem" }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select
                name="status"
                value={newProject.status}
                onChange={handleInputChange}
                style={{ fontSize: "1.2rem" }}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="completed">Terminé</option>
                <option value="pending">En attente</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priorité</label>
              <select
                name="priority"
                value={newProject.priority}
                onChange={handleInputChange}
                style={{ fontSize: "1.2rem" }}
              >
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de début</label>
              <input
                type="date"
                name="startDate"
                value={newProject.startDate}
                onChange={handleInputChange}
                style={{ fontSize: "1.2rem" }}
              />
            </div>

            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={newProject.endDate || ""}
                onChange={handleInputChange}
                min={newProject.startDate}
                style={{ fontSize: "1.2rem" }}
              />
            </div>
          </div>

          {/* ******************************* */}

          <div className="form-group">
            <label>Employés assignés</label>
            <div className="employee-selection">
              <button
                type="button"
                className="employee-select-btn"
                onClick={() => setShowEmployeeModal(true)}
                style={{ fontSize: "1.2rem" }}
              >
                {newProject.assignedEmployeesPreview?.length > 0
                  ? `${newProject.assignedEmployeesPreview.length} employé(s) sélectionné(s)`
                  : "Sélectionner des employés"}
              </button>

              {newProject.assignedEmployeesPreview?.length > 0 && (
                <div className="selected-employees-preview">
                  {newProject.assignedEmployeesPreview
                    .slice(0, 3)
                    .map((emp, index) => (
                      <div key={index} className="employee-preview">
                        <img
                          src={emp.profilePhoto || "/default-avatar.png"}
                          alt={emp.name}
                        />
                        <span>{emp.name}</span>
                      </div>
                    ))}
                  {newProject.assignedEmployeesPreview?.length > 3 && (
                    <div className="more-employees">
                      +{newProject.assignedEmployeesPreview.length - 3} autres
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setShowModal(false);
                setNewProject(initialState);
              }}
              disabled={isLoading}
              style={{ fontSize: "1.2rem" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
              style={{ fontSize: "1.2rem" }}
            >
              {isLoading ? "Création en cours..." : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>

      {showEmployeeModal && (
        <EmployeeSelectionModal
          onClose={() => setShowEmployeeModal(false)}
          onSelectEmployees={handleAddEmployees}
          initialSelection={newProject.assignedEmployeesPreview}
        />
      )}
    </div>
  );
};

export default FormulaireProjet;
