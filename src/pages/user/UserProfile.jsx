import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import './User.css';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        // 模拟 API 调用获取用户资料
        setTimeout(() => {
          setProfile({
            username: user?.username || '默认用户',
            email: user?.email || 'user@example.com',
            avatar: null,
            joinDate: '2023-01-15',
            lastLogin: new Date().toISOString(),
            phone: '138****1234',
            nickname: '投资达人',
            riskPreference: '中等风险',
            investmentGoal: '长期稳健增长',
            experienceLevel: '中级'
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('加载用户资料失败:', error);
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [user]);
  
  if (loading) {
    return <div className="loading">加载用户资料中...</div>;
  }
  
  return (
    <div className="user-profile-page">
      <div className="page-header">
        <h1 className="page-title">个人资料</h1>
        <p className="page-description">
          查看和管理您的个人资料信息
        </p>
      </div>
      
      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-header">
            <div className="avatar-container">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="用户头像" className="user-avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h2 className="username">{profile?.username}</h2>
              <p className="user-subtitle">{profile?.nickname}</p>
              <p className="user-join-date">注册时间: {new Date(profile?.joinDate).toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="profile-section">
              <h3 className="section-title">基本信息</h3>
              <div className="detail-item">
                <span className="detail-label">用户名</span>
                <span className="detail-value">{profile?.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">昵称</span>
                <span className="detail-value">{profile?.nickname}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">电子邮箱</span>
                <span className="detail-value">{profile?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">手机号码</span>
                <span className="detail-value">{profile?.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">上次登录</span>
                <span className="detail-value">{new Date(profile?.lastLogin).toLocaleString('zh-CN')}</span>
              </div>
            </div>
            
            <div className="profile-section">
              <h3 className="section-title">投资偏好</h3>
              <div className="detail-item">
                <span className="detail-label">风险承受能力</span>
                <span className="detail-value">{profile?.riskPreference}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">投资目标</span>
                <span className="detail-value">{profile?.investmentGoal}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">投资经验</span>
                <span className="detail-value">{profile?.experienceLevel}</span>
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="action-button primary">编辑资料</button>
            <button className="action-button secondary">修改密码</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
