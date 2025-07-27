// components/admin/FormulaireEmploye.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const FormulaireEmploye = ({ employe, onClose, refresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    profilePhoto: "",
  });

  useEffect(() => {
    if (employe) {
      setFormData({
        name: employe.name || "",
        position: employe.position || "",
        email: employe.email || "",
        profilePhoto: employe.profilePhoto || "",
      });
    }
  }, [employe]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (employe) {
      await axios.put(
        `http://localhost:5000/api/employes/${employe._id}`,
        formData
      );
    } else {
      await axios.post("http://localhost:5000/api/employes", formData);
    }
    refresh();
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded w-[400px]">
        <h2 className="text-lg font-bold mb-4">
          {employe ? "Modifier Employé" : "Ajouter Employé"}
        </h2>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nom"
          className="border p-2 w-full mb-2"
        />
        <input
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="Poste"
          className="border p-2 w-full mb-2"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full mb-2"
        />
        <input
          name="profilePhoto"
          value={formData.profilePhoto}
          onChange={handleChange}
          placeholder="Lien Photo"
          className="border p-2 w-full mb-2"
        />
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border rounded"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            {employe ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormulaireEmploye;
