import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
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
            <div className="user-menu">
              <span className="user-name">{user.username || user.name || '用户'}</span>
              <button className="logout-button" onClick={logout}>
                退出
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

