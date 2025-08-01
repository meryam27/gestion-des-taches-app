import { Typography, Tag, Progress, Row, Col, Card, Divider, Statistic, Table } from 'antd';
import { 
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined,
  TrophyOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  BulbOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const { Title, Text } = Typography;

const MonthlyStats = ({ data }) => {
  if (!data) return null;

  // Calcul des indicateurs clés
  const completionRate = data.stats.total > 0 ? Math.round((data.stats.completed / data.stats.total) * 100) : 0;
  const lateRate = data.stats.total > 0 ? Math.round((data.stats.late / data.stats.total) * 100) : 0;
  const avgProgress = Math.round(data.stats.avgProgress || 0);

  // Préparation des données pour les graphiques
  const performanceData = {
    labels: data.dailyStats.map(day => day.date.split('-')[2]),
    datasets: [
      {
        label: 'Productivité quotidienne',
        data: data.dailyStats.map(day => day.completionRate),
        backgroundColor: '#1d3557',
        borderColor: '#457b9d',
        borderWidth: 1,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const statusDistribution = {
    labels: ['Complétées', 'En cours', 'En retard'],
    datasets: [{
      data: [data.stats.completed, data.stats.inProgress, data.stats.late],
      backgroundColor: ['#06d6a0', '#ffd166', '#bc313d'],
      borderWidth: 0
    }]
  };

  // Trouver les jours marquants
  const bestDay = [...data.dailyStats].sort((a, b) => b.completed - a.completed)[0];
  const mostProductiveDay = [...data.dailyStats].sort((a, b) => b.completionRate - a.completionRate)[0];
  const worstDay = [...data.dailyStats].sort((a, b) => b.late - a.late)[0];

  return (
    <div className="stats-card monthly-stats">
      {/* En-tête */}
      <div className="stats-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ color: '#1d3557', margin: 0 }}>
            <CalendarOutlined /> Résumé du mois de {new Date(data.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag icon={<PieChartOutlined />} color="#1d3557">
              {data.stats.total} tâches
            </Tag>
            <Tag icon={<CheckCircleOutlined />} color="#06d6a0">
              {completionRate}% complétées
            </Tag>
          </div>
        </div>
      </div>

      {/* Indicateurs clés */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="indicator-card" hoverable>
            <Statistic
              title="Performance moyenne"
              value={avgProgress}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: avgProgress >= 80 ? '#06d6a0' : avgProgress >= 50 ? '#ffd166' : '#bc313d' }}
            />
            <Progress 
              percent={avgProgress} 
              status="active"
              strokeColor={{
                '0%': '#457b9d',
                '100%': '#06d6a0',
              }}
              showInfo={false}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="indicator-card" hoverable>
            <Statistic
              title="Tâches en cours"
              value={data.stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ffd166' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {data.stats.pending} en attente
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="indicator-card" hoverable>
            <Statistic
              title="Tâches en retard"
              value={data.stats.late}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#bc313d' }}
            />
            {data.stats.late > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {lateRate}% du total
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={<><BulbOutlined /> Évolution de la productivité</>}
            className="chart-card"
          >
            <Bar
              data={performanceData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.raw}% de complétion`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`
                    }
                  }
                }
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={<><PieChartOutlined /> Répartition des tâches</>}
            className="chart-card"
          >
            <div style={{ height: 250 }}>
              <Bar
                data={statusDistribution}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top'
                    }
                  },
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Jours marquants */}
      <Card 
        title={<><StarOutlined /> Jours remarquables</>} 
        style={{ marginBottom: 24 }}
        className="highlight-card"
      >
        <Row gutter={16}>
          <Col xs={24} md={12} style={{ marginBottom: 16 }}>
            <Card bordered={false}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <TrophyOutlined style={{ color: '#ffd166', fontSize: 20, marginRight: 8 }} />
                <Text strong style={{ fontSize: 16 }}>Meilleure performance</Text>
              </div>
              {mostProductiveDay && mostProductiveDay.completionRate > 0 ? (
                <div>
                  <Text strong style={{ fontSize: '1.1rem' }}>
                    {new Date(mostProductiveDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Statistic
                      value={mostProductiveDay.completionRate}
                      suffix="%"
                      valueStyle={{ color: '#06d6a0', fontSize: '1.5rem' }}
                    />
                    <Statistic
                      title="Tâches"
                      value={mostProductiveDay.total}
                      valueStyle={{ fontSize: '1.1rem' }}
                    />
                    <Statistic
                      title="Complétées"
                      value={mostProductiveDay.completed}
                      valueStyle={{ fontSize: '1.1rem' }}
                    />
                  </div>
                </div>
              ) : (
                <Text type="secondary">Données insuffisantes</Text>
              )}
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card bordered={false}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <ExclamationCircleOutlined style={{ color: '#bc313d', fontSize: 20, marginRight: 8 }} />
                <Text strong style={{ fontSize: 16 }}>Défis à relever</Text>
              </div>
              {worstDay && worstDay.late > 0 ? (
                <div>
                  <Text strong style={{ fontSize: '1.1rem' }}>
                    {new Date(worstDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Statistic
                      value={worstDay.late}
                      valueStyle={{ color: '#bc313d', fontSize: '1.5rem' }}
                    />
                    <Statistic
                      title="Total"
                      value={worstDay.total}
                      valueStyle={{ fontSize: '1.1rem' }}
                    />
                    <Statistic
                      title="Taux"
                      value={worstDay.completionRate}
                      suffix="%"
                      valueStyle={{ fontSize: '1.1rem' }}
                    />
                  </div>
                </div>
              ) : (
                <Text type="secondary">Aucun retard ce mois-ci</Text>
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Détails quotidiens */}
      <Card
        title={<><CalendarOutlined /> Activité quotidienne</>}
        className="daily-activity-card"
      >
        <Table
          dataSource={data.dailyStats}
          rowKey="date"
          pagination={{ pageSize: 7, hideOnSinglePage: true }}
          scroll={{ x: true }}
          columns={[
            {
              title: 'Jour',
              dataIndex: 'date',
              key: 'date',
              render: date => (
                <div>
                  <Text strong>{new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </Text>
                </div>
              ),
              width: 100
            },
            {
              title: 'Statut',
              key: 'status',
              render: (_, record) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <Progress 
                    type="circle" 
                    percent={record.completionRate} 
                    width={40}
                    strokeColor={record.completionRate >= 80 ? '#06d6a0' : '#457b9d'}
                    format={() => ''}
                    style={{ marginRight: 8 }}
                  />
                  <Tag color="#06d6a0">{record.completed}✓</Tag>
                  <Tag color="#ffd166">{record.inProgress}→</Tag>
                  {record.late > 0 && <Tag color="#bc313d">{record.late}!</Tag>}
                </div>
              )
            },
            {
              title: 'Détails',
              key: 'details',
              render: (_, record) => (
                <div>
                  <Text strong>{record.total} tâches</Text>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Tag color="#031b2bff" style={{ margin: 0 }}>{record.dailyCount}Q</Tag>
                    <Tag color="#05513fff" style={{ margin: 0 }}>{record.longCount}L</Tag>
                  </div>
                </div>
              )
            },
            {
              title: 'Progression',
              key: 'progress',
              render: (_, record) => (
                <Progress 
                  percent={record.avgProgress} 
                  size="small" 
                  strokeColor={record.avgProgress >= 80 ? '#06d6a0' : '#457b9d'}
                  format={percent => `${percent}%`}
                />
              )
            }
          ]}
          locale={{
            emptyText: (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <Text type="secondary">Aucune activité enregistrée ce mois-ci</Text>
              </div>
            )
          }}
        />
      </Card>
    </div>
  );
};

export default MonthlyStats;