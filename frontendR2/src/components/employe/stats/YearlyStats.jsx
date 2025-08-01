import { Typography, Card, Row, Col, Progress, Tag, Divider, Statistic } from 'antd';
import { 
  CalendarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  StarFilled
} from '@ant-design/icons';
import StatsCharts from './StatsCharts';

const { Title, Text } = Typography;

const YearlyStats = ({ data }) => {
  if (!data) return null;

  const currentMonth = new Date().getMonth() + 1;
  const yearlyData = data.stats || {};
  
  // Calcul des indicateurs clés
  const globalCompletionRate = yearlyData.total 
    ? Math.round((yearlyData.completed / yearlyData.total) * 100) 
    : 0;
  
  const lateRate = yearlyData.total 
    ? Math.round((yearlyData.late / yearlyData.total) * 100)
    : 0;

  // Trouver le meilleur mois
  const bestMonth = data.monthlyStats.reduce((max, month) => 
    month.completionRate > max.completionRate ? month : max,
    {completionRate: 0, month: 'Aucun'}
  );

  return (
    <div className="stats-card yearly-stats">
      {/* En-tête redessinée */}
      <div className="stats-header" style={{ 
        background: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>Rapport annuel</Text>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              {data.year}
            </Title>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>Performance globale</Text>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {globalCompletionRate}%
            </Title>
          </div>
        </div>
      </div>

      {/* Indicateurs clés sous forme de statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="indicator-card" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title="Total des tâches"
              value={yearlyData.total || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1d3557', fontSize: '28px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="#031b2bff" style={{ marginRight: '4px' }}>
                {yearlyData.dailyCount || 0} quotidiennes
              </Tag>
              <Tag color="#05513fff">
                {yearlyData.longCount || 0} long terme
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="indicator-card" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title="Tâches complétées"
              value={yearlyData.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#06d6a0', fontSize: '28px' }}
            />
            <Progress 
              percent={globalCompletionRate} 
              showInfo={false}
              strokeColor={globalCompletionRate >= 80 ? '#06d6a0' : '#457b9d'}
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="indicator-card in-progress" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title="En progression"
              value={yearlyData.inProgress || 0}
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#ffd166', fontSize: '28px' }}
            />
            <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
              Moyenne: {Math.round(yearlyData.avgProgress || 0)}%
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="indicator-card late" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title="En retard"
              value={yearlyData.late || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#bc313d', fontSize: '28px' }}
            />
            <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
              {yearlyData.pending || 0} en attente
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Section des graphiques */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BarChartOutlined style={{ marginRight: '8px', color: '#1d3557' }} />
            <span>Analyse des performances</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
        bodyStyle={{ padding: '16px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ height: '300px' }}>
              <StatsCharts
                type="bar"
                data={data.monthlyStats}
                xField="month"
                yFields={['completed', 'late']}
                height={300}
                colors={['#06d6a0', '#bc313d']}
                legend={['Complétées', 'En retard']}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ height: '300px' }}>
              <StatsCharts
                type="line"
                data={data.monthlyStats}
                xField="month"
                yFields={['completionRate']}
                height={300}
                colors={['#1d3557']}
                legend={['Taux de complétion']}
                yAxisLabel="%"
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Détails mensuels sous forme de tableau */}
      <Card
        title="Détails par mois"
        style={{ marginBottom: '24px' }}
        bodyStyle={{ padding: 0 }}
      >
        <div className="monthly-stats-grid">
          {data.monthlyStats.map((month, index) => {
            const monthNumber = parseInt(month.month.split('-')[1]);
            const isCurrentMonth = monthNumber === currentMonth;
            const monthName = new Date(month.month).toLocaleString('fr-FR', { month: 'long' });
            
            return (
              <Card 
                key={index} 
                className={`monthly-stat-item ${isCurrentMonth ? 'current-month' : ''}`}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text strong style={{ fontSize: '16px' }}>{monthName}</Text>
                  {isCurrentMonth && <Tag color="orange">Actuel</Tag>}
                  {month.month === bestMonth.month && <StarFilled style={{ color: '#ffd166' }} />}
                </div>

                <Progress 
                  percent={month.completionRate} 
                  strokeColor={month.completionRate >= 80 ? '#06d6a0' : '#457b9d'}
                  showInfo={false}
                  style={{ marginBottom: '12px' }}
                />

                <Row gutter={8}>
                  <Col span={12}>
                    <Statistic
                      title="Complétées"
                      value={month.completed}
                      prefix={<RiseOutlined />}
                      valueStyle={{ fontSize: '16px', color: '#06d6a0' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="En retard"
                      value={month.late}
                      prefix={<FallOutlined />}
                      valueStyle={{ fontSize: '16px', color: '#bc313d' }}
                    />
                  </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                <Row gutter={8}>
                  <Col span={12}>
                    <Text type="secondary">Total</Text>
                    <Text strong style={{ display: 'block' }}>{month.total}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Taux</Text>
                    <Text strong style={{ display: 'block' }}>{month.completionRate}%</Text>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Meilleur mois mis en avant */}
      {bestMonth.completionRate > 0 && (
        <Card 
          style={{ 
            marginTop: '24px',
            borderLeft: '4px solid #ffd166',
            background: 'rgba(255, 209, 102, 0.05)'
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TrophyOutlined style={{ 
              fontSize: '24px', 
              color: '#ffd166',
              marginRight: '16px'
            }} />
            <div>
              <Text strong style={{ fontSize: '16px', display: 'block' }}>
                Meilleur mois: {new Date(bestMonth.month).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
              </Text>
              <Row gutter={16} style={{ marginTop: '8px' }}>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Taux de complétion"
                    value={bestMonth.completionRate}
                    suffix="%"
                    valueStyle={{ color: '#06d6a0' }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Tâches complétées"
                    value={bestMonth.completed}
                    valueStyle={{ color: '#1d3557' }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Progression moyenne"
                    value={Math.round(bestMonth.avgProgress || 0)}
                    suffix="%"
                    valueStyle={{ color: '#457b9d' }}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default YearlyStats;