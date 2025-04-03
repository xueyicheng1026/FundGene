import React from 'react';
import './Trading.css';

/**
 * 交易历史组件
 * 显示用户的历史交易记录
 * @param {Object} props - 组件属性
 * @param {Array} props.trades - 交易历史数据
 */
const TradingHistory = ({ trades }) => {
  // 如果没有数据，显示提示信息
  if (!trades || trades.length === 0) {
    return <div className="empty-state">暂无交易记录</div>;
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="trading-history">
      <table className="trades-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>操作</th>
            <th>基金名称</th>
            <th>金额/份额</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className={`trade-record ${trade.action}`}>
              <td>{formatDate(trade.timestamp)}</td>
              <td className={`trade-action ${trade.action}`}>
                {trade.action === 'buy' ? '买入' : '卖出'}
              </td>
              <td>
                <div className="fund-name">{trade.fundName}</div>
                <div className="fund-code">{trade.fundCode}</div>
              </td>
              <td>
                {trade.action === 'buy' ? (
                  <>
                    <div>¥{trade.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
                    <div className="trade-shares">{trade.shares.toFixed(2)}份</div>
                  </>
                ) : (
                  <>
                    <div>{trade.shares.toFixed(2)}份</div>
                    <div className="trade-amount">¥{trade.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
                  </>
                )}
              </td>
              <td>
                <span className={`trade-status ${trade.status}`}>
                  {trade.status === 'completed' ? '已完成' :
                   trade.status === 'pending' ? '处理中' :
                   trade.status === 'failed' ? '失败' : trade.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradingHistory;
