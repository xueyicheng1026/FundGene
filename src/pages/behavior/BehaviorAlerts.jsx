import React, { useState, useEffect } from 'react';
import { getUserBehaviorAlerts } from '../../services/behaviorService';
import Card from '../../components/common/Card';
import './BehaviorAlerts.css';

/**
 * 行为反馈/提醒页面
 * 展示近期检测到的非理性行为和相应的提醒
 */
const BehaviorAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, high, medium, low

  useEffect(() => {
    const loadBehaviorAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUserBehaviorAlerts('current-user');
        
        if (response.success) {
          setAlerts(response.data);
        } else {
          throw new Error('获取行为提醒数据失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadBehaviorAlerts();
  }, []);

  // 处理标记为已读
  const handleMarkAsRead = (alertId) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  // 处理全部标记为已读
  const handleMarkAllAsRead = () => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => ({ ...alert, read: true }))
    );
  };

  // 筛选提醒
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.read;
    return alert.priority === filter;
  });
  
  if (loading) {
    return <div className="loading">加载行为提醒数据中...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="behavior-alerts-page">
      <div className="page-header">
        <h1 className="page-title">行为反馈与提醒</h1>
        <p className="page-description">
          我们会实时监测您的投资行为，当检测到可能的非理性决策时，会在这里提供反馈和建议，帮助您避免投资陷阱。
        </p>
      </div>
      
      <div className="alerts-header">
        <div className="filter-section">
          <span className="filter-label">筛选: </span>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button 
              className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              未读 
              {alerts.filter(a => !a.read).length > 0 && 
                <span className="unread-badge">{alerts.filter(a => !a.read).length}</span>
              }
            </button>
            <button 
              className={`filter-button ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              高优先级
            </button>
            <button 
              className={`filter-button ${filter === 'medium' ? 'active' : ''}`}
              onClick={() => setFilter('medium')}
            >
              中优先级
            </button>
            <button 
              className={`filter-button ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              低优先级
            </button>
          </div>
        </div>
        
        {alerts.some(alert => !alert.read) && (
          <button 
            className="read-all-button"
            onClick={handleMarkAllAsRead}
          >
            全部标为已读
          </button>
        )}
      </div>
      
      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            {filter === 'all' 
              ? '暂无行为提醒'
              : filter === 'unread'
                ? '没有未读的提醒'
                : `没有${filter === 'high' ? '高' : filter === 'medium' ? '中' : '低'}优先级的提醒`
            }
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <Card 
              key={alert.id} 
              className={`alert-card ${alert.priority} ${!alert.read ? 'unread' : ''}`}
            >
              <div className="alert-header">
                <div className="alert-meta">
                  <span className={`alert-priority ${alert.priority}`}>
                    {alert.priority === 'high' ? '高优先级' : 
                     alert.priority === 'medium' ? '中优先级' : '低优先级'}
                  </span>
                  <span className="alert-time">{alert.time}</span>
                </div>
                {!alert.read && (
                  <button 
                    className="mark-read-button"
                    onClick={() => handleMarkAsRead(alert.id)}
                  >
                    标为已读
                  </button>
                )}
              </div>
              
              <h3 className="alert-title">{alert.title}</h3>
              
              <div className="alert-content">
                <div className="detected-behavior">
                  <h4 className="behavior-title">检测到的行为</h4>
                  <p className="behavior-description">{alert.behavior}</p>
                </div>
                
                <div className="market-context">
                  <h4 className="context-title">市场背景</h4>
                  <p className="context-description">{alert.marketContext}</p>
                </div>
                
                <div className="alert-suggestion">
                  <h4 className="suggestion-title">建议</h4>
                  <p className="suggestion-description">{alert.suggestion}</p>
                </div>
              </div>
              
              <div className="alert-actions">
                <button className="action-button primary">查看详细分析</button>
                <button className="action-button secondary">查看相关知识</button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BehaviorAlerts;
