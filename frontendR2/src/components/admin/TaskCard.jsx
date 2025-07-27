// import React from "react";
// import { FaTag, FaBatteryThreeQuarters, FaMapMarkerAlt } from "react-icons/fa";
// import { FiEdit, FiTrash2 } from "react-icons/fi";
// import "./TaskCard.css";
// import defaultProjectLogo from "../../assets/images/project-default.jpg";
// import defaultProfil from "../../assets/images/profil-default.jpeg";
// import { MdAccessTime } from "react-icons/md";
// import axios from "axios";
// const TaskCard = ({ tasks, handelDelete }) => {
//   const formatDate = (dateString) => {
//     const options = { day: "numeric", month: "short", year: "numeric" };
//     return new Date(dateString).toLocaleDateString("fr-FR", options);
//   };

//   const getInterventionIcon = (type) => {
//     switch (type) {
//       case "on_site":
//         return (
//           <>
//             <FaMapMarkerAlt
//               className="intervention-icon"
//               title="Sur site"
//               size={16}
//               style={{ marginRight: "0.4rem" }}
//             />
//             <span
//               className="intervention-on-site"
//               title="Sur site"
//               style={{ marginRight: "1rem", fontSize: "1.2rem" }}
//             >
//               sur site
//             </span>
//           </>
//         );
//       case "remote":
//         return (
//           <>
//             <span
//               className="intervention-remote"
//               title="À distance"
//               style={{ marginRight: "0.4rem", fontSize: "1.2rem" }}
//             >
//               🏠
//             </span>
//             <span
//               className="intervention-remote"
//               title="à distance"
//               style={{
//                 marginRight: "1rem",
//                 fontSize: "1.2rem",
//                 fontWeight: "600",
//               }}
//             >
//               à distance
//             </span>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   const handelDeleteClick = async (id) => {
//     if (window.confirm("Voulez vous vraiment supprimer la tache ?")) {
//       handelDelete(id);
//     }
//     return;
//   };
//   return (
//     <div className="task-cards-container">
//       {tasks.map((task) => (
//         <div
//           key={task._id}
//           className={`task-card ${task.status?.status} priority-${task.project?.priority}`}
//         >
//           <div className="task-card-header">
//             <div className="project-info">
//               {task.project.logo ? (
//                 <img
//                   src={task.project.logo}
//                   alt="logo"
//                   className="project-logo"
//                 />
//               ) : (
//                 <img
//                   src={defaultProjectLogo}
//                   alt="logo"
//                   className="project-logo"
//                 />
//               )}
//               <div>
//                 <h3 className="project-name">{task.project?.name}</h3>
//                 <span className="company-name">{task.project?.company}</span>
//               </div>
//             </div>

//             <div className="task-header-right">
//               <div className={`task-priority ${task.project?.priority}`}>
//                 {task.project?.priority?.toUpperCase()}
//               </div>
//               {getInterventionIcon(task.intervention)}
//             </div>
//           </div>

//           <div className="task-card-body">
//             <div className="task-title-wrapper">
//               <h4 className="task-title">{task.title}</h4>
//               <div className="tasks-actions">
//                 <FiEdit
//                   className="edit-icon-task"
//                   title="Modifier"
//                   style={{ zIndex: 1000 }}
//                 />
//                 <FiTrash2
//                   className="delete-icon-task"
//                   title="Supprimer"
//                   onClick={() => handelDeleteClick(task._id)}
//                   style={{ zIndex: 1000 }}
//                 />
//               </div>
//             </div>
//             <p className="task-description">{task.description}</p>

//             <div className="task-meta">
//               <div className="meta-item">
//                 <span className="meta-icon" style={{ fontSize: "0.9rem" }}>
//                   Crée à :
//                 </span>
//                 <span>{formatDate(task.createdAt)}</span>
//               </div>
//               <div className="meta-item">
//                 <span className="meta-icon" style={{ fontSize: "0.9rem" }}>
//                   Mis à jour le :
//                 </span>
//                 <span>{formatDate(task.updatedAt)}</span>
//               </div>
//               <div className="meta-item">
//                 <FaTag className="meta-icon" />
//                 <span>{task.type}</span>
//               </div>
//               <div className="meta-item">
//                 <FaBatteryThreeQuarters className="meta-icon" />
//                 <span>{task.project?.progression}%</span>
//               </div>
//               {task.type === "long" && (
//                 <div className="meta-item">
//                   <MdAccessTime
//                     className="meta-icon"
//                     style={{ marginRight: "0.2rem" }}
//                   />
//                   <span>DeadLine : </span>

//                   <span>{formatDate(task.deadline)}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="task-card-footer">
//             {task.assignedTo && (
//               <div className="assigned-user">
//                 {task.assignedTo.profilePhoto ? (
//                   <img
//                     src={task.assignedTo.profilePhoto}
//                     alt={task.assignedTo.name}
//                     className="user-avatar"
//                   />
//                 ) : (
//                   <img
//                     src={defaultProfil}
//                     alt={task.assignedTo.name}
//                     className="user-avatar"
//                   />
//                 )}
//                 <div>
//                   <span className="user-name">{task.assignedTo.name}</span>
//                   <span className="user-position">
//                     {task.assignedTo.position}
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div className={`task-status ${task.status}`}>
//               {task.status?.toUpperCase()}
//             </div>
//           </div>

//           <div
//             className="task-progress-bar"
//             style={{ width: `${task.progress || 0}%` }}
//           ></div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TaskCard;
import React from "react";
import { FaTag, FaBatteryThreeQuarters, FaMapMarkerAlt } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./TaskCard.css";
import defaultProjectLogo from "../../assets/images/project-default.jpg";
import defaultProfil from "../../assets/images/profil-default.jpeg";
import { MdAccessTime } from "react-icons/md";
import axios from "axios";

const TaskCard = ({ tasks, handelDelete, onEditTask }) => {
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getInterventionIcon = (type) => {
    switch (type) {
      case "on_site":
        return (
          <>
            <FaMapMarkerAlt
              className="intervention-icon"
              title="Sur site"
              size={16}
              style={{ marginRight: "0.4rem" }}
            />
            <span
              className="intervention-on-site"
              title="Sur site"
              style={{ marginRight: "1rem", fontSize: "1.2rem" }}
            >
              sur site
            </span>
          </>
        );
      case "remote":
        return (
          <>
            <span
              className="intervention-remote"
              title="À distance"
              style={{ marginRight: "0.4rem", fontSize: "1.2rem" }}
            >
              🏠
            </span>
            <span
              className="intervention-remote"
              title="à distance"
              style={{
                marginRight: "1rem",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              à distance
            </span>
          </>
        );
      default:
        return null;
    }
  };

  const handelDeleteClick = async (id) => {
    if (window.confirm("Voulez vous vraiment supprimer la tache ?")) {
      handelDelete(id);
    }
    return;
  };
  console.log("task", tasks);
  return (
    <div className="task-cards-container">
      {tasks.map((task) => (
        <div
          key={task._id}
          className={`task-card ${task.status?.status} priority-${task.project?.priority}`}
        >
          <div className="task-card-header">
            <div className="project-info">
              {task.project.logo ? (
                <img
                  src={task.project.logo}
                  alt="logo"
                  className="project-logo"
                />
              ) : (
                <img
                  src={defaultProjectLogo}
                  alt="logo"
                  className="project-logo"
                />
              )}
              <div>
                <h3 className="project-name">{task.project?.name}</h3>
                <span className="company-name">{task.project?.company}</span>
              </div>
            </div>

            <div className="task-header-right">
              <div className={`task-priority ${task.project?.priority}`}>
                {task.project?.priority?.toUpperCase()}
              </div>
              {getInterventionIcon(task.intervention)}
            </div>
          </div>

          <div className="task-card-body">
            <div className="task-title-wrapper">
              <h4 className="task-title">{task.title}</h4>
              <div className="tasks-actions">
                <FiEdit
                  className="edit-icon-task"
                  title="Modifier"
                  onClick={() => onEditTask(task)}
                  style={{ zIndex: 1000 }}
                />
                <FiTrash2
                  className="delete-icon-task"
                  title="Supprimer"
                  onClick={() => handelDeleteClick(task._id)}
                  style={{ zIndex: 1000 }}
                />
              </div>
            </div>
            <p className="task-description">{task.description}</p>

            <div className="task-meta">
              <div className="meta-item">
                <span className="meta-icon" style={{ fontSize: "0.9rem" }}>
                  Crée à :
                </span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon" style={{ fontSize: "0.9rem" }}>
                  Mis à jour le :
                </span>
                <span>{formatDate(task.updatedAt)}</span>
              </div>
              <div className="meta-item">
                <FaTag className="meta-icon" />
                <span>{task.type}</span>
              </div>
              <div className="meta-item">
                <FaBatteryThreeQuarters className="meta-icon" />
                <span>{task.progress}%</span>
              </div>
              {task.type === "long" && (
                <div className="meta-item">
                  <MdAccessTime
                    className="meta-icon"
                    style={{ marginRight: "0.2rem" }}
                  />
                  <span>DeadLine : </span>
                  <span>{formatDate(task.deadline)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="task-card-footer">
            {task.assignedTo && (
              <div className="assigned-user">
                {task.assignedTo.profilePhoto ? (
                  <img
                    src={task.assignedTo.profilePhoto}
                    alt={task.assignedTo.name}
                    className="user-avatar"
                  />
                ) : (
                  <img
                    src={defaultProfil}
                    alt={task.assignedTo.name}
                    className="user-avatar"
                  />
                )}
                <div>
                  <span className="user-name">{task.assignedTo.name}</span>
                  <span className="user-position">
                    {task.assignedTo.position}
                  </span>
                </div>
              </div>
            )}

            <div className={`task-status ${task.status}`}>
              {task.status?.toUpperCase()}
            </div>
          </div>

          <div
            className="task-progress-bar"
            style={{ width: `${task.project?.progression || 0}%` }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default TaskCard;
