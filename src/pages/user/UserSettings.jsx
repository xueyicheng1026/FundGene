import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import Card from '../../components/common/Card';
import './User.css';

const UserSettings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    marketUpdates: false,
    weeklyReport: true,
    behaviorAlerts: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    shareData: false,
    showPortfolio: false,
    anonymousActivity: true
  });
  
  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  const handlePrivacyChange = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });
  };
  
  const handleSaveSettings = () => {
    // 模拟保存设置
    alert('设置已保存');
  };
  
  return (
    <div className="user-settings-page">
      <div className="page-header">
        <h1 className="page-title">账户设置</h1>
        <p className="page-description">
          管理您的应用偏好、通知设置和隐私选项
        </p>
      </div>
      
      <div className="settings-content">
        <Card className="settings-card">
          <h2 className="card-title">外观设置</h2>
          <div className="settings-section">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">主题</span>
                <span className="setting-description">选择应用的显示主题</span>
              </div>
              <div className="setting-control">
                <button 
                  className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => theme === 'dark' && toggleTheme()}
                >
                  浅色
                </button>
                <button 
                  className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => theme === 'light' && toggleTheme()}
                >
                  深色
                </button>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="settings-card">
          <h2 className="card-title">通知设置</h2>
          <div className="settings-section">
            {Object.keys(notificationSettings).map(setting => (
              <div className="setting-item" key={setting}>
                <div className="setting-info">
                  <span className="setting-name">
                    {setting === 'emailAlerts' && '电子邮件提醒'}
                    {setting === 'pushNotifications' && '应用内推送通知'}
                    {setting === 'marketUpdates' && '市场更新提醒'}
                    {setting === 'weeklyReport' && '每周投资报告'}
                    {setting === 'behaviorAlerts' && '行为偏差提醒'}
                  </span>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings[setting]} 
                      onChange={() => handleNotificationChange(setting)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="settings-card">
          <h2 className="card-title">隐私设置</h2>
          <div className="settings-section">
            {Object.keys(privacySettings).map(setting => (
              <div className="setting-item" key={setting}>
                <div className="setting-info">
                  <span className="setting-name">
                    {setting === 'shareData' && '分享匿名使用数据以改进服务'}
                    {setting === 'showPortfolio' && '在公共排行榜中显示我的投资组合'}
                    {setting === 'anonymousActivity' && '匿名活动统计'}
                  </span>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={privacySettings[setting]} 
                      onChange={() => handlePrivacyChange(setting)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="settings-actions">
          <button className="save-button" onClick={handleSaveSettings}>
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
