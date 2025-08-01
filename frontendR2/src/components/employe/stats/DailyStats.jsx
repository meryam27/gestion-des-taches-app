import { Table, Typography, Tag } from 'antd';
import { 
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const columns = [
  { 
    title: 'Tâche', 
    dataIndex: 'title', 
    key: 'title',
    render: (text) => <Text strong>{text}</Text>
  },
  { 
    title: 'Type', 
    dataIndex: 'type', 
    key: 'type',
    render: (type) => (
      <Tag color={type === 'daily' ? '#031b2bff' : '#05513fff'}>
        {type === 'daily' ? 'Quotidienne' : 'Longue'}
      </Tag>
    )
  },
  { 
    title: 'Projet', 
    dataIndex: ['project', 'name'], 
    key: 'project',
    render: (text) => text || 'Sans projet'
  },
  { 
    title: 'Statut', 
    dataIndex: 'status', 
    key: 'status',
    render: (status) => {
      const statusMap = {
        completed: { icon: <CheckCircleOutlined />, color: '#06d6a0', text: 'Terminée' },
        inProgress: { icon: <ClockCircleOutlined />, color: '#ffd166', text: 'En cours' },
        pending: { icon: <ClockCircleOutlined />, color: '#457b9d', text: 'À faire' },
        late: { icon: <ExclamationCircleOutlined />, color: '#bc313d', text: 'En retard' }
      };
      return (
        <Text style={{ color: statusMap[status]?.color }}>
          {statusMap[status]?.icon} {statusMap[status]?.text}
        </Text>
      );
    }
  },
  { 
    title: 'Progression', 
    dataIndex: 'progress', 
    key: 'progress',
    render: (progress) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: '100%',
          maxWidth: 100,
          height: 8,
          backgroundColor: '#e0e0e0',
          borderRadius: 4
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: progress === 100 ? '#06d6a0' : '#457b9d',
            borderRadius: 4
          }} />
        </div>
        <Text>{progress}%</Text>
      </div>
    )
  },
];

const DailyStats = ({ data }) => {
  if (!data) return null;

  return (
    <div className="stats-card daily-stats">
      <h2><CalendarOutlined /> Statistiques du {data.date}</h2>
      
      <div className="stats-indicators">
        <div className="indicator-card">
          <h3>Total tâches</h3>
          <div className="value">{data.stats.total}</div>
          <div className="label">Ce jour</div>
        </div>
        
        <div className="indicator-card">
          <h3>Complétées</h3>
          <div className="value">{data.stats.completed}</div>
          <div className="label">{data.stats.completionRate}% de taux</div>
        </div>
        
        <div className="indicator-card in-progress">
          <h3>En cours</h3>
          <div className="value">{data.stats.inProgress}</div>
          <div className="label">En progression</div>
        </div>
        
        <div className="indicator-card late">
          <h3>En retard</h3>
          <div className="value">{data.stats.late}</div>
          <div className="label">À prioriser</div>
        </div>
      </div>
      
      <div className="tasks-table">
        <Table 
          columns={columns} 
          dataSource={data.tasks} 
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
};

export default DailyStats;