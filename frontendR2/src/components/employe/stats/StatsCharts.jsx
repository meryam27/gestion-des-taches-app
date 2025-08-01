import React from 'react';
import { Column, Pie, Line } from '@ant-design/plots';


const StatsCharts = ({ type, data, ...props }) => {
  const commonConfig = {
    data,
    animation:{
      appear: {
        animation: 'path-in',
        duration: 2000,
      },
    },
    theme: {
      colors10: [
        '#1d3557', '#457b9d', '#a8dadc', 
        '#f4a261', '#e76f51', '#2a9d8f',
        '#bc313d', '#f7aab0', '#ffd166',
        '#06d6a0'
      ],
    },
    ...props
  };

  switch (type) {
    case 'pie':
      return <Pie 
        {...commonConfig}
        label={{
          type: 'inner',
          offset: '-30%',
          content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
          style: {
            fontSize: 14,
            textAlign: 'center',
          },
        }}
        interactions={[
          {
            type: 'element-active',
          },
        ]}
      />;
    
    case 'bar':
      return <Column 
        {...commonConfig}
        xField={props.xField}
        yField={props.yField}
        label={{
          position: 'middle',
          style: {
            fill: '#FFFFFF',
            opacity: 0.6,
          },
        }}
      />;
    
    case 'line':
    default:
      return <Line 
        {...commonConfig}
        smooth
        point={{
          size: 5,
          shape: 'diamond',
          style: {
            fill: 'white',
            stroke: '#457b9d',
            lineWidth: 2,
          },
        }}
      />;
  }
};

export default StatsCharts;