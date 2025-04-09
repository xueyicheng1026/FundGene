import React from 'react';
import PropTypes from 'prop-types';
import AllocationComparisonChart from './AllocationComparisonChart';
import './Rebalance.css';

/**
 * 投资组合再平衡组件
 * 显示投资组合的当前配置与目标配置的对比，以及调整建议
 * @param {Object} props - 组件属性
 * @param {Object} props.rebalanceData - 再平衡数据
 */
const PortfolioRebalance = ({ rebalanceData }) => {
  // 如果没有数据，显示提示信息
  if (!rebalanceData) {
    return <div className="empty-state">暂无再平衡数据</div>;
  }

  return (
    <div className="portfolio-rebalance">
      {/* 再平衡理由 */}
      <div className="rebalance-rationale">
        <h3 className="subsection-title">再平衡原因</h3>
        <p className="rationale-text">{rebalanceData.rationale}</p>
      </div>

      {/* 资产配置对比 */}
      <div className="allocation-comparison-section">
        <h3 className="subsection-title">当前配置 vs 目标配置</h3>
        <div className="chart-container">
          <AllocationComparisonChart data={rebalanceData.currentAllocation} />
        </div>
        
        <div className="allocation-table-container">
          <table className="allocation-table">
            <thead>
              <tr>
                <th>资产类别</th>
                <th>当前配置 (%)</th>
                <th>目标配置 (%)</th>
                <th>差异 (%)</th>
                <th>调整方向</th>
              </tr>
            </thead>
            <tbody>
              {rebalanceData.currentAllocation.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.current.toFixed(1)}</td>
                  <td>{item.target.toFixed(1)}</td>
                  <td className={Math.abs(item.current - item.target) > 5 ? 'significant-diff' : ''}>
                    {(item.current - item.target).toFixed(1)}
                  </td>
                  <td>
                    <span className={`action-direction ${item.action}`}>
                      {item.action === 'increase' ? '增加' : 
                       item.action === 'reduce' ? '减少' : '维持'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 具体调整建议 */}
      <div className="specific-recommendations-section">
        <h3 className="subsection-title">具体调整建议</h3>
        <div className="recommendations-list">
          {rebalanceData.specificRecommendations.map((recommendation, index) => (
            <div key={index} className={`recommendation-card ${recommendation.action}`}>
              <div className="recommendation-header">
                <div>
                  <span className="fund-name">{recommendation.fund}</span>
                  <span className="fund-code">{recommendation.code}</span>
                </div>
                <div className={`action-badge ${recommendation.action}`}>
                  {recommendation.action === 'increase' ? '买入' : 
                   recommendation.action === 'reduce' ? '卖出' : '持有'}
                </div>
              </div>
              
              <div className="recommendation-values">
                <div className="value-item">
                  <span className="value-label">当前市值</span>
                  <span className="value-number">
                    ¥{recommendation.currentValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="value-arrow">→</div>
                <div className="value-item">
                  <span className="value-label">目标市值</span>
                  <span className="value-number">
                    ¥{recommendation.targetValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className="recommendation-amount">
                <span className="amount-label">
                  {recommendation.action === 'increase' ? '买入金额' : 
                   recommendation.action === 'reduce' ? '卖出金额' : ''}
                </span>
                <span className="amount-value">
                  {recommendation.action !== 'maintain' && 
                   `¥${recommendation.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              
              <div className="recommendation-reason">
                <span className="reason-label">原因：</span>
                <span className="reason-text">{recommendation.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 预期影响 */}
      <div className="expected-impact-section">
        <h3 className="subsection-title">调整后预期效果</h3>
        <div className="impact-cards">
          <div className="impact-card">
            <div className="impact-icon risk-icon">🛡️</div>
            <div className="impact-content">
              <h4 className="impact-title">风险影响</h4>
              <p className="impact-text">{rebalanceData.expectedImpact.risk}</p>
            </div>
          </div>
          <div className="impact-card">
            <div className="impact-icon return-icon">📈</div>
            <div className="impact-content">
              <h4 className="impact-title">收益影响</h4>
              <p className="impact-text">{rebalanceData.expectedImpact.return}</p>
            </div>
          </div>
          <div className="impact-card">
            <div className="impact-icon balance-icon">⚖️</div>
            <div className="impact-content">
              <h4 className="impact-title">风险调整后收益</h4>
              <p className="impact-text">{rebalanceData.expectedImpact.sharpeRatio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="rebalance-actions">
        <button className="action-button primary">应用再平衡建议</button>
        <button className="action-button secondary">导出再平衡方案</button>
      </div>
    </div>
  );
};

// 添加PropTypes验证
PortfolioRebalance.propTypes = {
  rebalanceData: PropTypes.shape({
    rationale: PropTypes.string.isRequired,
    currentAllocation: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        current: PropTypes.number.isRequired,
        target: PropTypes.number.isRequired,
        action: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired
      })
    ).isRequired,
    specificRecommendations: PropTypes.arrayOf(
      PropTypes.shape({
        fund: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        currentValue: PropTypes.number.isRequired,
        targetValue: PropTypes.number.isRequired,
        action: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        reason: PropTypes.string.isRequired
      })
    ).isRequired,
    expectedImpact: PropTypes.shape({
      risk: PropTypes.string.isRequired,
      return: PropTypes.string.isRequired,
      sharpeRatio: PropTypes.string.isRequired
    }).isRequired
  })
};

export default PortfolioRebalance;
