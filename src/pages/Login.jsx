import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // 简单的验证
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('用户名和密码不能为空');
      setLoading(false);
      return;
    }
    
    // 在真实应用中，这里应该调用API验证用户
    // 现在仅作模拟
    setTimeout(() => {
      const success = login(formData);
      if (success) {
        navigate('/');
      } else {
        setError('用户名或密码错误');
      }
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">FundGene</h1>
            <p className="auth-subtitle">基于AI的基金投资助手</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="form-title">登录</h2>
            
            {error && <div className="form-error">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
            
            <div className="auth-links">
              <p>
                还没有账号? <Link to="/register">立即注册</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
