import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPortfolioData } from '../../services/mockApi';
import PortfolioChart from '../../components/charts/PortfolioChart';
import Card from '../../components/common/Card';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await fetchPortfolioData();
        
        if (response.success) {
          setPortfolioData(response.data);
          // 计算总金额
          const total = response.data.reduce((sum, item) => sum + item.value, 0);
          setTotalValue(total);
        } else {
          throw new Error('获取投资组合数据失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  if (loading) {
    return <div className="loading dark-text-tertiary">加载投资组合数据中...</div>;
  }

  if (error) {
    return <div className="error dark-bg-error dark-text-error">{error}</div>;
  }

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <h1 className="page-title dark-text-heading">投资组合分析</h1>
        <p className="page-description dark-text-description">
          全面分析您的资产配置，评估风险收益特征，并提供针对性的优化建议。
        </p>
      </div>

      <div className="portfolio-overview">
        <Card className="portfolio-summary-card dark-bg-card dark-shadow-sm">
          <h2 className="card-title dark-text-heading">资产概览</h2>
          <div className="portfolio-stats">
            <div className="stat-item">
              <span className="stat-label dark-text-meta">总资产</span>
              <span className="stat-value dark-text-bold">¥{totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label dark-text-meta">基金数量</span>
              <span className="stat-value dark-text-bold">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-label dark-text-meta">年化收益</span>
              <span className="stat-value positive dark-success">+8.2%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label dark-text-meta">波动率</span>
              <span className="stat-value dark-text-bold">12.5%</span>
            </div>
          </div>
        </Card>

        <Card className="portfolio-chart-card dark-bg-card dark-shadow-sm">
          <h2 className="card-title dark-text-heading">资产配置</h2>
          <div className="chart-container">
            <PortfolioChart data={portfolioData} />
          </div>
        </Card>
      </div>

      <Card className="portfolio-details-card dark-bg-card dark-shadow-sm">
        <h2 className="card-title dark-text-heading">资产明细</h2>
        <table className="portfolio-table dark-border">
          <thead>
            <tr className="dark-table-header">
              <th>基金类型</th>
              <th>金额 (元)</th>
              <th>占比 (%)</th>
              <th>风险等级</th>
              <th>年化收益率</th>
            </tr>
          </thead>
          <tbody>
            {portfolioData.map((item, index) => (
              <tr key={index} className="dark-table-row-hover">
                <td className="dark-text-primary">{item.name}</td>
                <td className="dark-text-primary">¥{item.value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                <td className="dark-text-primary">{item.percent.toFixed(1)}%</td>
                <td>
                  <span className={`risk-level risk-${getRiskLevel(item.name)}`}>
                    {getRiskLevelText(item.name)}
                  </span>
                </td>
                <td className={`${getReturnClass(item.name)} dark-success`}>
                  {getReturnRate(item.name)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="portfolio-analysis">
        <Card className="portfolio-analysis-card dark-bg-card dark-shadow-sm">
          <h2 className="card-title dark-text-heading">投资组合分析</h2>
          <div className="analysis-content dark-text-description">
            <p>您的投资组合整体表现良好，但存在以下几个优化空间：</p>
            <ul className="analysis-points">
              <li>
                <span className="analysis-highlight dark-text-bold">资产集中度较高</span> - 股票型基金占比接近50%，在市场下行时可能面临较大波动。
              </li>
              <li>
                <span className="analysis-highlight dark-text-bold">债券配置不足</span> - 债券类资产可以在市场波动时提供稳定性，建议适当增加。
              </li>
              <li>
                <span className="analysis-highlight dark-text-bold">缺乏国际市场配置</span> - 考虑增加部分海外资产以提升地域多元化。
              </li>
            </ul>
          </div>
          <div className="action-buttons">
            <Link to="/decision/rebalance" className="btn primary">
              查看再平衡建议
            </Link>
            <Link to="/cognitive/chat" className="btn secondary dark-bg-tertiary dark-text-primary dark-hover">
              咨询AI顾问
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 辅助函数 - 根据基金类型获取风险等级
function getRiskLevel(fundType) {
  switch (fundType) {
    case '股票型基金':
      return 'high';
    case '混合型基金':
      return 'medium';
    case '债券型基金':
      return 'low';
    case '货币市场基金':
      return 'verylow';
    default:
      return 'medium';
  }
}

// 辅助函数 - 获取风险等级文本
function getRiskLevelText(fundType) {
  switch (fundType) {
    case '股票型基金':
      return '高';
    case '混合型基金':
      return '中';
    case '债券型基金':
      return '低';
    case '货币市场基金':
      return '极低';
    default:
      return '中';
  }
}

// 辅助函数 - 获取收益率
function getReturnRate(fundType) {
  switch (fundType) {
    case '股票型基金':
      return '+12.4%';
    case '混合型基金':
      return '+8.5%';
    case '债券型基金':
      return '+4.2%';
    case '货币市场基金':
      return '+1.8%';
    default:
      return '+0.0%';
  }
}

// 辅助函数 - 获取收益率CSS类
function getReturnClass(fundType) {
  switch (fundType) {
    case '股票型基金':
    case '混合型基金':
    case '债券型基金':
    case '货币市场基金':
      return 'positive';
    default:
      return '';
  }
}

export default Portfolio;
