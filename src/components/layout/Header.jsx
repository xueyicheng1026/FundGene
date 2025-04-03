import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Header.css';

const Header = ({ toggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label="切换侧边栏"
          >
            {sidebarCollapsed ? '☰' : '✕'}
          </button>
          <Link to="/" className="logo-link">
            <span className="logo">FundGene</span>
          </Link>
        </div>
        
        <div className="header-right">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`切换到${theme === 'light' ? '深色' : '浅色'}模式`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {user && (
            <div className="user-menu-container">
              <div className="user-avatar" onClick={toggleUserMenu}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <span className="user-display-name">
                      {user.username || user.name || '用户'}
                    </span>
                    <span className="user-email">{user.email || ''}</span>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link to="/user/profile" className="dropdown-item">
                    个人资料
                  </Link>
                  <Link to="/user/settings" className="dropdown-item">
                    账户设置
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    退出登录
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

