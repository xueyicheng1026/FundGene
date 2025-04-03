import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  ExperimentOutlined,
  RobotOutlined,
  AreaChartOutlined,
  ReadOutlined,
  UserOutlined,
  SettingOutlined,
  RightOutlined,
  LeftOutlined,
  BellOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [hoverGroup, setHoverGroup] = useState(null);
  const [mouseInSidebar, setMouseInSidebar] = useState(false);
  const sidebarActionRef = useRef(false);
  const prevPathRef = useRef(location.pathname);
  const sidebarRef = useRef(null);

  // 检查路径是否激活
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // 鼠标进入侧边栏
  const handleMouseEnter = () => {
    setMouseInSidebar(true);
  };

  // 鼠标离开侧边栏
  const handleMouseLeave = () => {
    setMouseInSidebar(false);
    
    // 只有在不是用户操作时才清除悬停和活动状态
    if (!sidebarActionRef.current) {
      setHoverGroup(null);
      setActiveGroup(null);
    }
    sidebarActionRef.current = false;
  };

  // 鼠标进入导航组
  const handleGroupMouseEnter = (group) => {
    if (collapsed) {
      setHoverGroup(group);
    }
  };

  // 鼠标离开导航组
  const handleGroupMouseLeave = () => {
    // 不要立即清除悬停状态，给用户时间移动到子菜单
    if (!mouseInSidebar) {
      setTimeout(() => {
        setHoverGroup(null);
      }, 300);
    }
  };

  // 切换分组展开状态
  const toggleGroup = (group) => {
    sidebarActionRef.current = true;
    setActiveGroup(activeGroup === group ? null : group);
  };

  // 切换侧边栏折叠状态 - 修复重复代码和语法错误
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    // 清除状态只需要在展开时执行一次
    if (collapsed) {
      setActiveGroup(null);
      setHoverGroup(null);
    }
  };

  // 处理导航
  const handleNavigation = (path) => {
    sidebarActionRef.current = true;
    navigate(path);
    
    if (collapsed) {
      setTimeout(() => {
        setActiveGroup(null);
        setHoverGroup(null);
      }, 300);
    }
  };

  // 渲染导航组 - 确保鼠标事件正确绑定到每个组
  const renderNavGroup = (groupKey, icon, title, items, defaultPath) => {
    const isExpanded = activeGroup === groupKey || hoverGroup === groupKey;
    
    return (
      <div 
        className={`nav-group ${isExpanded ? 'expanded' : ''}`}
        onMouseEnter={() => handleGroupMouseEnter(groupKey)}
        onMouseLeave={handleGroupMouseLeave}
      >
        <div 
          className={`nav-group-header ${isActive(`/${groupKey}`) ? 'active' : ''}`}
          onClick={() => {
            toggleGroup(groupKey);
            if (collapsed) {
              handleNavigation(defaultPath);
            }
          }}
        >
          {icon}
          {!collapsed && (
            <>
              <span className="nav-text">{title}</span>
              <RightOutlined className="arrow-icon" />
            </>
          )}
        </div>
        
        {/* 子菜单，确保在悬停或展开时显示 */}
        <div className="nav-group-items">
          {items.map((item) => (
            <div 
              key={item.path}
              className={`nav-subitem ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span className="nav-text">{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={sidebarRef}
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header">
        <div className="logo-container">
          {!collapsed && <h1 className="sidebar-title">智能基金顾问</h1>}
        </div>
        <button className="collapse-button" onClick={toggleCollapsed}>
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {/* 仪表盘 */}
          <div 
            className={`nav-item ${isActive('/') && !isActive('/behavior') && !isActive('/cognitive') && !isActive('/decision') && !isActive('/information') ? 'active' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <HomeOutlined className="nav-icon" />
            {!collapsed && <span className="nav-text">仪表盘</span>}
          </div>
          
          {/* 认知诊断与教学模块 */}
          {renderNavGroup('cognitive', <ExperimentOutlined className="nav-icon" />, '认知诊断与教学', [
            { path: '/cognitive/chat', icon: <RobotOutlined className="nav-subicon" />, label: 'AI对话诊断' },
            { path: '/cognitive/learning', icon: <ReadOutlined className="nav-subicon" />, label: '学习中心' },
            { path: '/cognitive/simulation', icon: <AreaChartOutlined className="nav-subicon" />, label: '场景模拟' }
          ], '/cognitive/chat')}
          
          {/* 行为矫正模块 */}
          {renderNavGroup('behavior', <UserOutlined className="nav-icon" />, '行为矫正', [
            { path: '/behavior/profile', icon: <UserOutlined className="nav-subicon" />, label: '行为画像' },
            { path: '/behavior/trading', icon: <AreaChartOutlined className="nav-subicon" />, label: '模拟交易' },
            { path: '/behavior/feedback', icon: <BellOutlined className="nav-subicon" />, label: '行为反馈', badge: 3 }
          ], '/behavior/profile')}
          
          {/* 决策支持模块 */}
          {renderNavGroup('decision', <AreaChartOutlined className="nav-icon" />, '决策支持', [
            { path: '/decision/portfolio', icon: <AreaChartOutlined className="nav-subicon" />, label: '投资组合分析' },
            { path: '/decision/rebalance', icon: <SettingOutlined className="nav-subicon" />, label: '再平衡建议' },
            { path: '/decision/comparison', icon: <FileTextOutlined className="nav-subicon" />, label: '决策对比' }
          ], '/decision/portfolio')}
          
          {/* 信息解读模块 */}
          {renderNavGroup('information', <ReadOutlined className="nav-icon" />, '信息解读', [
            { path: '/information/news', icon: <FileTextOutlined className="nav-subicon" />, label: '新闻解读' },
            { path: '/information/policy', icon: <FileTextOutlined className="nav-subicon" />, label: '政策分析' }
          ], '/information/news')}
        </nav>
      </div>
      
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="quick-actions">
            <div 
              className="quick-action-link"
              onClick={() => handleNavigation('/user/profile')}
            >
              个人设置
            </div>
            <span className="divider">|</span>
            <div 
              className="quick-action-link"
              onClick={() => handleNavigation('/logout')}
            >
              退出登录
            </div>
          </div>
        )}
        <div className="version-info">
          {!collapsed && <span>版本 1.0.0</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;