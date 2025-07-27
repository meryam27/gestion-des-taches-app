import React, { use } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
const EmployDetail = () => {
  const [employe, setEmploye] = useState({});
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/admin/employees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setEmploye(res.data);
      })
      .catch((err) => {
        console.log("Error fetching employee data:", err);
      });
  }, []);
  return <div></div>;
};

export default EmployDetail;
