import { Card, Row, Col, Typography } from 'antd';
import { 
  ProjectOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  DashboardOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  HourglassOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import StatsCharts from './StatsCharts';

const { Title, Text } = Typography;

const GlobalStats = ({ data }) => {
  if (!data) return null;

  // Calculer les totaux pour les pourcentages
  const totalTasksByType = data.tasks.stats.reduce((sum, t) => sum + t.total, 0);
  const totalTasksByStatus = Object.values(data.tasks.statusDistribution).reduce((sum, val) => sum + val, 0);
 // console.log("totalTasks",totalTasksByStatus);
  // console.log("totalTasks",totalTasksByType);
  return (
    <div className="global-stats">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className="overview-cards">
            <div className="overview-card">
              <h3>
                <span className="icon-wrapper">
                  <ProjectOutlined />
                </span>
                Projets
              </h3>
              <div className="main-value">{data.projects.total}</div>
              <div className="comparison">
                Progression globale de vos projets: {data.projects.overallProgression}%
              </div>
            </div>

            <div className="overview-card">
              <h3>
                <span className="icon-wrapper">
                  <CheckCircleOutlined />
                </span>
                Tâches complétées
              </h3>
              <div className="main-value">{data.tasks.statusDistribution.completed}</div>
              <div className="comparison positive">
                
              </div>
            </div>

            <div className="overview-card">
              <h3>
                <span className="icon-wrapper">
                  <WarningOutlined />
                </span>
                Tâches en retard
              </h3>
              <div className="main-value">{data.tasks.statusDistribution.late}</div>
              <div className="comparison negative">
               
              </div>
            </div>

            <div className="overview-card">
              <h3>
                <span className="icon-wrapper">
                  <DashboardOutlined />
                </span>
                Progression moyenne de vos taches
              </h3>
              <div className="main-value">
                {data.tasks.progression.avgProgression?.toFixed(1) || 0}%
              </div>
              <div className="comparison">
                <ClockCircleOutlined /> Suivi en temps réel
              </div>
            </div>

            {/* Nouvelle carte pour les tâches longues */}
            <div className="overview-card">
              <h3>
                <span className="icon-wrapper">
                  <HourglassOutlined />
                </span>
                Tâches longues
              </h3>
              <div className="main-value">
                {data.tasks.stats.find(t => t.type === 'long')?.total || 0}
              </div>
              <div className="comparison">
                Tâches à long terme
              </div>
            </div>

            {/* Nouvelle carte pour les tâches journalières */}
            <div className="overview-card">
              <h3>
                <span className="icon-wrapper">
                  <CalendarOutlined />
                </span>
                Tâches journalières
              </h3>
              <div className="main-value">
                {data.tasks.stats.find(t => t.type === 'daily')?.total || 0}
              </div>
              <div className="comparison">
                Tâches quotidiennes
              </div>
            </div>
          </div>
        </Col>

        <Col span={24}>
          <div className="stats-card">
            <h2><BarChartOutlined /> Progression des taches journalieres (7 jours)</h2>
            <div className="stats-chart-container">
              <StatsCharts 
                type="line" 
                data={data.tasks.dailyProgression} 
                xField="date" 
                yField="pourcentage"
              />
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div className="stats-card">
            <h2><PieChartOutlined /> Répartition par type long/journaliere</h2>
            <div className="stats-chart-container">
              <StatsCharts
                type="pie"
                data={data.tasks.stats.map(t => ({
                  type: t.type === 'daily' ? 'Journalière' : 'Long terme',
                  value: t.total,
                  //percent: Math.round((t.total / totalTasksByType) * 100)
                }))}
                angleField="value"
                colorField="type"
                tooltip={{
                  formatter: (datum) => ({
                   
                      name: datum.type,
                      value: `${(datum.percent *100).toFixed(0)}%`
                    
                  })
                }}
              />
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div className="stats-card">
            <h2><PieChartOutlined /> Statut des tâches longues</h2>
            <div className="stats-chart-container">
             <StatsCharts
                  type="pie"
                  data={[
                    { type: 'Complétées', value: data.tasks.statusDistribution.completed },
                    { type: 'En cours', value: data.tasks.statusDistribution.inProgress },
                    { type: 'En retard', value: data.tasks.statusDistribution.late },
                    { type: 'En attente', value: data.tasks.statusDistribution.pending },
                  ]}
                  angleField="value"
                  colorField="type"
                  tooltip={{
                    formatter: (datum) => ({
                      name: datum.type,
                      value: `${(datum.percent * 100).toFixed(0)}%`
                    })
                  }}
                />

            </div>
          </div>
        </Col>

        <Col span={24}>
          <div className="activities-section">
            <div className="activity-card recent">
              <h3><ClockCircleOutlined /> Activités récentes</h3>
              <div className="activity-list">
                {data.activities.recent.slice(0, 5).map(activity => (
                  <div key={activity._id} className="activity-item">
                    <div className="activity-icon">
                      {activity.status === 'completed' ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      )}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.project?.name || 'Sans projet'}</p>
                      <div className="activity-meta">
                        <span>
                          <ClockCircleOutlined /> {new Date(activity.deadline).toLocaleDateString()}
                        </span>
                        <span>
                          {activity.progress}% complété
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="activity-card critical">
              <h3><WarningOutlined /> Tâches critiques</h3>
              <div className="activity-list">
                {data.activities.critical.slice(0, 5).map(task => (
                  <div key={task._id} className="activity-item critical">
                    <div className="activity-icon">
                      <WarningOutlined />
                    </div>
                    <div className="activity-content">
                      <h4>{task.title}</h4>
                      <p>{task.project?.name || 'Sans projet'}</p>
                      <div className="activity-meta">
                        <span>
                          <WarningOutlined /> {task.daysLate} jours de retard
                        </span>
                        <span>
                          {task.progress}% complété
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GlobalStats;