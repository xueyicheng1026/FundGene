import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * 资产配置对比图表
 * 展示当前资产配置与目标配置的对比
 */
const AllocationComparisonChart = ({ data }) => {
  const { theme } = useContext(ThemeContext);
  
  // 根据深色模式调整图表颜色
  const currentColor = theme === 'dark' ? '#6fb0ff' : '#2563eb';
  const targetColor = theme === 'dark' ? '#5de0ad' : '#10b981';
  
  // 自定义工具提示
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const current = payload.find(p => p.dataKey === 'current');
    const target = payload.find(p => p.dataKey === 'target');
    const diff = current.value - target.value;
    
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`${payload[0].payload.category}`}</p>
        <p className="tooltip-current">{`当前: ${current.value.toFixed(1)}%`}</p>
        <p className="tooltip-target">{`目标: ${target.value.toFixed(1)}%`}</p>
        <p className="tooltip-diff">{`差异: ${diff.toFixed(1)}%`}</p>
      </div>
    );
  };
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barGap={10}
        barSize={20}
        className={`theme-${theme}`} // 添加主题类以触发重新渲染
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="category" 
          tick={{ fill: theme === 'dark' ? '#c8c8d0' : '#333' }} 
        />
        <YAxis 
          tickFormatter={(value) => `${value}%`} 
          tick={{ fill: theme === 'dark' ? '#c8c8d0' : '#333' }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => (value === 'current' ? '当前配置' : '目标配置')} 
          wrapperStyle={{ color: theme === 'dark' ? '#c8c8d0' : '#333' }}
        />
        <Bar dataKey="current" name="当前配置" fill={currentColor} radius={[4, 4, 0, 0]} />
        <Bar dataKey="target" name="目标配置" fill={targetColor} radius={[4, 4, 0, 0]} />
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
      target: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default AllocationComparisonChart;
