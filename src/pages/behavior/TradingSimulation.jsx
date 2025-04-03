import React, { useState, useEffect } from 'react';
import { 
  getMarketOverview, 
  getPortfolioSummary, 
  executeTradeOrder,
  getTradeHistory,
  getBehaviorFeedback
} from '../../services/tradingService';
import MarketOverview from '../../components/trading/MarketOverview';
import PortfolioSummary from '../../components/trading/PortfolioSummary';
import TradeForm from '../../components/trading/TradeForm';
import TradingHistory from '../../components/trading/TradingHistory';
import BehaviorFeedback from '../../components/behavior/BehaviorFeedback';
import Card from '../../components/common/Card';
import './TradingSimulation.css';

/**
 * 模拟交易页面组件
 * 提供模拟市场环境，使用户能够实践投资行为
 * 并获得实时行为反馈
 */
const TradingSimulation = () => {
  const [marketData, setMarketData] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [behaviorFeedback, setBehaviorFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [marketResponse, portfolioResponse, historyResponse, feedbackResponse] = await Promise.all([
          getMarketOverview(),
          getPortfolioSummary('current-user'),
          getTradeHistory({ userId: 'current-user', page: 1, pageSize: 10 }),
          getBehaviorFeedback()
        ]);

        if (marketResponse.success) setMarketData(marketResponse.data);
        if (portfolioResponse.success) setPortfolio(portfolioResponse.data);
        if (historyResponse.success) setTradeHistory(historyResponse.data);
        if (feedbackResponse.success) setBehaviorFeedback(feedbackResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTradeSubmit = async (order) => {
    try {
      const result = await executeTradeOrder(order);
      if (result.success) {
        setPortfolio(result.data.updatedPortfolio);
        setBehaviorFeedback(result.data.behaviorFeedback);
        setTradeHistory((prev) => [result.data.newTrade, ...prev]);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  if (loading) {
    return <div className="loading">加载数据中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="trading-simulation-page">
      <div className="page-header">
        <h1 className="page-title">模拟交易</h1>
        <p className="page-description">
          通过模拟交易实践投资行为，分析市场数据，优化投资决策，并获得行为反馈。
        </p>
      </div>

      <div className="trading-simulation-layout">
        <div className="portfolio-trade-grid">
          <Card className="market-overview-card">
            <h2 className="section-title">市场概览</h2>
            <MarketOverview data={marketData} />
          </Card>

          <Card className="portfolio-card">
            <h2 className="section-title">投资组合</h2>
            <PortfolioSummary portfolio={portfolio} />
          </Card>
        </div>

        <Card className="trade-card">
          <h2 className="section-title">交易操作</h2>
          <TradeForm 
            marketData={marketData} 
            portfolio={portfolio} 
            onSubmit={handleTradeSubmit} 
          />
        </Card>

        <Card className="trade-history-card">
          <h2 className="section-title">交易历史</h2>
          <TradingHistory trades={tradeHistory} />
        </Card>

        <Card className="behavior-feedback-card">
          <h2 className="section-title">行为反馈</h2>
          <BehaviorFeedback feedback={behaviorFeedback} />
        </Card>
      </div>
    </div>
  );
};

export default TradingSimulation;