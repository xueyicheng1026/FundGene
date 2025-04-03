import React from 'react';

// 这是一个图表占位符组件，在实际应用中应使用Recharts库实现
const ComparisonChart = ({ data, title, userLineLabel, aiLineLabel, benchmarkLabel }) => {
  return (
    <div className="chart-placeholder" style={{ height: '300px', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--border-radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h3>{title}</h3>
      <p>图表将显示以下数据对比:</p>
      <ul>
        <li>{userLineLabel}</li>
        <li>{aiLineLabel}</li>
        <li>{benchmarkLabel}</li>
      </ul>
      <p>请安装recharts库以显示完整图表: npm install recharts</p>
    </div>
  );
};

export default ComparisonChart;
