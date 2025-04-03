import React from 'react';
import PropTypes from 'prop-types';
import './Trading.css';

/**
 * 投资组合概览组件
 * 显示用户当前持仓和资产价值
 * @param {Object} props - 组件属性
 * @param {Object} props.portfolio - 投资组合数据
 */
const PortfolioSummary = ({ portfolio }) => {
  // 如果没有数据，显示提示信息
  if (!portfolio) {
    return <div className="empty-state">暂无投资组合数据</div>;
  }

  return (
    <div className="portfolio-summary">
      {/* 资产概览 */}
      <div className="portfolio-stats">
        <div className="stat-item">
          <span className="stat-label">总资产</span>
          <span className="stat-value">
            ¥{portfolio.totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">今日收益</span>
          <span className={`stat-value ${portfolio.todayProfit >= 0 ? 'positive' : 'negative'}`}>
            {portfolio.todayProfit >= 0 ? '+' : ''}
            ¥{portfolio.todayProfit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            <span className="stat-secondary">
              ({portfolio.todayProfitPercent >= 0 ? '+' : ''}
              {portfolio.todayProfitPercent.toFixed(2)}%)
            </span>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">持仓数量</span>
          <span className="stat-value">{portfolio.holdingsCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">可用资金</span>
          <span className="stat-value">
            ¥{portfolio.availableCash.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 持仓列表 */}
      <h3 className="subsection-title">当前持仓</h3>
      <table className="holdings-table">
        <thead>
          <tr>
            <th>基金名称</th>
            <th>持有份额</th>
            <th>最新净值</th>
            <th>持仓市值</th>
            <th>持仓收益</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.holdings.map((holding) => (
            <tr key={holding.code}>
              <td>
                <div className="fund-name">{holding.name}</div>
                <div className="fund-code">{holding.code}</div>
              </td>
              <td>{holding.shares.toFixed(2)}</td>
              <td>{holding.nav.toFixed(4)}</td>
              <td>¥{holding.marketValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
              <td className={holding.profitPercent >= 0 ? 'positive' : 'negative'}>
                {holding.profitPercent >= 0 ? '+' : ''}{holding.profitPercent.toFixed(2)}%
                <span className="profit-value">
                  ({holding.profit >= 0 ? '+' : ''}
                  ¥{holding.profit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })})
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 添加详细的PropTypes
PortfolioSummary.propTypes = {
  portfolio: PropTypes.shape({
    totalValue: PropTypes.number.isRequired,
    availableCash: PropTypes.number.isRequired,
    todayProfit: PropTypes.number.isRequired,
    todayProfitPercent: PropTypes.number.isRequired,
    holdingsCount: PropTypes.number.isRequired,
    holdings: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        shares: PropTypes.number.isRequired,
        nav: PropTypes.number.isRequired,
        marketValue: PropTypes.number.isRequired,
        profit: PropTypes.number.isRequired,
        profitPercent: PropTypes.number.isRequired,
        category: PropTypes.string
      })
    ).isRequired
  })
};

PortfolioSummary.defaultProps = {
  portfolio: null
};

export default PortfolioSummary;
