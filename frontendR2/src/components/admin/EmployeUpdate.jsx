import React, { useState, useRef, useEffect } from "react";
import {
  FiX,
  FiUpload,
  FiUser,
  FiMail,
  FiKey,
  FiBriefcase,
  FiCreditCard,
} from "react-icons/fi";
import axios from "axios";
import "./EmployeUpdate.css";

const EmployeUpdate = ({ employe, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    cin: "",
    profilePhoto: null,
    role: "employee",
    removePhoto: "false",
  });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (employe) {
      setFormData({
        name: employe.name || "",
        email: employe.email || "",
        position: employe.position || "",
        cin: employe.cin || "",
        role: employe.role || "employee",
        profilePhoto: employe.profilePhoto || null,
        profilePhotoPath: employe.profilePhoto || "",
        removePhoto: "false",
      });
      if (employe.profilePhoto) {
        setPreview(employe.profilePhoto);
      }
    }
  }, [employe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      removePhoto: removePhoto ? "true" : "false",
    };
    onUpdate(employe._id, dataToSend);
    console.log("Form data submitted:", dataToSend);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    setRemovePhoto(true);
    setFormData((prev) => ({
      ...prev,
      profilePhoto: null,
      removePhoto: "true",
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5001/api/admin/employees/resetPassword/${employe._id}`,
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResetPasswordMessage("Mot de passe réinitialisé avec succès");
      setResetPasswordError("");
      setNewPassword("");
      setTimeout(() => {
        setShowResetPassword(false);
        setResetPasswordMessage("");
      }, 2000);
    } catch (error) {
      setResetPasswordError(
        error.response?.data?.message || "Erreur lors de la réinitialisation"
      );
      setResetPasswordMessage("");
    }
  };

  if (!employe) return null;

  return (
    <div className="update-employee-modal-overlay">
      <div className="update-employee-modal">
        <div className="modal-header">
          <h2 style={{ fontSize: "2rem" }}>Modifier l'employé</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="update-employee-form">
          <div className="photo-upload-section">
            <div
              className="photo-preview"
              onClick={triggerFileInput}
              style={{ backgroundImage: preview ? ` url(${preview})` : "none" }}
            >
              {!preview && <FiUser className="default-photo-icon" />}
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
              {preview ? "Changer la photo" : "Ajouter une photo"}
            </button>

            {preview && (
              <button
                type="button"
                className="remove-photo-btn"
                onClick={handleRemovePhoto}
              >
                Supprimer la photo
              </button>
            )}
          </div>

          <div className="form-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Nom complet"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ paddingLeft: "4rem" }}
            />
          </div>

          <div className="form-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <FiBriefcase className="input-icon" />
            <input
              type="text"
              name="position"
              placeholder="Poste"
              value={formData.position}
              onChange={handleChange}
              required
              style={{ paddingLeft: "4rem" }}
            />
          </div>

          <div className="form-group">
            <FiCreditCard className="input-icon" />
            <input
              type="text"
              name="cin"
              placeholder="CIN"
              value={formData.cin}
              onChange={handleChange}
              required
              style={{ paddingLeft: "4rem" }}
            />
          </div>

          <div className="reset-password-section">
            <button
              type="button"
              className="reset-password-btn"
              onClick={() => setShowResetPassword(!showResetPassword)}
            >
              <FiKey className="reset-icon" />
              {showResetPassword ? "Masquer" : "Réinitialiser le mot de passe"}
            </button>

            {showResetPassword && (
              <div className="reset-password-form">
                <div className="form-group">
                  <FiKey className="input-icon" />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="submit-reset-btn"
                  onClick={handleResetPassword}
                >
                  Confirmer la réinitialisation
                </button>
                {resetPasswordMessage && (
                  <p className="reset-success">{resetPasswordMessage}</p>
                )}
                {resetPasswordError && (
                  <p className="reset-error">{resetPasswordError}</p>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeUpdate;
