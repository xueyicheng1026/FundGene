import React from 'react';
import './Trading.css';

/**
 * 市场概览组件
 * 显示市场主要指数和热门基金行情
 * @param {Object} props - 组件属性
 * @param {Array} props.data - 市场数据
 */
const MarketOverview = ({ data }) => {
  // 如果没有数据，显示提示信息
  if (!data || data.length === 0) {
    return <div className="empty-state">暂无市场数据</div>;
  }

  // 分离指数和热门基金数据
  const indexes = data.filter(item => item.type === 'index');
  const hotFunds = data.filter(item => item.type === 'fund');

  return (
    <div className="market-overview">
      {/* 主要指数 */}
      <div className="index-section">
        <h3 className="subsection-title">主要指数</h3>
        <div className="index-cards">
          {indexes.map((index) => (
            <div 
              key={index.code} 
              className={`index-card ${index.changePercent >= 0 ? 'positive' : 'negative'}`}
            >
              <div className="index-name text-sm text-secondary">{index.name}</div>
              <div className="index-value">{index.value.toFixed(2)}</div>
              <div className="index-change text-sm">
                <span className="change-percent">
                  {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </span>
                <span className="change-value">
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 热门基金 */}
      <div className="hot-funds-section">
        <h3 className="subsection-title">热门基金</h3>
        <table className="funds-table">
          <thead>
            <tr>
              <th>基金名称</th>
              <th>代码</th>
              <th>净值</th>
              <th>日涨跌</th>
              <th>类型</th>
            </tr>
          </thead>
          <tbody>
            {hotFunds.map((fund) => (
              <tr key={fund.code}>
                <td>{fund.name}</td>
                <td>{fund.code}</td>
                <td>{fund.value.toFixed(4)}</td>
                <td className={fund.changePercent >= 0 ? 'positive' : 'negative'}>
                  {fund.changePercent >= 0 ? '+' : ''}{fund.changePercent.toFixed(2)}%
                </td>
                <td>{fund.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketOverview;
