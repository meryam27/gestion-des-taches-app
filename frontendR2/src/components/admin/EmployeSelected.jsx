import React from "react";
import { FiCheck } from "react-icons/fi";
import "./EmployeSelected.css";
import defaultProfil from "../../assets/images/profil-default.jpeg";

const EmployeSelected = ({ employee, isSelected, onClick }) => {
  return (
    <div
      className={`employee-card ${isSelected ? "selected" : ""}`}
      onClick={() => onClick(employee)}
    >
      <div className="employee-checkbox">
        {isSelected && <FiCheck className="check-icon" />}
      </div>
      <div className="employee-avatar">
        <img src={employee.profilePhoto || defaultProfil} alt={employee.name} />
      </div>
      <div className="employee-info">
        <h3 className="employee-name">{employee.name}</h3>
        <p className="employee-position">{employee.position}</p>
      </div>
    </div>
  );
};

export default EmployeSelected;
