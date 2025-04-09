import React from 'react';
import './Trading.css';
import { formatDate, formatFundCode } from '../../utils/formatters';

const TradeHistory = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return <div className="empty-state">无交易记录</div>;
  }
  
  return (
    <div className="trade-history">
      <h3 className="subsection-title">交易历史</h3>
      
      <div className="trades-table-container">
        <table className="trades-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>基金</th>
              <th>交易</th>
              <th>金额/份额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade.id}>
                <td className="text-sm">{formatDate(trade.time, 'medium')}</td>
                <td>
                  <div className="fund-name">{trade.fundName}</div>
                  <div className="fund-code text-xs text-tertiary">{formatFundCode(trade.fundCode)}</div>
                </td>
                <td>
                  <span className={`trade-action ${trade.action}`}>
                    {trade.action === 'buy' ? '买入' : '卖出'}
                  </span>
                </td>
                <td>
                  <div>¥{trade.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
                  <div className="trade-shares text-xs text-tertiary">
                    {trade.shares.toFixed(2)}份
                  </div>
                </td>
                <td>
                  <span className={`trade-status ${trade.status}`}>
                    {trade.status === 'completed' ? '已完成' : 
                     trade.status === 'pending' ? '处理中' : '失败'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;
