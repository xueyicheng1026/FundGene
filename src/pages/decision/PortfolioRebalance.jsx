import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import PortfolioRebalance from '../../components/rebalance/PortfolioRebalance';
import { fetchRebalanceRecommendations } from '../../services/mockApi';
import './PortfolioRebalance.css';

/**
 * 投资组合再平衡页面
 * 展示当前投资组合与目标配置的对比，并提供调整建议
 */
const PortfolioRebalancePage = () => {
  const [rebalanceData, setRebalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 获取再平衡建议数据
  useEffect(() => {
    const loadRebalanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchRebalanceRecommendations();
        
        if (response.success) {
          setRebalanceData(response.data);
        } else {
          throw new Error('获取再平衡建议失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadRebalanceData();
  }, []);
  
  return (
    <div className="portfolio-rebalance-page">
      <div className="page-header">
        <h1 className="page-title">投资组合再平衡</h1>
        <p className="page-description">
          智能分析您的投资组合与目标配置的差异，提供详细的再平衡建议，帮助您优化资产配置以获得更好的风险调整后收益。
        </p>
        <div className="page-actions">
          <Link to="/decision/portfolio" className="back-link">
            返回投资组合分析
          </Link>
        </div>
      </div>
      
      <Card className="rebalance-card">
        {loading ? (
          <div className="loading">加载再平衡建议中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <PortfolioRebalance rebalanceData={rebalanceData} />
        )}
      </Card>
      
      <Card className="rebalance-help-card">
        <h2 className="card-title">什么是投资组合再平衡？</h2>
        <p className="help-text">
          投资组合再平衡是一种定期调整投资组合中不同资产类别比例的策略，旨在使投资组合回归到原定的目标资产配置。
          随着市场波动，部分资产可能表现较好而占比增加，而其他资产占比减少，导致整体风险和收益特性发生变化。
          定期再平衡可以帮助控制风险，保持投资纪律，并可能提高长期风险调整后收益。
        </p>
        <h3 className="help-subtitle">再平衡的好处</h3>
        <ul className="help-list">
          <li>控制投资组合风险水平</li>
          <li>强制执行"低买高卖"策略</li>
          <li>保持投资纪律，避免情绪化决策</li>
          <li>使投资组合始终符合您的风险承受能力和投资目标</li>
        </ul>
        <div className="learn-more-link">
          <Link to="/cognitive/learning/rebalancing">了解更多关于再平衡的知识</Link>
        </div>
      </Card>
    </div>
  );
};

export default PortfolioRebalancePage;
