import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import Footer from './layout/Footer';
import { BiBarChart, BiChat, BiUser, BiLineChart, BiNews } from 'react-icons/bi';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('');

  // 根据当前路径确定活动类别
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/cognitive')) {
      setActiveCategory('cognitive');
    } else if (path.includes('/behavior')) {
      setActiveCategory('behavior');
    } else if (path.includes('/decision')) {
      setActiveCategory('decision');
    } else if (path.includes('/information')) {
      setActiveCategory('information');
    } else if (path.includes('/user')) {
      setActiveCategory('user');
    } else {
      setActiveCategory('');
    }
  }, [location]);

  const menuItems = [
    {
      category: 'cognitive',
      label: '认知诊断',
      icon: <BiChat className="sidebar-icon" />,
      path: '/cognitive/chat'
    },
    {
      category: 'behavior',
      label: '行为矫正',
      icon: <BiUser className="sidebar-icon" />,
      path: '/behavior/profile'
    },
    {
      category: 'decision',
      label: '决策支持',
      icon: <BiBarChart className="sidebar-icon" />,
      path: '/decision/portfolio'
    },
    {
      category: 'information',
      label: '信息解读',
      icon: <BiNews className="sidebar-icon" />,
      path: '/information/news'
    },
    {
      category: 'user',
      label: '用户中心',
      icon: <BiUser className="sidebar-icon" />,
      path: '/user/profile'
    }
  ];

  return (
    <div className="app-layout">
      <Sidebar activeCategory={activeCategory} menuItems={menuItems} />
      <div className="main-content">
        <Header />
        <main className="content-area">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
