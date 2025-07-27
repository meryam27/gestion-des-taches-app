// import React from "react";

// const EmployeUpdate = () => {
//     const [formData, setFormData] = useState({
//       name: "",
//       email: "",
//       password: "",
//       position: "",
//       cin: "",
//       profilePhoto: null,
//       role: "employee", // Default role
//     });
//     const [preview, setPreview] = useState(null);
//     const fileInputRef = useRef(null);

//     const handleChange = (e) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     };

//     const handleFileChange = (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         setFormData((prev) => ({
//           ...prev,
//           profilePhoto: file,
//         }));

//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setPreview(reader.result);
//         };
//         reader.readAsDataURL(file);
//       }
//     };

//     const handleSubmit = (e) => {
//       e.preventDefault();
//       onSubmit(formData);
//     };

//     const triggerFileInput = () => {
//       fileInputRef.current.click();
//     };

//     return (
//       <div className="add-employee-modal-overlay">
//         <div className="add-employee-modal">
//           <div className="modal-header">
//             <h2 style={{ fontSize: "2 rem" }}>Ajouter un nouvel employé</h2>
//             <button className="close-btn" onClick={onClose}>
//               <FiX />
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="add-employee-form">
//             <div className="photo-upload-section">
//               <div
//                 className="photo-preview"
//                 onClick={triggerFileInput}
//                 style={{ backgroundImage: preview ? url(${preview}) : "none" }}
//               >
//                 {!preview && <FiUser className="default-photo-icon" />}
//               </div>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 style={{ display: "none" }}
//               />
//               <button
//                 type="button"
//                 className="upload-btn"
//                 onClick={triggerFileInput}
//                 style={{ fontSize: "1.2rem" }}
//               >
//                 <FiUpload className="upload-icon" />
//                 {preview ? "Changer la photo" : "Ajouter une photo"}
//               </button>
//             </div>

//             <div className="form-group">
//               <FiUser className="input-icon" />
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Nom complet"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 style={{ paddingLeft: "4rem" }}
//               />
//             </div>

//             <div className="form-group">
//               <FiMail className="input-icon" />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <FiKey className="input-icon" />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Mot de passe"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 minLength="6"
//               />
//             </div>
//             <div className="form-group">
//               <select
//                 name="role"
//                 placeholder="admin ou employé"
//                 value={formData.role}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="employee">Employee</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>

//             <div className="form-group">
//               <FiBriefcase className="input-icon" />
//               <input
//                 type="text"
//                 name="position"
//                 placeholder="Poste"
//                 value={formData.position}
//                 onChange={handleChange}
//                 required
//                 style={{ paddingLeft: "4rem" }}
//               />
//             </div>

//             <div className="form-group">
//               <FiCreditCard className="input-icon" />
//               <input
//                 type="text"
//                 name="cin"
//                 placeholder="CIN"
//                 value={formData.cin}
//                 onChange={handleChange}
//                 required
//                 style={{ paddingLeft: "4rem" }}
//               />
//             </div>

//             <div className="form-actions">
//               <button type="button" className="cancel-btn" onClick={onClose}>
//                 Annuler
//               </button>
//               <button type="submit" className="submit-btn">
//                 Ajouter l'employé
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

// };

// export default EmployeUpdate;
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
  console.log("employe", employe);
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

  /*
const handleSubmit = (e) => {
  e.preventDefault();
  
  const formDataToSend = new FormData();

  // 1. Ajouter tous les champs sauf profilePhoto (géré séparément)
  Object.keys(formData).forEach(key => {
    if (key !== 'profilePhoto' && formData[key] !== null) {
      formDataToSend.append(key, formData[key]);
    }
  });

  // 2. Gestion spéciale de la photo
  if (formData.profilePhoto instanceof File) {
    formDataToSend.append('profilePhoto', formData.profilePhoto);
  }

  // 3. Forcer removePhoto selon le state
  formDataToSend.append('removePhoto', removePhoto ? "true" : "false");

  // 4. Envoyer
  onUpdate(employe._id, formDataToSend);
};
*/

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
      removePhoto: "true", // Envoyer "true" comme string pour le backend
    }));
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

            {/* Ajoutez ce bouton conditionnel */}
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
