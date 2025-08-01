import { useState } from 'react';
import { DatePicker, Select, Button } from 'antd';
import dayjs from 'dayjs';
import { 
  CalendarOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

const StatsHeader = ({ onPeriodChange }) => {
  const [periodType, setPeriodType] = useState('global');
  const [date, setDate] = useState(dayjs());
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [year, setYear] = useState(dayjs().format('YYYY'));

  const handleApply = () => {
      console.log("handleApply appelé avec :", periodType);
    switch (periodType) {
      case 'daily':
        onPeriodChange({ type: 'daily', date: date.format('YYYY-MM-DD') });
        break;
      case 'monthly':
        onPeriodChange({ 
          type: 'monthly', 
          year: month.split('-')[0], 
          month: month.split('-')[1] 
        });
        break;
      case 'yearly':
        onPeriodChange({ type: 'yearly', year });
        break;
      default:
        onPeriodChange({ type: 'global' });
    }
  };

  return (
    <div className="stats-period-selector">
      <Select 
        defaultValue="global"
        style={{ width: 180 }}
        onChange={(value) => {
        setPeriodType(value);
        console.log("Période sélectionnée :", value); // ← pour debug
        }}
        size="large"
      >
        <Option value="global">
          <DashboardOutlined /> Vue globale
        </Option>
        <Option value="daily">
          <CalendarOutlined /> Journalier
        </Option>
        <Option value="monthly">
          <AppstoreOutlined /> Mensuel
        </Option>
        <Option value="yearly">
          <ClockCircleOutlined /> Annuel
        </Option>
      </Select>

      {periodType === 'daily' && (
        <DatePicker 
          value={date}
          onChange={setDate}
          format="DD/MM/YYYY"
          style={{ width: 200 }}
          size="large"
          allowClear={false}
        />
      )}

      {periodType === 'monthly' && (
        <DatePicker 
          picker="month"
          value={dayjs(month, 'YYYY-MM')}
          onChange={(m) => setMonth(m.format('YYYY-MM'))}
          style={{ width: 200 }}
          size="large"
          allowClear={false}
        />
      )}

      {periodType === 'yearly' && (
        <DatePicker 
          picker="year"
          value={dayjs(year, 'YYYY')}
          onChange={(y) => setYear(y.format('YYYY'))}
          style={{ width: 200 }}
          size="large"
          allowClear={false}
        />
      )}

      <Button 
        type="primary" 
        onClick={handleApply}
        size="large"
        style={{ 
          background: 'var(--secondary-red)',
          borderColor: 'var(--secondary-red)'
        }}
      >
        Appliquer
      </Button>
    </div>
  );
};

export default StatsHeader;