import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import Card from '../../components/common/Card';
import './BehaviorCorrection.css';

/**
 * 行为矫正主页面
 * 提供行为矫正的不同功能入口，并可以在不同子功能间切换
 */
const BehaviorCorrection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(() => {
    const path = location.pathname;
    if (path.includes('/profile') || path === '/behavior') return 'profile';
    if (path.includes('/trading')) return 'trading';
    if (path.includes('/alerts')) return 'alerts';
    return 'profile'; // 默认页面
  });

  // 仅在通过Tab按钮切换时更新Active状态
  const handleTabChange = (tab) => {
    setActivePage(tab);
    switch (tab) {
      case 'profile':
        navigate('/behavior/profile');
        break;
      case 'trading':
        navigate('/behavior/trading');
        break;
      case 'alerts':
        navigate('/behavior/alerts');
        break;
      default:
        navigate('/behavior/profile');
    }
  };

  return (
    <div className="behavior-correction-page">
      <div className="page-header">
        <h1 className="page-title">行为矫正</h1>
        <p className="page-description">
          帮助您识别投资行为中的认知偏差，通过模拟交易实践和实时反馈，培养更理性的投资习惯。
        </p>
      </div>

      <div className="behavior-tabs">
        <button 
          className={`tab-button ${activePage === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          行为画像
        </button>
        <button 
          className={`tab-button ${activePage === 'trading' ? 'active' : ''}`}
          onClick={() => handleTabChange('trading')}
        >
          模拟交易
        </button>
        <button 
          className={`tab-button ${activePage === 'alerts' ? 'active' : ''}`}
          onClick={() => handleTabChange('alerts')}
        >
          行为提醒
          <span className="alerts-badge">3</span>
        </button>
      </div>

      <div className="feature-content">
        <Outlet />
      </div>

      <div className="behavior-modules-cards">
        <h2 className="section-title">行为矫正模块</h2>
        <div className="module-cards">
          <Card className="module-card">
            <div className="module-icon profile-icon">👤</div>
            <h3 className="module-title">行为画像</h3>
            <p className="module-description">
              深入分析您的投资行为特征和认知偏差，提供个性化的改进建议。
            </p>
            {/* 修改这里，移除onClick事件，使用纯链接导航，不再触发侧边栏状态更新 */}
            <Link 
              to="/behavior/profile" 
              className="module-link"
            >
              查看我的行为画像
            </Link>
          </Card>

          <Card className="module-card">
            <div className="module-icon trading-icon">📊</div>
            <h3 className="module-title">模拟交易</h3>
            <p className="module-description">
              在模拟市场环境中练习投资技能，获取实时反馈，发现并纠正非理性行为。
            </p>
            {/* 修改这里，移除onClick事件 */}
            <Link 
              to="/behavior/trading" 
              className="module-link"
            >
              开始模拟交易
            </Link>
          </Card>

          <Card className="module-card">
            <div className="module-icon alerts-icon">🔔</div>
            <h3 className="module-title">行为提醒</h3>
            <p className="module-description">
              实时监测您的投资行为，当检测到可能的非理性决策时提供警示和建议。
            </p>
            {/* 修改这里，移除onClick事件 */}
            <Link 
              to="/behavior/alerts" 
              className="module-link"
            >
              查看行为提醒
            </Link>
          </Card>
        </div>
      </div>

      <Card className="learning-resources-card">
        <h2 className="card-title">推荐学习资源</h2>
        <div className="resources-list">
          <div className="resource-item">
            <div className="resource-icon article-icon">📝</div>
            <div className="resource-content">
              <h3 className="resource-title">认识行为金融学：投资中的心理陷阱</h3>
              <p className="resource-description">
                了解常见的投资心理偏差及其对决策的影响，学习如何克服这些偏差。
              </p>
              <Link to="/cognitive/learning/behavioral-finance" className="resource-link">
                阅读文章
              </Link>
            </div>
          </div>

          <div className="resource-item">
            <div className="resource-icon video-icon">🎬</div>
            <div className="resource-content">
              <h3 className="resource-title">损失厌恶与恐慌性抛售：案例分析</h3>
              <p className="resource-description">
                通过历史案例分析损失厌恶如何导致投资者在市场低点恐慌性抛售。
              </p>
              <Link to="/cognitive/learning/loss-aversion" className="resource-link">
                观看视频
              </Link>
            </div>
          </div>

          <div className="resource-item">
            <div className="resource-icon quiz-icon">❓</div>
            <div className="resource-content">
              <h3 className="resource-title">测试：你的投资决策有多理性？</h3>
              <p className="resource-description">
                通过这个简短的测试，评估您在投资决策中的理性程度和潜在偏差。
              </p>
              <Link to="/cognitive/quiz/rational-decision" className="resource-link">
                开始测试
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BehaviorCorrection;
