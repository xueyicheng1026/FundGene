import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // 检查本地存储中的用户信息和token
  useEffect(() => {
    try {
      // 检查本地存储中是否有用户信息和token
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const expiry = localStorage.getItem('token_expiry');
      
      if (storedUser && token) {
        // 检查token是否过期
        const isValid = expiry && new Date().getTime() < parseInt(expiry);
        
        if (isValid) {
          setUser(JSON.parse(storedUser));
        } else {
          // token已过期，清除存储
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('token_expiry');
        }
      }
    } catch (error) {
      console.error('读取本地存储失败', error);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const login = useCallback(async (credentials, remember = false) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // 在实际应用中，这里应该调用API进行身份验证
      // 模拟API调用
      if (!credentials.username || !credentials.password) {
        throw new Error('用户名和密码不能为空');
      }
      
      // 模拟验证过程
      const simulateApiCall = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (credentials.username === 'test' && credentials.password === 'test') {
              resolve({
                success: true,
                data: {
                  id: '1',
                  username: credentials.username,
                  token: 'mock-jwt-token',
                  expiresIn: 24 * 60 * 60 * 1000, // 24小时
                }
              });
            } else {
              resolve({
                success: false,
                message: '用户名或密码错误'
              });
            }
          }, 800);
        });
      };
      
      const response = await simulateApiCall();
      
      if (response.success) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
        };
        
        // 保存用户信息和token
        setUser(userData);
        
        // 如果选择了记住登录，将信息保存到本地存储
        if (remember) {
          const expiry = new Date().getTime() + response.data.expiresIn;
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('token_expiry', expiry.toString());
        }
        
        return { success: true };
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error) {
      setAuthError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // 在实际应用中，这里应该调用API进行注册
      // 模拟API调用
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('所有字段都是必填的');
      }
      
      // 模拟注册过程
      const simulateApiCall = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // 模拟用户名已存在的情况
            if (userData.username === 'admin') {
              resolve({
                success: false,
                message: '用户名已被使用'
              });
            } else {
              resolve({
                success: true,
                data: {
                  id: Date.now().toString(),
                  username: userData.username,
                  email: userData.email,
                  token: 'mock-jwt-token',
                  expiresIn: 24 * 60 * 60 * 1000, // 24小时
                }
              });
            }
          }, 800);
        });
      };
      
      const response = await simulateApiCall();
      
      if (response.success) {
        const newUser = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email
        };
        
        // 保存用户信息和token
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', response.data.token);
        
        const expiry = new Date().getTime() + response.data.expiresIn;
        localStorage.setItem('token_expiry', expiry.toString());
        
        return { success: true };
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (error) {
      setAuthError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // 清除用户状态和本地存储
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
  }, []);

  // 管理员直接登录功能
  const adminDirectLogin = useCallback(() => {
    // 创建管理员用户数据
    const adminUser = {
      id: 'admin-debug',
      username: 'admin',
      email: 'admin@example.com',
      isAdmin: true
    };
    
    // 设置用户状态
    setUser(adminUser);
    
    // 保存到本地存储，带有短期过期时间
    const expiry = new Date().getTime() + (8 * 60 * 60 * 1000); // 8小时
    localStorage.setItem('user', JSON.stringify(adminUser));
    localStorage.setItem('token', 'admin-debug-token');
    localStorage.setItem('token_expiry', expiry.toString());
    
    return { success: true };
  }, []);

  const authContextValue = {
    user,
    loading,
    authError,
    initializing,
    login,
    logout,
    register,
    clearAuthError,
    adminDirectLogin, // 导出新方法
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
