import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
///////////////////A UTILISER PLUTARD POUR AVOIR LA DATE DU JOU COMME // "2025-07-09"///////////
const getToday = () => new Date().toISOString().slice(0, 10);
///////////////////////////////////////////////////////////////SIMMULER LES JOURS
const getFormattedDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10); // format "YYYY-MM-DD"
};

const yesterday = getFormattedDate(-1); // 🗓️ hier
const today = getFormattedDate(0); // ✅ aujourd'hui
const tomorrow = getFormattedDate(1); // 🌞 demain
const apresDemain = getFormattedDate(2);
const apres2 = getFormattedDate(3);
const apres3 = getFormattedDate(4);
const apres4 = getFormattedDate(5);
///////////:::::TRAITEMENT POUR AFFICHER DIAGRAMME :::::////////////

const showPourcentageParJour = (taches) => {
  const global = {};
  if (!taches || !taches.length) return []; // ✅ pas null

  taches.forEach((tache) => {
    const date = tache.date;
    if (!global[date]) {
      global[date] = { total: 0, terminees: 0 };
    }
    global[date].total += 1;
    if (tache.status === "terminée" || tache.status === "terminé") {
      global[date].terminees += 1;
    }
  });

  return Object.entries(global).map(([date, { total, terminees }]) => ({
    date,
    pourcentage: Math.round((terminees / total) * 100),
    nombre: terminees + "/" + total,
  }));
};
/*********SIMMULATION DE LA BD */
const projets = [
  {
    id: 1,
    nom: "projet1",
    description: "création du projet1",
    date_debut: "1/1/2025",
    date_fin: "1/1/2026",

    status: "terminé",
  },
  {
    id: 2,
    nom: "projet2",
    description: "création du projet2",
    date_debut: "2/11/2025",
    date_fin: "17/11/2026",
    status: "en cours",
  },
  {
    id: 3,
    nom: "projet3",
    description: "création du projet3",
    date_debut: "1/3/2025",
    date_fin: "1/3/2026",
    status: "terminé",
  },
];
const tachesLongues = [
  {
    id: 1,
    nom: "tache1",
    description: "création du tache1",
    date_debut: "1/1/2025",
    date_fin: "1/1/2026",
    status: "à faire",
  },
  {
    id: 2,
    nom: "tache2",
    description: "création du tache2",
    date_debut: "2/11/2025",
    date_fin: "17/11/2026",
    status: "en cours",
  },
  {
    id: 3,
    nom: "tache3",
    description: "création du tache3",
    date_debut: "1/3/2025",
    date_fin: "1/3/2026",
    status: "à faire",
  },
];
const tachesJournalieres = [
  {
    id: 1,
    nom: "tache1",
    description: "création du tache1",
    date: yesterday,
    status: "en cours",
  },
  {
    id: 2,
    nom: "tache2",
    description: "création du tache2",
    date: tomorrow,
    status: "à faire",
  },
  {
    id: 3,
    nom: "tache3",
    description: "création du tache3",
    date: today,
    status: "terminé",
  },
  {
    id: 4,
    nom: "tache4",
    description: "création du tache4",
    date: today,
    status: "terminé",
  },
  {
    id: 5,
    nom: "tache5",
    description: "création du tache5",
    date: apres2,
    status: "terminé",
  },
  {
    id: 6,
    nom: "tache6",
    description: "création du tache6",
    date: apresDemain,
    status: "terminé",
  },
  {
    id: 7,
    nom: "tache6",
    description: "création du tache6",
    date: apres3,
    status: "terminé",
  },
  {
    id: 8,
    nom: "tache6",
    description: "création du tache6",
    date: apres4,
    status: "terminé",
  },
];
export default function DashboardEmploye() {
  const statusTache = (status) => {
    const nbr1 = tachesJournalieres.reduce(
      (acc, tache) => (tache.status == status ? acc + 1 : acc),
      0
    );
    const nbr2 = tachesLongues.reduce(
      (acc, tache) => (tache.status == status ? acc + 1 : acc),
      0
    );
    return nbr1 + nbr2;
  };
  const projets_actifs = () => {
    const nbr = projets.reduce(
      (acc, projet) => (projet.status == "en cours" ? acc + 1 : acc),
      0
    );
    return nbr;
  };
  return (
    <div className="dashboard-page">
      <div className="display-dashboard">
        <h1 className="display-dashboard-title">DASHBOARD</h1>
        <p className="display-dashboard-text">
          Bienvenue dans votre espace de travail
        </p>
      </div>
      <div className="brieve-satatistiques">
        <DashboardCart>
          <div className="cart-container">
            <div className="left-part">
              <p className="display-6">Taches en cours</p>
              <span>{statusTache("en cours")}</span>
            </div>
            <div className="right-part check en-cours">
              <i class="fa-solid fa-hourglass-half"></i>
            </div>
          </div>
        </DashboardCart>
        <DashboardCart>
          <div className="cart-container">
            <div className="left-part me-4">
              <p className="display-6">Taches à faire</p>
              <span>{statusTache("à faire")}</span>
            </div>
            <div className="right-part check a-faire">
              <i class="fa-solid fa-clock "></i>
            </div>
          </div>
        </DashboardCart>

        <DashboardCart>
          <div className="cart-container">
            <div className="left-part">
              <p className="display-6">Taches terminées</p>
              <span>{statusTache("terminé")}</span>
            </div>
            <div className="right-part check termine">
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        </DashboardCart>
        <DashboardCart>
          <div className="cart-container">
            <div className="left-part">
              <p className="display-6">Projets en cours</p>
              <span>{projets_actifs()}</span>
            </div>
            <div className="right-part check projet-en-cours">
              <i class="fa-solid fa-arrow-trend-up"></i>
            </div>
          </div>
        </DashboardCart>
      </div>
      <DashboardBodyDiagramme />
    </div>
  );
}
function DashboardCart({ children }) {
  return <div className="dashboard-cart">{children}</div>;
}

//////////////DIAGRAMME EN BARREIER///////////////////
function DiagrammeRectangles() {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <h4 className="mb-3 text-center">
        Pourcentage des tâches journalières terminées
      </h4>
      <ResponsiveContainer>
        <BarChart data={showPourcentageParJour(tachesJournalieres)}>
          <CartesianGrid strokeDasharray="3 3" />{" "}
          {/* -->  fiche une gride au fond */}
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(value) => `${value}%`}
            content={({ payload, label }) => {
              if (!payload || !payload.length) return null;

              const data = payload[0].payload;
              return (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #ccc",
                    padding: "10px",
                  }}
                >
                  <p>Date : {label}</p>
                  <p>Pourcentage : {data.pourcentage} %</p>
                  <p>Terminées : {data.nombre}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="pourcentage" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
///////////////////////////////////////////////////////////////////////
function DashboardBodyDiagramme() {
  return (
    <div className="dashboard-diagramme">
      <div className="diagramme-barriere">
        <DiagrammeRectangles />
      </div>
      <div className="diagramme-cercle">
        <DiagrammeCirculaire />
        <DiagrammeCirculaire />
      </div>
    </div>
  );
}
///////////////////////::

function DiagrammeCirculaire() {
  const data = [
    { name: "À faire", value: 5 },
    { name: "En cours", value: 3 },
    { name: "Terminées", value: 7 },
  ];

  const COLORS = ["#facc15", "#3b82f6", "#10b981"]; // Jaune, Bleu, Vert

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h4 className="text-center mb-3">Répartition des tâches</h4>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={98}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
