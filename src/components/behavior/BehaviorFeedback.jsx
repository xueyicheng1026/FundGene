import React from 'react';
import './Behavior.css';

/**
 * 行为反馈组件
 * 提供基于用户交易行为的反馈和建议
 * @param {Object} props - 组件属性
 * @param {Object} props.feedback - 行为反馈数据
 */
const BehaviorFeedback = ({ feedback }) => {
  // 如果没有数据，显示提示信息
  if (!feedback) {
    return <div className="empty-state">暂无行为反馈数据</div>;
  }

  return (
    <div className="behavior-feedback">
      {/* 行为评分 */}
      <div className="behavior-score-section">
        <div className="score-container">
          <div className="score-circle">
            <svg viewBox="0 0 36 36">
              <path
                className="score-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="score-fill"
                strokeDasharray={`${feedback.overallScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="score-text">{feedback.overallScore}</text>
            </svg>
          </div>
          <div className="score-label">行为评分</div>
        </div>
        <div className="score-description">
          {feedback.scoreDescription}
        </div>
      </div>

      {/* 检测到的行为 */}
      <div className="detected-behaviors">
        <h3 className="subsection-title">检测到的行为</h3>
        <ul className="behavior-list">
          {feedback.detectedBehaviors.map((behavior, index) => (
            <li key={index} className={`behavior-item ${behavior.severity}`}>
              <div className="behavior-header">
                <span className="behavior-name">{behavior.name}</span>
                <span className={`behavior-severity ${behavior.severity}`}>
                  {behavior.severity === 'high' ? '严重' :
                   behavior.severity === 'medium' ? '中等' :
                   behavior.severity === 'low' ? '轻微' : behavior.severity}
                </span>
              </div>
              <p className="behavior-description">{behavior.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* 改进建议 */}
      <div className="improvement-suggestions">
        <h3 className="subsection-title">改进建议</h3>
        <ul className="suggestion-list">
          {feedback.suggestions.map((suggestion, index) => (
            <li key={index} className="suggestion-item">
              <div className="suggestion-title">{suggestion.title}</div>
              <p className="suggestion-content">{suggestion.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BehaviorFeedback;
