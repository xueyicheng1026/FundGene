import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import './Dashboard.css';
import { getPortfolioSummary } from '../services/tradingService';
import { getLatestNews } from '../services/newsService';
import { getLatestPolicies } from '../services/policyService';
import { getUserBehaviorAlerts } from '../services/behaviorService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

  // 资产分配图表
  const renderAssetAllocation = () => {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
      return <div className="empty-chart dark-bg-secondary dark-text-tertiary">暂无资产数据</div>;
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
      <section className="welcome-section">
        <h1 className="dark-text-heading">欢迎使用智能基金顾问</h1>
        <p className="welcome-description dark-text-description">
          这是您的投资助手，帮助您做出更理性的投资决策。探索认知诊断、行为矫正、决策支持和信息解读功能，提升您的投资能力。
        </p>
      </section>

      <div className="dashboard-grid">
        {/* 资产概览 */}
        <Card className="dashboard-card portfolio-overview-card dark-bg-card dark-shadow-sm">
          <div className="card-header">
            <h2 className="dark-text-heading">资产概览</h2>
            <Link to="/dashboard/decision/portfolio" className="view-all-link dark-text-link">查看详情</Link>
          </div>
          
          {loading ? (
            <div className="loading-indicator dark-text-tertiary">加载中...</div>
          ) : portfolio ? (
            <>
              <div className="portfolio-stats-summary">
                <div className="portfolio-stat">
                  <span className="stat-label dark-text-tertiary">总资产</span>
                  <span className="stat-value dark-text-bold">¥{portfolio.totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="portfolio-stat">
                  <span className="stat-label dark-text-tertiary">今日收益</span>
                  <span className={`stat-value ${portfolio.todayProfit >= 0 ? 'positive' : 'negative'}`}>
                    {portfolio.todayProfit >= 0 ? '+' : ''}
                    ¥{portfolio.todayProfit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="portfolio-stat">
                  <span className="stat-label dark-text-tertiary">持仓数量</span>
                  <span className="stat-value dark-text-bold">{portfolio.holdingsCount}</span>
                </div>
              </div>
              
              <h3 className="sub-section-title dark-text-secondary">资产配置</h3>
              {renderAssetAllocation()}
              
              <div className="quick-actions">
                <Link to="/dashboard/decision/rebalance" className="quick-action-button dark-bg-tertiary dark-text-primary dark-hover">再平衡建议</Link>
                <Link to="/dashboard/behavior/trading" className="quick-action-button dark-bg-tertiary dark-text-primary dark-hover">模拟交易</Link>
              </div>
            </>
          ) : (
            <div className="empty-state dark-bg-secondary dark-text-tertiary">暂无资产数据</div>
          )}
        </Card>
        
        {/* 行为提醒 */}
        <Card className="dashboard-card behavior-alerts-card dark-bg-card dark-shadow-sm">
          <div className="card-header">
            <h2 className="dark-text-heading">行为提醒</h2>
            <Link to="/dashboard/behavior/alerts" className="view-all-link dark-text-link">查看全部</Link>
          </div>
          
          {loading ? (
            <div className="loading-indicator dark-text-tertiary">加载中...</div>
          ) : alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className="alert-item dark-border">
                  <div className="alert-header">
                    <span className={`alert-priority ${alert.priority}`}></span>
                    <span className="alert-title dark-text-primary">{alert.title}</span>
                  </div>
                  <p className="alert-description dark-text-description">{alert.behavior}</p>
                  <Link to="/dashboard/behavior/alerts" className="alert-action dark-text-link">查看详情</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-alerts dark-bg-secondary dark-text-tertiary">
              <p>暂无高优先级提醒</p>
              <Link to="/dashboard/behavior/profile" className="check-profile-link dark-text-link">查看我的行为画像</Link>
            </div>
          )}
        </Card>
        
        {/* 新闻与政策 */}
        <Card className="dashboard-card news-policy-card dark-bg-card dark-shadow-sm">
          <div className="card-header">
            <h2 className="dark-text-heading">新闻与政策解读</h2>
            <div className="tab-links">
              <Link to="/dashboard/information/news" className="tab-link dark-hover dark-text-primary">新闻</Link>
              <Link to="/dashboard/information/policy" className="tab-link dark-hover dark-text-primary">政策</Link>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-indicator dark-text-tertiary">加载中...</div>
          ) : (
            <div className="info-content">
              <div>
                <h3 className="sub-section-title dark-text-secondary">热点新闻</h3>
                {news.length > 0 ? (
                  <ul className="news-list">
                    {news.map(item => (
                      <li key={item.id} className="news-item dark-border">
                        <span className="news-date dark-text-tertiary">{item.date}</span>
                        <span className="news-title dark-text-primary">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-news dark-bg-secondary dark-text-tertiary">暂无新闻数据</div>
                )}
              </div>
              
              <div>
                <h3 className="sub-section-title dark-text-secondary">最新政策</h3>
                {policies.length > 0 ? (
                  <ul className="policy-list">
                    {policies.map(item => (
                      <li key={item.id} className="policy-item dark-border">
                        <span className="policy-issuer dark-text-tertiary">{item.issuer}</span>
                        <span className="policy-title dark-text-primary">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-policies dark-bg-secondary dark-text-tertiary">暂无政策数据</div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* AI助手 */}
        <Card className="dashboard-card ai-assistant-card dark-bg-card dark-shadow-sm">
          <h2 className="dark-text-heading">AI投资助手</h2>
          <p className="ai-description dark-text-description">智能AI助手可以回答您的投资问题，提供知识解读，分析市场行情</p>
          <div className="suggested-questions">
            <h3 className="sub-section-title dark-text-secondary">您可能想问</h3>
            <div className="question-bubbles">
              <Link to="/dashboard/cognitive/chat?q=当前市场行情分析" className="question-bubble dark-bg-tertiary dark-text-secondary dark-hover">当前市场行情分析</Link>
              <Link to="/dashboard/cognitive/chat?q=如何降低投资组合风险" className="question-bubble dark-bg-tertiary dark-text-secondary dark-hover">如何降低投资组合风险</Link>
              <Link to="/dashboard/cognitive/chat?q=常见的投资者行为偏差" className="question-bubble dark-bg-tertiary dark-text-secondary dark-hover">常见的投资者行为偏差</Link>
            </div>
          </div>
          <Link to="/dashboard/cognitive/chat" className="start-chat-button">开始对话</Link>
        </Card>
      </div>

      <section className="quick-access-section">
        <h2 className="section-title dark-text-heading">快速访问</h2>
        <div className="quick-access-grid">
          <Link to="/dashboard/cognitive/simulation" className="quick-access-card dark-bg-card dark-shadow-sm">
            <div className="quick-access-icon simulation-icon">🔄</div>
            <h3 className="dark-text-heading">场景模拟</h3>
            <p className="dark-text-description">体验历史市场环境，练习决策能力</p>
          </Link>
          
          <Link to="/dashboard/behavior/profile" className="quick-access-card dark-bg-card dark-shadow-sm">
            <div className="quick-access-icon profile-icon">👤</div>
            <h3 className="dark-text-heading">行为画像</h3>
            <p className="dark-text-description">了解您的投资行为特征和认知偏差</p>
          </Link>
          
          <Link to="/dashboard/decision/rebalance" className="quick-access-card dark-bg-card dark-shadow-sm">
            <div className="quick-access-icon rebalance-icon">⚖️</div>
            <h3 className="dark-text-heading">投资组合再平衡</h3>
            <p className="dark-text-description">获取基于AI的再平衡建议</p>
          </Link>
          
          <Link to="/dashboard/information/policy" className="quick-access-card dark-bg-card dark-shadow-sm">
            <div className="quick-access-icon policy-icon">📋</div>
            <h3 className="dark-text-heading">政策解读</h3>
            <p className="dark-text-description">了解最新政策对投资的影响</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
