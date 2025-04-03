import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from 'recharts';

/**
 * 行为雷达图组件
 * 用于可视化展示用户在不同行为维度上的表现
 * @param {Object} props - 组件属性
 * @param {Array} props.data - 雷达图数据
 */
const BehaviorRadar = ({ data }) => {
  // 处理图表域值，确保从0开始
  const chartDomain = [0, 100];

  // 检查是否安装了recharts
  if (typeof RadarChart === 'undefined') {
    return (
      <div 
        style={{ 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'var(--neutral-50)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-md)',
          flexDirection: 'column'
        }}
      >
        <h3>行为特征雷达图</h3>
        <p>请安装recharts库以显示图表: npm install recharts</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={chartDomain} />
        <Radar
          name="行为特征"
          dataKey="score"
          stroke="var(--primary-color)"
          fill="var(--primary-color)"
          fillOpacity={0.2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default BehaviorRadar;
