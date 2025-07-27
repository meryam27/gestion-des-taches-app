import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FormulaireProjetupdate.css";
import EmployeeSelectionModal from "../../pages/admin/EmployeeSelectionModal";

const FormulaireProjetUpdate = ({ project, onClose, onEdit }) => {
  const [updatedProject, setUpdatedProject] = useState(project || {});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [removeLogo, setRemoveLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedEmployes, setSelectedEmployees] = useState([]); // employés présélectionnés
  const [showModalEmploye, setShowModalEmploye] = useState(false);

  // Initialisation du projet et du logo preview
 useEffect(() => {
  if (project) {
    setUpdatedProject({ ...project });

    // 👇 Gérer l'aperçu du logo
    if (project.logo && !(project.logo instanceof File)) {
      setLogoPreview(project.logoUrl);
    }

    // 👇 Assigner les employés au bon moment
    if (Array.isArray(project.assignedEmployees)) {
      const validEmployees = project.assignedEmployees.filter(emp => emp && emp._id);
      const validIds = validEmployees.map(emp => emp._id);

      setSelectedEmployees(validEmployees);
      setUpdatedProject(prev => ({
        ...prev,
        assignedEmployeesIds: validIds,
      }));
    }
  }
}, [project]);


  // Gestion du preview du logo
  useEffect(() => {
    if (updatedProject.logo instanceof File) {
      const url = URL.createObjectURL(updatedProject.logo);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (!updatedProject.logo || removeLogo) {
      setLogoPreview(null);
    }
  }, [updatedProject.logo, removeLogo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUpdatedProject((prev) => ({ ...prev, logo: e.target.files[0] }));
      setRemoveLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Ajout des champs standard
    formData.append("name", updatedProject.name || "");
    formData.append("description", updatedProject.description || "");
    formData.append("company", updatedProject.company || "");
    formData.append("city", updatedProject.city || "");
    formData.append("priority", updatedProject.priority || "medium");
    formData.append("status", updatedProject.status || "inactif");
    if (updatedProject.startDate)
      formData.append("startDate", updatedProject.startDate);
    if (updatedProject.endDate)
      formData.append("endDate", updatedProject.endDate);

    formData.append("removeLogo", removeLogo ? "true" : "false");

    // Filtrer les IDs valides avant envoi
    const validEmployeeIds = (updatedProject.assignedEmployeesIds || []).filter(
      (id) => id !== undefined && id !== null && id !== ""
    );

    validEmployeeIds.forEach((id) => {
      formData.append("assignedEmployeesIds", id);
    });

    // Gestion du logo
    if (updatedProject.logo instanceof File) {
      formData.append("logo", updatedProject.logo);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/admin/projects/update/${project._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Projet mis à jour !");
      setTimeout(() => onClose && onClose(), 1500);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du projet :", err);
      setError(err.response?.data?.message || "Erreur inconnue");
    }
  };

 const handleSelectEmployees = (employees) => {
  setSelectedEmployees(employees);

  const ids = employees
    .map((emp) => emp._id)
    .filter(id => id !== undefined && id !== null && id !== "");

  setUpdatedProject((prev) => {
    const newProject = { ...prev };
    newProject.assignedEmployeesIds = ids;
    return newProject;
  });
};



  return (
    <div className="modal-overlay">
      <div className="project-modal">
        <div className="modal-header">
          <h2 className="new-project">Modifier le projet</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Logo du projet</label>

            <div className="logo-preview-container">
              <div className="logo-circle">
                {logoPreview && !removeLogo ? (
                  <img src={logoPreview} alt="Logo du projet" />
                ) : (
                  <div className="empty-logo-circle"></div>
                )}
                {logoPreview && !removeLogo && (
                  <button
                    type="button"
                    className="remove-logo-btn"
                    onClick={() => setRemoveLogo(true)}
                    title="Supprimer le logo"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="file-input-container">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="logo-upload" className="file-input-label">
                {updatedProject.logo
                  ? "Changer le logo"
                  : "Sélectionner un logo"}
              </label>
            </div>

            {updatedProject.logo && !(updatedProject.logo instanceof File) && (
              <div className="remove-logo-option">
                <input
                  type="checkbox"
                  id="remove-logo"
                  checked={removeLogo}
                  onChange={() => setRemoveLogo((prev) => !prev)}
                />
                <label htmlFor="remove-logo">Supprimer le logo actuel</label>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Nom du projet</label>
            <input
              type="text"
              name="name"
              value={updatedProject.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={updatedProject.description || ""}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Entreprise</label>
              <input
                type="text"
                name="company"
                value={updatedProject.company || ""}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ville</label>
              <input
                type="text"
                name="city"
                value={updatedProject.city || ""}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select
                name="status"
                value={updatedProject.status || "active"}
                onChange={handleInputChange}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="completed">Terminé</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priorité</label>
              <select
                name="priority"
                value={updatedProject.priority || "medium"}
                onChange={handleInputChange}
              >
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date de début</label>
            <input
              type="date"
              name="startDate"
              value={updatedProject.startDate?.slice(0, 10) || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de fin</label>
            <input
              type="date"
              name="endDate"
              value={updatedProject.endDate?.slice(0, 10) || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Employés assignés</label>
            <button
              type="button"
              className="employee-select-btn"
              onClick={() => setShowModalEmploye(true)}
            >
              Sélectionner des employés
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="submit-btn"
              >
              Mettre à jour le projet
            </button>
          </div>
        </form>
      </div>

      {showModalEmploye && (
        <EmployeeSelectionModal
        onClose={() => setShowModalEmploye(false)}
        onSelectEmployees={handleSelectEmployees}
        initialSelection={selectedEmployes}
      />
      )}
    </div>
  );
};

export default FormulaireProjetUpdate;
