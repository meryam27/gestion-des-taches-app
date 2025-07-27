// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Profil.css";
// import defaultPhoto from "../../assets/images/profil-default.jpeg";
// import axios from "axios";

// const Profil = () => {
//   const [profil, setProfil] = useState(null); // null = pas encore chargé
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     axios
//       .get("http://localhost:5001/api/profile", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => {
//         setProfil(res.data.data);
//         setIsLoading(false);
//       })
//       .catch((err) => {
//         console.log("erreur ", err);
//         navigate("/login");
//       });
//   }, [navigate]);

//   if (isLoading || !profil) {
//     return <div className="loading">Chargement...</div>; // simple affichage
//   }

//   return (
//     <div className="profil-container">
//       <div className="background"></div>

//       <div className="profil-card" style={{ zIndex: "1" }}>
//         <div className="profil-top">
//           <img className="profil-photo" src={defaultPhoto} alt="Profil" />
//           <h1 className="profil-name">{profil.name}</h1>
//           <p className="profil-position">{profil.position}</p>
//         </div>

//         <div className="profil-details">
//           <p>
//             <strong>Nom :</strong> {profil.name}
//           </p>
//           <p>
//             <strong>Rôle :</strong> {profil.role}
//           </p>
//           <p>
//             <strong>Position :</strong> {profil.position}
//           </p>
//           <p>
//             <strong>Email :</strong> {profil.email}
//           </p>
//           <p>
//             <strong>CIN :</strong> {profil.cin}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profil;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profil.css";
import defaultPhoto from "../../assets/images/profil-default.jpeg";
import axios from "axios";

const Profil = () => {
  const [profil, setProfil] = useState(null); // null = pas encore chargé
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5001/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfil(res.data.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("erreur ", err);
        navigate("/login");
      });
  }, [navigate]);

  if (isLoading || !profil) {
    return <div className="loading">Chargement...</div>; // simple affichage
  }

  return (
    <div className="profil-container">
      <div className="background"></div>

      <div className="profil-card" style={{ zIndex: "1" }}>
        <div className="profil-top">
          <img
            className="profil-photo"
            src={profil.profilePhoto ? profil.profilePhoto : defaultPhoto}
            alt="Profil"
          />
          <h1 className="profil-name">{profil.name}</h1>
          <p className="profil-position">{profil.position}</p>
        </div>

        <div className="profil-details">
          <p>
            <strong>Nom :</strong> {profil.name}
          </p>
          <p>
            <strong>Rôle :</strong> {profil.role}
          </p>
          <p>
            <strong>Position :</strong> {profil.position}
          </p>
          <p>
            <strong>Email :</strong> {profil.email}
          </p>
          <p>
            <strong>CIN :</strong> {profil.cin}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profil;
