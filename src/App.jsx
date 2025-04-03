import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// 布局组件
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

const App = () => {
  const { user, loading } = useContext(AuthContext);

  // 如果正在加载，显示加载状态
  if (loading) {
    return <div className="loading-screen">加载中...</div>;
  }

  // 如果用户未登录，重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Header />
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          <Outlet />
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
    /* 顶部边距由各个页面组件内部控制，确保一致性 */
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding: 0 var(--spacing-md) var(--spacing-md);
    }
  }
`;

// 将样式插入到文档中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
