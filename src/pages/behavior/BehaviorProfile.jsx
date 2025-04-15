import React, { useState, useEffect } from 'react';
import { getUserBehaviorProfile } from '../../services/behaviorService';
import BehaviorRadar from '../../components/charts/BehaviorRadar';
import Card from '../../components/common/Card';
import './BehaviorProfile.css';

/**
 * 行为画像页面
 * 展示用户的投资行为特征、偏差分析和改进建议
 */
const BehaviorProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBehaviorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUserBehaviorProfile('current-user');
        
        if (response.success) {
          setProfileData(response.data);
        } else {
          throw new Error('获取行为画像数据失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadBehaviorProfile();
  }, []);
  
  if (loading) {
    return <div className="loading">加载行为画像数据中...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!profileData) {
    return <div className="empty-state">暂无行为画像数据</div>;
  }
  
  return (
    <div className="behavior-profile-page">
      <div className="page-header">
        <h1 className="page-title dark-text-heading">行为画像分析</h1>
        <p className="page-description dark-text-description">
          基于您的投资历史，我们分析了您的行为特征和可能存在的认知偏差，帮助您更好地了解自己的投资风格和提升决策质量。
        </p>
      </div>
      
      <div className="behavior-profile-overview">
        <Card className="risk-score-card dark-bg-card dark-shadow-sm">
          <h2 className="card-title">风险承受能力</h2>
          <div className="score-circle large">
            <svg viewBox="0 0 36 36">
              <path
                className="score-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="score-fill"
                strokeDasharray={`${profileData.riskScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="score-text">{profileData.riskScore}</text>
            </svg>
          </div>
          <div className="score-description">
            <p>{profileData.riskDescription}</p>
            <span className="score-label">{profileData.riskLevel}</span>
          </div>
        </Card>
        
        <Card className="trade-style-card dark-bg-card dark-shadow-sm">
          <h2 className="card-title">交易风格分析</h2>
          <div className="trade-stats">
            <div className="stat-item">
              <span className="stat-label">交易频率</span>
              <span className="stat-value">{profileData.tradeFrequency}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">持有周期</span>
              <span className="stat-value">{profileData.holdingPeriod}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">波动承受度</span>
              <span className="stat-value">{profileData.volatilityTolerance}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">分散化程度</span>
              <span className="stat-value">{profileData.diversificationLevel}</span>
            </div>
          </div>
          <p className="style-analysis">{profileData.tradeStyleAnalysis}</p>
        </Card>
      </div>
      
      <Card className="radar-chart-card">
        <h2 className="card-title">行为特征雷达图</h2>
        <div className="chart-container">
          <BehaviorRadar data={profileData.behaviorRadarData} />
        </div>
        <p className="chart-description">
          雷达图展示了您在各个行为维度上的表现，数值越接近中心表示该行为特征越弱，越接近边缘表示该特征越强。
        </p>
      </Card>
      
      <div className="bias-section">
        <h2 className="section-title">检测到的认知偏差</h2>
        <div className="bias-cards">
          {profileData.detectedBiases.map((bias, index) => (
            <Card key={index} className={`bias-card ${bias.severity}`}>
              <div className="bias-header">
                <h3 className="bias-name">{bias.name}</h3>
                <span className={`bias-severity ${bias.severity}`}>
                  {bias.severity === 'high' ? '严重' : 
                   bias.severity === 'medium' ? '中等' : '轻微'}
                </span>
              </div>
              <div className="bias-score">
                <div className="score-bar">
                  <div 
                    className="score-bar-fill" 
                    style={{ width: `${bias.score}%` }}
                  ></div>
                </div>
                <span className="score-value">{bias.score}</span>
              </div>
              <p className="bias-description">{bias.description}</p>
              <div className="bias-suggestions">
                <h4 className="suggestions-title">改进建议</h4>
                <ul className="suggestions-list">
                  {bias.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <Card className="knowledge-evaluation-card">
        <h2 className="card-title">投资知识评估</h2>
        <div className="knowledge-score">
          <div className="score-circle">
            <svg viewBox="0 0 36 36">
              <path
                className="score-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="score-fill knowledge"
                strokeDasharray={`${profileData.knowledgeScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="score-text">{profileData.knowledgeScore}</text>
            </svg>
          </div>
          <div className="knowledge-description">
            <p>{profileData.knowledgeDescription}</p>
            <div className="knowledge-areas">
              <h4>知识强项</h4>
              <div className="knowledge-tags">
                {profileData.strengths.map((item, index) => (
                  <span key={index} className="knowledge-tag strength">{item}</span>
                ))}
              </div>
              <h4>需要提升的领域</h4>
              <div className="knowledge-tags">
                {profileData.weaknesses.map((item, index) => (
                  <span key={index} className="knowledge-tag weakness">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="action-plan-card">
        <h2 className="card-title">行为改进计划</h2>
        <div className="action-items">
          {profileData.actionPlan.map((action, index) => (
            <div key={index} className="action-item">
              <div className="action-header">
                <h3 className="action-title">{action.title}</h3>
                <span className="action-priority">{action.priority}</span>
              </div>
              <p className="action-description">{action.description}</p>
              <div className="action-steps">
                <h4 className="steps-title">具体步骤</h4>
                <ol className="steps-list">
                  {action.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default BehaviorProfile;
