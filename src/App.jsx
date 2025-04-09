import React, { useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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

  return (
    <div className="app">
      <Header toggleSidebar={toggleSidebar} />
      {user?.isAdmin && (
        <div className="admin-debug-banner">
          调试模式 - 管理员直接访问
        </div>
      )}
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
    background-color: var(--background-light);
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
    background-color: var(--background-light);
    min-height: calc(100vh - 64px);
  }

  .main-content {
    flex: 1;
    padding: 0;
    margin-left: 220px; /* 确保与侧边栏宽度精确匹配 */
    transition: margin-left 0.3s ease;
    background-color: var(--background-light);
    border-left: none; /* 确保没有左边框 */
    /* 移除任何可能的额外内边距 */
    padding-left: 0;
    /* 确保与侧边栏无缝衔接 */
    box-sizing: border-box;
    position: relative;
  }

  .main-content.sidebar-collapsed {
    margin-left: 60px; /* 确保与折叠状态的侧边栏宽度精确匹配 */
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 60px; /* 与侧边栏宽度匹配 */
      padding: 0 var(--spacing-md) var(--spacing-md);
    }
    
    .main-content.sidebar-collapsed {
      margin-left: 0; /* 侧边栏完全折叠时不预留空间 */
    }
  }

  @media (max-width: 480px) {
    .main-content {
      margin-left: 50px; /* 与超小屏幕设备侧边栏宽度匹配 */
      padding: 0 var(--spacing-sm) var(--spacing-sm);
    }
  }

  .admin-debug-banner {
    background-color: #fef3c7;
    color: #92400e;
    text-align: center;
    padding: 4px 0;
    font-size: 12px;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    z-index: 999;
  }
`;

// 将样式插入到文档中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
