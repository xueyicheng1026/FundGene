import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中是否有用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // 在实际应用中，这里应该调用API进行身份验证
    // 现在仅作模拟
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const register = (userData) => {
    // 在实际应用中，这里应该调用API进行注册
    // 现在仅作模拟
    const newUser = {
      ...userData,
      id: Date.now().toString(), // 模拟用户ID
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
