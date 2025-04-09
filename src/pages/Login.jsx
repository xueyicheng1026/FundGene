import React, { useState, useContext, useEffect } from 'react';
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
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, authError, clearAuthError, user, adminDirectLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 如果用户已登录，直接重定向到仪表盘页面
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // 监听认证错误
  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
    
    return () => {
      // 组件卸载时清除错误
      clearAuthError();
    };
  }, [authError, clearAuthError]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 输入时清除错误提示
    if (error) setError('');
  };
  
  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // 表单验证
    if (!formData.username.trim()) {
      setError('请输入用户名');
      setLoading(false);
      return;
    }
    
    if (!formData.password.trim()) {
      setError('请输入密码');
      setLoading(false);
      return;
    }
    
    try {
      const result = await login(formData, rememberMe);
      
      if (result.success) {
        // 登录成功，导航到仪表盘页面
        navigate('/dashboard');
      } else {
        // 登录失败，显示错误信息
        setError(result.message || '登录失败，请稍后再试');
      }
    } catch (err) {
      setError('登录过程中发生错误，请稍后再试');
      console.error('登录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDirectAccess = (e) => {
    e.preventDefault();
    adminDirectLogin();
    navigate('/dashboard');
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
                autoFocus
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
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={handleRememberChange}
                  disabled={loading}
                />
                <label htmlFor="rememberMe">记住登录</label>
              </div>
              <Link to="/forgot-password" className="forgot-password-link">
                忘记密码?
              </Link>
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
              <p className="admin-access">
                <a href="#" onClick={handleAdminDirectAccess} className="admin-link">
                  管理员直接访问 (调试模式)
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
