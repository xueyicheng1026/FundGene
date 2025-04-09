import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

/**
 * 资产配置对比图表组件
 * 使用条形图对比当前资产配置与目标配置
 * @param {Object} props - 组件属性
 * @param {Array} props.data - 资产配置数据
 */
const AllocationComparisonChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="empty-chart">暂无配置数据</div>;
  }

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-current">{`当前配置: ${payload[0].value.toFixed(1)}%`}</p>
          <p className="tooltip-target">{`目标配置: ${payload[1].value.toFixed(1)}%`}</p>
          <p className="tooltip-diff">{`差异: ${(payload[0].value - payload[1].value).toFixed(1)}%`}</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis label={{ value: '配置比例 (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="current" name="当前配置" fill="#3b82f6" />
        <Bar dataKey="target" name="目标配置" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// 添加PropTypes验证
AllocationComparisonChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      current: PropTypes.number.isRequired,
      target: PropTypes.number.isRequired
    })
  )
};

export default AllocationComparisonChart;
