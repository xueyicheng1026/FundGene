import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证邮箱
    if (!email.trim()) {
      setError('请输入您的邮箱地址');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    setLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">FundGene</h1>
            <p className="auth-subtitle">基于AI的基金投资助手</p>
          </div>
          
          {success ? (
            <div className="auth-form">
              <div className="success-message">
                <h2 className="form-title">邮件已发送</h2>
                <p className="success-text">
                  重置密码的链接已发送到您的邮箱。<br />
                  请查收邮件并按照指引完成密码重置。
                </p>
                
                <div className="auth-links">
                  <Link to="/login" className="back-to-login">返回登录</Link>
                </div>
              </div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <h2 className="form-title">找回密码</h2>
              <p className="form-description">
                请输入您的邮箱地址，我们将向您发送重置密码的链接。
              </p>
              
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="email">电子邮件</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                  placeholder="请输入您的注册邮箱"
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? '提交中...' : '发送重置链接'}
              </button>
              
              <div className="auth-links">
                <p>
                  记起密码了? <Link to="/login">返回登录</Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
