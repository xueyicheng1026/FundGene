import React, { useState, useEffect, useRef, useContext } from 'react';
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
  FileTextOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [hoverGroup, setHoverGroup] = useState(null);
  const [mouseInSidebar, setMouseInSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarActionRef = useRef(false);
  const sidebarRef = useRef(null);
  const { logout } = useContext(AuthContext);

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // 在移动端自动折叠
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始检查
    
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // 监听路径变化
  useEffect(() => {
    // 在移动设备上，路径变化时折叠侧边栏
    if (isMobile) {
      setCollapsed(true);
    }
    
    // 根据当前路径设置激活的导航组
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1 && pathSegments[1]) {
      const currentSection = pathSegments[1];
      if (['cognitive', 'behavior', 'decision', 'information'].includes(currentSection)) {
        setActiveGroup(currentSection);
      } else {
        setActiveGroup(null);
      }
    } else {
      setActiveGroup(null);
    }
  }, [location.pathname, isMobile]);

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
    
    if (!sidebarActionRef.current) {
      setHoverGroup(null);
      if (isMobile) {
        setActiveGroup(null);
      }
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

  // 切换侧边栏折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    
    if (collapsed) {
      setActiveGroup(null);
      setHoverGroup(null);
    }
  };

  // 处理导航
  const handleNavigation = (path) => {
    sidebarActionRef.current = true;
    navigate(path);
    
    if (isMobile) {
      setCollapsed(true);
      setTimeout(() => {
        setActiveGroup(null);
        setHoverGroup(null);
      }, 300);
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 渲染导航组
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
            if (collapsed && !isMobile) {
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
          {collapsed ? <MenuOutlined /> : <LeftOutlined />}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {/* 仪表盘 */}
          <div 
            className={`nav-item ${isActive('/dashboard') && !isActive('/dashboard/behavior') && !isActive('/dashboard/cognitive') && !isActive('/dashboard/decision') && !isActive('/dashboard/information') ? 'active' : ''}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            <HomeOutlined className="nav-icon" />
            {!collapsed && <span className="nav-text">仪表盘</span>}
          </div>
          
          {/* 认知诊断与教学模块 */}
          {renderNavGroup('cognitive', <ExperimentOutlined className="nav-icon" />, '认知诊断与教学', [
            { path: '/dashboard/cognitive/chat', icon: <RobotOutlined className="nav-subicon" />, label: 'AI对话诊断' },
            { path: '/dashboard/cognitive/learning', icon: <ReadOutlined className="nav-subicon" />, label: '学习中心' },
            { path: '/dashboard/cognitive/simulation', icon: <AreaChartOutlined className="nav-subicon" />, label: '场景模拟' }
          ], '/dashboard/cognitive/chat')}
          
          {/* 行为矫正模块 */}
          {renderNavGroup('behavior', <UserOutlined className="nav-icon" />, '行为矫正', [
            { path: '/dashboard/behavior/profile', icon: <UserOutlined className="nav-subicon" />, label: '行为画像' },
            { path: '/dashboard/behavior/trading', icon: <AreaChartOutlined className="nav-subicon" />, label: '模拟交易' },
            { path: '/dashboard/behavior/alerts', icon: <BellOutlined className="nav-subicon" />, label: '行为提醒', badge: 3 }
          ], '/dashboard/behavior/profile')}
          
          {/* 决策支持模块 */}
          {renderNavGroup('decision', <AreaChartOutlined className="nav-icon" />, '决策支持', [
            { path: '/dashboard/decision/portfolio', icon: <AreaChartOutlined className="nav-subicon" />, label: '投资组合分析' },
            { path: '/dashboard/decision/rebalance', icon: <SettingOutlined className="nav-subicon" />, label: '再平衡建议' },
            { path: '/dashboard/decision/comparison', icon: <FileTextOutlined className="nav-subicon" />, label: '决策对比' }
          ], '/dashboard/decision/portfolio')}
          
          {/* 信息解读模块 */}
          {renderNavGroup('information', <ReadOutlined className="nav-icon" />, '信息解读', [
            { path: '/dashboard/information/news', icon: <FileTextOutlined className="nav-subicon" />, label: '新闻解读' },
            { path: '/dashboard/information/policy', icon: <FileTextOutlined className="nav-subicon" />, label: '政策分析' }
          ], '/dashboard/information/news')}
        </nav>
      </div>
      
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="quick-actions">
            <div 
              className="quick-action-link"
              onClick={() => handleNavigation('/dashboard/user/profile')}
            >
              个人设置
            </div>
            <span className="divider">|</span>
            <div 
              className="quick-action-link"
              onClick={handleLogout}
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