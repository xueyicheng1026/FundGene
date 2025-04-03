import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { fetchBehaviorData, fetchBehaviorBiases, fetchUserBehaviorStats } from '../services/mockApi';

/**
 * 用户行为数据钩子
 * @returns {Object} - 用户行为相关数据和状态
 */
const useBehaviorData = () => {
  const { user } = useContext(AuthContext);
  const [behaviorRadarData, setBehaviorRadarData] = useState([]);
  const [behaviorBiases, setBehaviorBiases] = useState([]);
  const [behaviorStats, setBehaviorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取行为数据
  useEffect(() => {
    const loadBehaviorData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 并行获取三种行为数据
        const [radarResponse, biasesResponse, statsResponse] = await Promise.all([
          fetchBehaviorData(),
          fetchBehaviorBiases(),
          fetchUserBehaviorStats(user.id)
        ]);
        
        if (radarResponse.success) {
          setBehaviorRadarData(radarResponse.data);
        } else {
          throw new Error('获取行为雷达图数据失败');
        }
        
        if (biasesResponse.success) {
          setBehaviorBiases(biasesResponse.data);
        } else {
          throw new Error('获取行为偏差数据失败');
        }
        
        if (statsResponse.success) {
          setBehaviorStats(statsResponse.data);
        } else {
          throw new Error('获取用户行为统计数据失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadBehaviorData();
  }, [user]);

  // 获取主要行为偏差
  const getPrimaryBiases = () => {
    if (!behaviorBiases || behaviorBiases.length === 0) return [];
    
    // 按分数排序并返回前两名
    return [...behaviorBiases].sort((a, b) => b.score - a.score).slice(0, 2);
  };

  // 获取行为风险分数
  const getBehaviorRiskScore = () => {
    if (!behaviorStats) return 0;
    return behaviorStats.riskToleranceScore;
  };

  // 获取知识水平分数
  const getKnowledgeScore = () => {
    if (!behaviorStats) return 0;
    return behaviorStats.knowledgeScore;
  };

  return {
    behaviorRadarData,
    behaviorBiases,
    behaviorStats,
    getPrimaryBiases,
    getBehaviorRiskScore,
    getKnowledgeScore,
    loading,
    error
  };
};

export default useBehaviorData;
