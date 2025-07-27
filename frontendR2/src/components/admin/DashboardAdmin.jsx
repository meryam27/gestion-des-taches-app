import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import axios from "axios";
import "./DashboardAdmin.css";

// Couleurs vives et modernes
const COLORS = ["#FF6384", "#36A2EB", "#4BC0C0", "#FFCE56"];
const COLORS2 = ["#da9bf5ff", "#53d087ff", "#fa8a7dff"];

const DashboardAdminComp = () => {
  const [stats, setStats] = useState(null);
  const [profil, setProfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [statsRes, profilRes] = await Promise.all([
          axios.get("http://localhost:5001/api/admin/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5001/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(statsRes.data);
        localStorage.setItem("dashboardStats", JSON.stringify(statsRes.data));

        setProfil(profilRes.data.data);
        localStorage.setItem("profilData", JSON.stringify(profilRes.data.data));
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !stats || !profil) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const longTasksStats = stats.tasks.stats.find((s) => s.type === "long") || {};
  const dailyTasksStats = stats.tasks.dailyProgression || [];
  const pieDataDaily = [
    { name: "À faire", value: longTasksStats.pending || 0 },
    { name: "En cours", value: longTasksStats.inProgress || 0 },
    { name: "Terminée", value: longTasksStats.completed || 0 },
    { name: "En retard", value: longTasksStats.late || 0 },
  ];
  console.log("long Tasks Stats:", longTasksStats);
  const projectData = stats.projects;
  const pieProject = [
    { name: "Actif", value: projectData.active || 0 },
    { name: "Completé", value: projectData.completed || 0 },
    { name: "Inactif", value: projectData.inactive || 0 },
  ];
  console.log("test , ", stats.activities.critical);
  return (
    <div className="dashboard-admin-container">
      <div className="header">
        <div className="header-content">
          <h1 className="title">Tableau de Bord</h1>
          <p className="subtitle">
            Bienvenue <span className="bienvenu-name">{profil.name}</span> dans
            votre espace de travail
          </p>
        </div>
        <div className="header-actions">
          <div className="notification-icon">
            <i className="fa-solid fa-bell"></i>
            <span className="notification-badge">
              {stats.notifications || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-chart">
          <GlobalProgression stats={stats} />

          <div className="chart-header">
            <h2>Progression quotidienne</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyTasksStats} maxBarSize={50}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4B483" />
                  <stop offset="100%" stopColor="#E6C8B0" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#5A4E47" }}
                axisLine={{ stroke: "#C7B8A1" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#5A4E47" }}
                axisLine={{ stroke: "#C7B8A1" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#F5F0EC",
                  borderColor: "#D4B483",
                  borderRadius: "8px",
                }}
                formatter={(v) => [`${v}%`, "Complétion"]}
              />
              <Bar dataKey="pourcentage" fill="#4BC0C0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="side-charts">
          <PieSection
            title="Répartition des tâches"
            data={pieDataDaily}
            colors={COLORS}
          />
          <PieSection
            title="Statut des projets"
            data={pieProject}
            colors={COLORS2}
          />
        </div>
      </div>

      <div className="activity-section">
        <ActivityCard
          title="Activité récente"
          icon="history"
          data={stats.activities.recent}
        />
        <ActivityCard
          title="Tâches critiques"
          icon="exclamation-circle"
          data={stats.activities.critical}
          critical
        />
      </div>
    </div>
  );
};

// Fonction personnalisée pour éviter chevauchement des labels
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

function PieSection({ title, data, colors }) {
  return (
    <div className="pie-chart-container">
      <h3>{title}</h3>
      {data.every((d) => d.value === 0) ? (
        <div className="empty-state">
          <i className="fas fa-chart-pie"></i>
          <p>Aucune donnée disponible</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="#F5F0EC"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#F5F0EC",
                borderColor: "#D4B483",
                borderRadius: "8px",
              }}
              formatter={(value, name) => [`${value}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ActivityCard({ title, icon, data, critical }) {
  return (
    <div className={`activity-card ${critical ? "critical" : "recent"}`}>
      <div className="activity-header">
        <i className={`fas fa-${icon}`}></i>
        <h3>{title}</h3>
      </div>
      <div className="activity-list">
        {data.map((el) => (
          <div
            className={`activity-item ${critical ? "critical" : ""}`}
            key={el._id}
          >
            <div className="activity-icon">
              <i
                className={`fas ${
                  critical ? "fa-exclamation-triangle" : "fa-check-circle"
                }`}
              ></i>
            </div>
            <div className="activity-content">
              <h4 className="activity-title">{el.title}</h4>
              <p className="activity-description">{el.description}</p>
              <div className="activity-meta">
                {critical ? (
                  <>
                    <span className="activity-priority">Prioritaire</span>
                    <span className="activity-deadline">
                      Échéance:
                      {el.deadline
                        ? new Date(el.deadline).toLocaleString()
                        : "date non définie"}
                    </span>
                  </>
                ) : (
                  <span className="activity-date">
                    {el.deadline
                      ? new Date(el.deadline).toLocaleString()
                      : "date non définie"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalProgression({ stats }) {
  const progression = stats?.projects?.overallProgression || 0;
  return (
    <div className="progress-card">
      <div className="progress-header">
        <h3>Progression globale</h3>
        <div className="progress-percentage">
          {Math.round(progression)}%{" "}
          <span>
            {progression === 100 ? "🎉" : progression > 70 ? "👍" : "👌"}
          </span>
        </div>
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progression}%`,
            background: ` #75c2f5ff  `,
          }}
        ></div>
      </div>
      <div className="progress-footer">
        <span className="progress-stats">
          {stats?.projects?.completed || 0} / {stats?.projects?.total || 0}{" "}
          projets complétés
        </span>
        <span className="progress-status">
          {progression === 0
            ? "Prêt à commencer"
            : progression < 100
            ? "En cours de réalisation"
            : "Mission accomplie!"}
        </span>
      </div>
    </div>
  );
}

export default DashboardAdminComp;
