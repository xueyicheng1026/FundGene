import React, { useContext, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// 布局组件
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

const App = () => {
  const { user, loading, initializing } = useContext(AuthContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 如果正在初始化，显示应用加载状态
  if (initializing) {
    return <div className="loading-screen">应用加载中...</div>;
  }

  // 如果用户未登录，重定向到登录页，并记住当前路径
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="app">
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-layout">
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {loading ? (
            <div className="content-loading">页面加载中...</div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;

// CSS
const styles = `
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-size: var(--font-size-xl);
    color: var(--primary-color);
    background-color: var(--bg-color);
  }

  .content-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
  }

  .main-layout {
    margin-top: 64px;
    flex: 1;
    display: flex;
  }

  .main-content {
    flex: 1;
    padding: 0 var(--spacing-lg) var(--spacing-lg);
    margin-left: 260px;
    transition: margin-left 0.3s ease;
    /* 顶部边距由各个页面组件内部控制，确保一致性 */
  }

  .main-content.sidebar-collapsed {
    margin-left: 80px;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding: 0 var(--spacing-md) var(--spacing-md);
    }
    
    .main-content.sidebar-collapsed {
      margin-left: 0;
    }
  }
`;

// 将样式插入到文档中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
