import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const { register, authError, clearAuthError, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 如果用户已登录，直接重定向到首页
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // 监听认证错误
  useEffect(() => {
    if (authError) {
      setFormErrors({ submit: authError });
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
    
    // 如果表单已经提交过，实时验证
    if (submitAttempted) {
      validateField(name, value);
    }
  };
  
  const validateField = (name, value) => {
    let errors = { ...formErrors };
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          errors.username = '请输入用户名';
        } else if (value.length < 3) {
          errors.username = '用户名至少需要3个字符';
        } else {
          delete errors.username;
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = '请输入电子邮件';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = '请输入有效的电子邮件地址';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value.trim()) {
          errors.password = '请输入密码';
        } else if (value.length < 6) {
          errors.password = '密码至少需要6个字符';
        } else {
          delete errors.password;
        }
        // 验证确认密码
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = '两次输入的密码不一致';
        } else if (formData.confirmPassword) {
          delete errors.confirmPassword;
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          errors.confirmPassword = '请确认密码';
        } else if (value !== formData.password) {
          errors.confirmPassword = '两次输入的密码不一致';
        } else {
          delete errors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateForm = () => {
    const fields = ['username', 'email', 'password', 'confirmPassword'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // 验证表单
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        // 注册成功，导航到首页
        navigate('/');
      } else {
        // 注册失败，显示错误信息
        setFormErrors({ submit: result.message || '注册失败，请稍后再试' });
      }
    } catch (err) {
      setFormErrors({ submit: '注册过程中发生错误，请稍后再试' });
      console.error('注册错误:', err);
    } finally {
      setLoading(false);
    }
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
            <h2 className="form-title">注册</h2>
            
            {formErrors.submit && <div className="form-error">{formErrors.submit}</div>}
            
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
                className={formErrors.username ? 'input-error' : ''}
              />
              {formErrors.username && <div className="field-error">{formErrors.username}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">电子邮件</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                className={formErrors.email ? 'input-error' : ''}
              />
              {formErrors.email && <div className="field-error">{formErrors.email}</div>}
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
                autoComplete="new-password"
                className={formErrors.password ? 'input-error' : ''}
              />
              {formErrors.password && <div className="field-error">{formErrors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                className={formErrors.confirmPassword ? 'input-error' : ''}
              />
              {formErrors.confirmPassword && <div className="field-error">{formErrors.confirmPassword}</div>}
            </div>
            
            <div className="form-terms">
              <p>注册即表示您同意我们的 <Link to="/terms">服务条款</Link> 和 <Link to="/privacy">隐私政策</Link></p>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册'}
            </button>
            
            <div className="auth-links">
              <p>
                已有账号? <Link to="/login">立即登录</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
