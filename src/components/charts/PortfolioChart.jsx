import React, { useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// 颜色常量
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

// 自定义图例
const renderLegend = (props) => {
  const { payload } = props;
  
  return (
    <ul className="portfolio-chart-legend">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="legend-item">
          <span className="legend-color" style={{ backgroundColor: entry.color }}></span>
          <span className="legend-label">{entry.value}</span>
          <span className="legend-value">{entry.payload.percent.toFixed(1)}%</span>
        </li>
      ))}
    </ul>
  );
};

// 自定义提示框
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="portfolio-chart-tooltip">
        <p className="tooltip-name">{data.name}</p>
        <p className="tooltip-value">{`¥${data.value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}</p>
        <p className="tooltip-percent">{`${data.percent.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const PortfolioChart = ({ data }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 添加并移除样式
    const style = document.createElement('style');
    style.textContent = `
      .portfolio-chart-legend {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 8px;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        font-size: 12px;
      }
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }
      
      .legend-label {
        color: var(--text-secondary);
        margin-right: 8px;
      }
      
      .legend-value {
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .portfolio-chart-tooltip {
        background-color: white;
        border: 1px solid var(--neutral-200);
        border-radius: var(--border-radius-md);
        padding: 8px 12px;
        box-shadow: var(--shadow-md);
      }
      
      .tooltip-name {
        font-weight: 600;
        margin: 0 0 4px;
      }
      
      .tooltip-value, .tooltip-percent {
        margin: 0;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 如果没有安装recharts，显示占位符
  if (typeof PieChart === 'undefined') {
    return (
      <div className="chart-placeholder" style={{ height: '100%', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--border-radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h3>资产配置图表</h3>
        <p>请安装recharts库以显示完整图表: npm install recharts</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
