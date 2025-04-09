import React from 'react';
import './Trading.css';
import { formatNumber } from '../../utils/formatters';

const PortfolioOverview = ({ portfolio }) => {
  if (!portfolio) {
    return <div className="empty-state">无投资组合数据</div>;
  }
  
  return (
    <div className="portfolio-overview">
      <h3 className="subsection-title">投资组合概览</h3>
      
      <div className="portfolio-stats">
        <div className="stat-item">
          <span className="stat-label text-sm text-tertiary">总资产</span>
          <div className="stat-value">
            ¥{formatNumber(portfolio.totalAssets, 2)}
          </div>
        </div>
        
        <div className="stat-item">
          <span className="stat-label text-sm text-tertiary">基金资产</span>
          <div className="stat-value">
            ¥{formatNumber(portfolio.fundAssets, 2)}
            <span className="stat-secondary text-sm">
              ({(portfolio.fundAssets / portfolio.totalAssets * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="stat-item">
          <span className="stat-label text-sm text-tertiary">现金资产</span>
          <div className="stat-value">
            ¥{formatNumber(portfolio.availableCash, 2)}
            <span className="stat-secondary text-sm">
              ({(portfolio.availableCash / portfolio.totalAssets * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="stat-item">
          <span className="stat-label text-sm text-tertiary">总盈亏</span>
          <div className={`stat-value ${portfolio.totalProfit >= 0 ? 'positive' : 'negative'}`}>
            {portfolio.totalProfit >= 0 ? '+' : ''}
            ¥{formatNumber(portfolio.totalProfit, 2)}
            <span className="stat-secondary text-sm">
              ({portfolio.totalProfitPercent >= 0 ? '+' : ''}
              {(portfolio.totalProfitPercent * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      
      <h3 className="subsection-title">持仓明细</h3>
      
      {portfolio.holdings.length === 0 ? (
        <div className="empty-state">暂无持仓</div>
      ) : (
        <div className="holdings-table-container">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>基金</th>
                <th>份额</th>
                <th>最新净值</th>
                <th>持仓市值</th>
                <th>成本</th>
                <th>盈亏</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map(holding => (
                <tr key={holding.code}>
                  <td>
                    <div className="fund-name">{holding.name}</div>
                    <div className="fund-code text-xs text-tertiary">{holding.code}</div>
                  </td>
                  <td>{formatNumber(holding.shares, 2)}</td>
                  <td>{formatNumber(holding.nav, 4)}</td>
                  <td>¥{formatNumber(holding.marketValue, 2)}</td>
                  <td>¥{formatNumber(holding.cost, 2)}</td>
                  <td className={holding.profit >= 0 ? 'positive' : 'negative'}>
                    {holding.profit >= 0 ? '+' : ''}¥{formatNumber(holding.profit, 2)}
                    <span className="profit-value text-xs">
                      ({holding.profitPercent >= 0 ? '+' : ''}
                      {(holding.profitPercent * 100).toFixed(2)}%)
                    </span>
                  </td>
                  <td>{(holding.marketValue / portfolio.totalAssets * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PortfolioOverview;
