import React, { useState } from 'react';
import Card from '../../components/common/Card';
import './ScenarioSimulation.css';

/**
 * 场景模拟页面
 * 模拟历史场景，让用户在历史环境中做投资决策，从中学习
 */
const ScenarioSimulation = () => {
  const [scenarios, setScenarios] = useState([
    {
      id: 'scenario-2015-crash',
      title: '2015年股灾模拟',
      description: '体验2015年中国股市大跌的环境，学习如何在市场恐慌时做出理性决策。',
      difficulty: '中等',
      duration: '约30分钟',
      completed: false,
      tags: ['危机处理', '情绪控制', '损失厌恶']
    },
    {
      id: 'scenario-2008-financial-crisis',
      title: '2008年金融危机',
      description: '回到2008年全球金融危机，在市场动荡中寻找投资机会和风险控制方法。',
      difficulty: '高级',
      duration: '约45分钟',
      completed: false,
      tags: ['危机投资', '资产配置', '长期视角']
    },
    {
      id: 'scenario-2020-covid',
      title: '2020年疫情冲击',
      description: '经历2020年疫情对市场的冲击，学习如何应对突发事件带来的市场波动。',
      difficulty: '中等',
      duration: '约40分钟',
      completed: false,
      tags: ['黑天鹅事件', '风险管理', '逆向投资']
    },
    {
      id: 'scenario-bull-market',
      title: '牛市追涨杀跌',
      description: '在上涨趋势中练习控制追涨心理，避免在高位买入和恐慌性抛售。',
      difficulty: '初级',
      duration: '约25分钟',
      completed: true,
      tags: ['追涨心理', '获利回吐', '趋势识别']
    }
  ]);
  
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSelectScenario = (scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    setSelectedScenario(scenario);
  };
  
  const handleStartScenario = () => {
    setLoading(true);
    // 模拟加载场景
    setTimeout(() => {
      setLoading(false);
      // 这里应该跳转到具体的场景模拟页面
      alert(`开始模拟场景: ${selectedScenario.title}`);
    }, 1500);
  };
  
  const handleCloseScenario = () => {
    setSelectedScenario(null);
  };
  
  return (
    <div className="scenario-simulation-page">
      <div className="page-header">
        <h1 className="page-title dark-text-heading">场景模拟</h1>
        <p className="page-description dark-text-description">
          通过历史市场场景模拟，让您身临其境地体验各种市场环境，在实践中学习如何应对不同的市场状况和克服投资心理偏差。
        </p>
      </div>
      
      {selectedScenario ? (
        <Card className="scenario-detail-card dark-bg-card dark-shadow-sm">
          <button 
            className="back-button dark-text-link"
            onClick={handleCloseScenario}
          >
            返回场景列表
          </button>
          
          <div className="scenario-detail-header">
            <h2 className="scenario-title dark-text-heading">{selectedScenario.title}</h2>
            <div className="scenario-meta">
              <span className="scenario-difficulty dark-text-meta">{selectedScenario.difficulty}</span>
              <span className="scenario-duration dark-text-meta">{selectedScenario.duration}</span>
            </div>
          </div>
          
          <p className="scenario-description dark-text-description">{selectedScenario.description}</p>
          
          <div className="scenario-tags">
            {selectedScenario.tags.map(tag => (
              <span key={tag} className="scenario-tag dark-bg-tertiary dark-text-secondary">{tag}</span>
            ))}
          </div>
          
          <div className="scenario-details">
            <h3 className="section-title dark-text-heading">场景背景</h3>
            <p className="scenario-background dark-text-description">
              {selectedScenario.id === 'scenario-2015-crash' ? 
                '2015年中国股市经历了罕见的大幅波动。6月股指达到高点后，仅用不到一个月时间，上证指数从5178点最低跌至3373点，跌幅超过30%。本场景将让您体验当时的市场环境，在信息不完全的情况下做出投资决策。' : 
              selectedScenario.id === 'scenario-2008-financial-crisis' ?
                '2008年全球金融危机是自大萧条以来最严重的金融危机。危机源于美国次贷市场，迅速蔓延至全球。本场景将模拟这段时期的市场环境，让您在极度恐慌的氛围中权衡风险与机会。' :
              selectedScenario.id === 'scenario-2020-covid' ?
                '2020年初，新冠疫情爆发对全球市场造成剧烈冲击。3月中旬，主要股指在短期内暴跌30%以上，随后在政策刺激下出现反弹。本场景将让您经历这一突发事件的全过程，练习在危机中的决策能力。' :
                '在持续上涨的市场中，投资者容易陷入追涨杀跌的情绪陷阱。本场景将模拟一个典型的牛市周期，帮助您识别自己的追涨心理，并学习如何控制这种冲动。'
              }
            </p>
            
            <h3 className="section-title">学习目标</h3>
            <ul className="learning-objectives">
              <li>体验极端市场环境下的心理压力</li>
              <li>识别并控制恐慌情绪和从众心理</li>
              <li>学习在市场波动中保持理性决策的方法</li>
              <li>掌握危机中的资产配置和风险管理策略</li>
            </ul>
            
            <h3 className="section-title">场景流程</h3>
            <ol className="scenario-steps">
              <li>介绍场景背景和初始市场状况</li>
              <li>提供初始资金和投资组合</li>
              <li>按时间顺序展示市场变化和新闻事件</li>
              <li>在关键时点做出投资决策</li>
              <li>场景结束后分析决策结果和行为特征</li>
              <li>提供针对性的改进建议</li>
            </ol>
          </div>
          
          <div className="scenario-actions">
            <button 
              className="start-button"
              onClick={handleStartScenario}
              disabled={loading}
            >
              {loading ? '准备中...' : '开始模拟'}
            </button>
          </div>
        </Card>
      ) : (
        <div className="scenarios-grid">
          {scenarios.map(scenario => (
            <Card 
              key={scenario.id}
              className={`scenario-card ${scenario.completed ? 'completed' : ''} dark-bg-card dark-shadow-sm`}
              onClick={() => handleSelectScenario(scenario.id)}
            >
              {scenario.completed && (
                <div className="completion-badge">已完成</div>
              )}
              <h2 className="scenario-title dark-text-heading">{scenario.title}</h2>
              <p className="scenario-description dark-text-description">{scenario.description}</p>
              <div className="scenario-footer">
                <div className="scenario-meta">
                  <span className="scenario-difficulty dark-text-meta">{scenario.difficulty}</span>
                  <span className="scenario-duration dark-text-meta">{scenario.duration}</span>
                </div>
                <div className="scenario-tags">
                  {scenario.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="scenario-tag dark-bg-tertiary dark-text-secondary">{tag}</span>
                  ))}
                  {scenario.tags.length > 2 && (
                    <span className="scenario-tag more">+{scenario.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulation;
