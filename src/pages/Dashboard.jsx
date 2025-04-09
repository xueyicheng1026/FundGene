import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import './Dashboard.css';
import { getPortfolioSummary } from '../services/tradingService';
import { getLatestNews } from '../services/newsService';
import { getLatestPolicies } from '../services/policyService';
import { getUserBehaviorAlerts } from '../services/behaviorService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [news, setNews] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 并行获取所有数据
        const [portfolioRes, newsRes, policiesRes, alertsRes] = await Promise.all([
          getPortfolioSummary('current-user'),
          getLatestNews(3),
          getLatestPolicies(2),
          getUserBehaviorAlerts('current-user')
        ]);
        
        if (portfolioRes.success) setPortfolio(portfolioRes.data);
        if (newsRes.success) setNews(newsRes.data);
        if (policiesRes.success) setPolicies(policiesRes.data);
        if (alertsRes.success) {
          // 筛选未读的高优先级提醒
          const unreadHighPriority = alertsRes.data
            .filter(alert => !alert.read && alert.priority === 'high')
            .slice(0, 2);
          setAlerts(unreadHighPriority);
        }
      } catch (error) {
        console.error('加载仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // 简化的资产分配图表
  const renderAssetAllocation = () => {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
      return <div className="empty-chart">暂无资产数据</div>;
    }

    // 按类别合并数据
    const categoryMap = {};
    portfolio.holdings.forEach(holding => {
      const category = holding.category || '其他';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += holding.marketValue;
    });

    // 转换为图表数据
    const chartData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    return (
      <div className="asset-allocation-chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h1>欢迎使用智能基金顾问</h1>
        <p className="welcome-description">
          这是您的投资助手，帮助您做出更理性的投资决策。探索认知诊断、行为矫正、决策支持和信息解读功能，提升您的投资能力。
        </p>
      </div>

      <div className="dashboard-grid">
        {/* 资产概览 */}
        <Card className="portfolio-overview-card">
          <div className="card-header">
            <h2>资产概览</h2>
            <Link to="/dashboard/decision/portfolio" className="view-all-link">查看详情</Link>
          </div>
          
          {loading ? (
            <div className="loading-indicator">加载中...</div>
          ) : portfolio ? (
            <>
              <div className="portfolio-stats-summary">
                <div className="portfolio-stat">
                  <span className="stat-label">总资产</span>
                  <span className="stat-value">¥{portfolio.totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="portfolio-stat">
                  <span className="stat-label">今日收益</span>
                  <span className={`stat-value ${portfolio.todayProfit >= 0 ? 'positive' : 'negative'}`}>
                    {portfolio.todayProfit >= 0 ? '+' : ''}
                    ¥{portfolio.todayProfit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="portfolio-stat">
                  <span className="stat-label">持仓数量</span>
                  <span className="stat-value">{portfolio.holdingsCount}</span>
                </div>
              </div>
              
              <h3 className="sub-section-title">资产配置</h3>
              {renderAssetAllocation()}
              
              <div className="quick-actions">
                <Link to="/dashboard/decision/rebalance" className="quick-action-button">再平衡建议</Link>
                <Link to="/dashboard/behavior/trading" className="quick-action-button">模拟交易</Link>
              </div>
            </>
          ) : (
            <div className="empty-state">暂无资产数据</div>
          )}
        </Card>
        
        {/* 行为提醒 */}
        <Card className="behavior-alerts-card">
          <div className="card-header">
            <h2>行为提醒</h2>
            <Link to="/dashboard/behavior/alerts" className="view-all-link">查看全部</Link>
          </div>
          
          {loading ? (
            <div className="loading-indicator">加载中...</div>
          ) : alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-header">
                    <span className={`alert-priority ${alert.priority}`}></span>
                    <span className="alert-title">{alert.title}</span>
                  </div>
                  <p className="alert-description">{alert.behavior}</p>
                  <Link to="/dashboard/behavior/alerts" className="alert-action">查看详情</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-alerts">
              <p>暂无高优先级提醒</p>
              <Link to="/dashboard/behavior/profile" className="check-profile-link">查看我的行为画像</Link>
            </div>
          )}
        </Card>
        
        {/* 新闻与政策 */}
        <Card className="news-policy-card">
          <div className="card-header">
            <h2>新闻与政策解读</h2>
            <div className="tab-links">
              <Link to="/dashboard/information/news" className="tab-link">新闻</Link>
              <Link to="/dashboard/information/policy" className="tab-link">政策</Link>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-indicator">加载中...</div>
          ) : (
            <div className="info-content">
              <div className="latest-news">
                <h3 className="sub-section-title">热点新闻</h3>
                {news.length > 0 ? (
                  <ul className="news-list">
                    {news.map(item => (
                      <li key={item.id} className="news-item">
                        <span className="news-date">{item.date}</span>
                        <span className="news-title">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-news">暂无新闻数据</p>
                )}
              </div>
              
              <div className="latest-policies">
                <h3 className="sub-section-title">最新政策</h3>
                {policies.length > 0 ? (
                  <ul className="policy-list">
                    {policies.map(item => (
                      <li key={item.id} className="policy-item">
                        <span className="policy-issuer">{item.issuer}</span>
                        <span className="policy-title">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-policies">暂无政策数据</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* AI助手 */}
        <Card className="ai-assistant-card">
          <h2>AI投资助手</h2>
          <p className="ai-description text-description">智能AI助手可以回答您的投资问题，提供知识解读，分析市场行情</p>
          <div className="suggested-questions">
            <h3 className="sub-section-title">您可能想问</h3>
            <div className="question-bubbles">
              <Link to="/dashboard/cognitive/chat?q=当前市场行情分析" className="question-bubble">当前市场行情分析</Link>
              <Link to="/dashboard/cognitive/chat?q=如何降低投资组合风险" className="question-bubble">如何降低投资组合风险</Link>
              <Link to="/dashboard/cognitive/chat?q=常见的投资者行为偏差" className="question-bubble">常见的投资者行为偏差</Link>
            </div>
          </div>
          <Link to="/dashboard/cognitive/chat" className="start-chat-button">开始对话</Link>
        </Card>
      </div>

      <div className="quick-access-section">
        <h2 className="section-title">快速访问</h2>
        <div className="quick-access-grid">
          <Link to="/dashboard/cognitive/simulation" className="quick-access-card">
            <div className="quick-access-icon simulation-icon">🔄</div>
            <h3>场景模拟</h3>
            <p>体验历史市场环境，练习决策能力</p>
          </Link>
          
          <Link to="/dashboard/user/profile" className="quick-access-card">
            <div className="quick-access-icon profile-icon">👤</div>
            <h3>行为画像</h3>
            <p>了解您的投资行为特征和认知偏差</p>
          </Link>
          
          <Link to="/dashboard/decision/rebalance" className="quick-access-card">
            <div className="quick-access-icon rebalance-icon">⚖️</div>
            <h3>投资组合再平衡</h3>
            <p>获取基于AI的再平衡建议</p>
          </Link>
          
          <Link to="/dashboard/information/policy" className="quick-access-card">
            <div className="quick-access-icon policy-icon">📋</div>
            <h3>政策解读</h3>
            <p>了解最新政策对投资的影响</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
