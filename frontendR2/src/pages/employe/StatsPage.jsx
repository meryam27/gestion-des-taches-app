import { useState, useEffect } from "react";
import { Spin, message } from "antd";
import api from "../../api/statsApi";
import StatsHeader from "../../components/employe/stats/StatsHeader";
import GlobalStats from "../../components/employe/stats/GlobalStats";
import DailyStats from "../../components/employe/stats/DailyStats";
import MonthlyStats from "../../components/employe/stats/MonthlyStats";
import YearlyStats from "../../components/employe/stats/YearlyStats";
import "./stats.css";

const StatsPage = () => {
  const [loading, setLoading] = useState(true);
  const [statsType, setStatsType] = useState("global");
  const [statsData, setStatsData] = useState(null);
  const [params, setParams] = useState({});

  const fetchStats = async (type, params = {}) => {
    try {
      setLoading(true);
      let data;

      console.log("Type demandé:", type);
      console.log("Paramètres envoyés:", params);

      switch (type) {
        case "daily":
          data = await api.getDailyStats(params.date);
          break;
        case "monthly":
          data = await api.getMonthlyStats(params.year, params.month);
          break;
        case "yearly":
          data = await api.getYearlyStats(params.year);
          break;
        default:
          data = await api.getUserStats();
      }

      setStatsData(data);
      setStatsType(type);
    } catch (error) {
      message.error("Erreur lors du chargement des statistiques");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setParams(period);
    fetchStats(period.type, period);
  };

  useEffect(() => {
    fetchStats("global");
  }, []);

  const renderStats = () => {
    console.log("Stats type rendu:", statsType);
    if (loading)
      return (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      );

    switch (statsType) {
      case "daily":
        return <DailyStats data={statsData} />;
      case "monthly":
        return <MonthlyStats data={statsData} />;
      case "yearly":
        return <YearlyStats data={statsData} />;
      default:
        return <GlobalStats data={statsData} />;
    }
  };

  return (
    <div className="stats-page" style={{ marginLeft: "20rem" }}>
      <div className="header-section">
        <h1 className="projet-page-title">Statistiques des tâches</h1>
      </div>
      <StatsHeader onPeriodChange={handlePeriodChange} />
      <div className="stats-content">{renderStats()}</div>
    </div>
  );
};

export default StatsPage;
