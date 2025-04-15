import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Alerts.css';

// 创建消息通知上下文
const AlertsContext = createContext(null);

/**
 * 提供消息通知功能的Provider组件
 * 用于包裹应用，使所有组件都能使用通知功能
 */
export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const alertsRoot = useRef(null);

  useEffect(() => {
    // 创建弹窗容器
    const container = document.createElement('div');
    container.className = 'alerts-container';
    document.body.appendChild(container);
    alertsRoot.current = container;

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  // 添加新的消息通知
  const addAlert = (alertData) => {
    const id = Date.now().toString();
    const alert = {
      id,
      ...alertData,
      type: alertData.type || 'info',
      autoHideDuration: alertData.autoHideDuration || 5000,
    };
    
    setAlerts((prev) => [...prev, alert]);

    // 自动关闭
    if (alert.autoHideDuration > 0) {
      setTimeout(() => removeAlert(id), alert.autoHideDuration);
    }

    return id;
  };

  // 移除消息通知
  const removeAlert = (id) => {
    setAlerts((prev) => {
      const alert = prev.find(a => a.id === id);
      if (!alert) return prev;

      // 标记为正在退出，以触发动画
      return prev.map(a => a.id === id ? { ...a, exiting: true } : a);
    });

    // 动画结束后移除
    setTimeout(() => {
      setAlerts((prev) => prev.filter(a => a.id !== id));
    }, 300);
  };

  // 快捷方法
  const showInfo = (message, options = {}) => 
    addAlert({ type: 'info', message, ...options });
  
  const showSuccess = (message, options = {}) => 
    addAlert({ type: 'success', message, ...options });
  
  const showWarning = (message, options = {}) => 
    addAlert({ type: 'warning', message, ...options });
  
  const showError = (message, options = {}) => 
    addAlert({ type: 'error', message, ...options });

  const contextValue = {
    addAlert,
    removeAlert,
    showInfo,
    showSuccess,
    showWarning,
    showError,
  };

  // 渲染消息通知
  const renderAlerts = () => {
    if (!alertsRoot.current) return null;

    return createPortal(
      alerts.map((alert) => (
        <Alert 
          key={alert.id}
          {...alert}
          onClose={() => removeAlert(alert.id)}
        />
      )),
      alertsRoot.current
    );
  };

  return (
    <AlertsContext.Provider value={contextValue}>
      {children}
      {renderAlerts()}
    </AlertsContext.Provider>
  );
};

AlertsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * 使用消息通知的Hook
 * @returns {Object} 包含显示不同类型通知的方法
 */
export const useAlerts = () => {
  const context = useContext(AlertsContext);
  
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  
  return context;
};

/**
 * 消息通知组件
 * 显示不同类型的通知消息
 */
const Alert = ({
  id,
  type = 'info',
  title,
  message,
  exiting = false,
  autoHideDuration,
  onClose,
}) => {
  const [progress, setProgress] = useState(100);
  const progressInterval = useRef(null);
  
  useEffect(() => {
    // 如果设置了自动关闭，显示进度条
    if (autoHideDuration > 0) {
      const interval = 100; // 每100ms更新一次进度
      const totalSteps = autoHideDuration / interval;
      const step = 100 / totalSteps;
      
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - step;
          return newProgress > 0 ? newProgress : 0;
        });
      }, interval);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [autoHideDuration]);
  
  const alertClassNames = classNames('alert', {
    [`alert-${type}`]: true,
    'alert-exiting': exiting,
  });
  
  const getIconByType = () => {
    switch(type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16H10V14H12V16ZM12 12H10V8H12V12ZM11 0C4.9 0 0 4.9 0 11C0 17.1 4.9 22 11 22C17.1 22 22 17.1 22 11C22 4.9 17.1 0 11 0ZM11 20C6 20 2 16 2 11C2 6 6 2 11 2C16 2 20 6 20 11C20 16 16 20 11 20Z" fill="currentColor"/>
          </svg>
        );
      default: // info
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="currentColor"/>
          </svg>
        );
    }
  };
  
  return (
    <div className={alertClassNames} role="alert" style={{ position: 'relative' }}>
      <div className="alert-icon">
        {getIconByType()}
      </div>
      
      <div className="alert-content">
        {title && <h4 className="alert-title">{title}</h4>}
        {message && <p className="alert-message">{message}</p>}
      </div>
      
      <button 
        className="alert-close" 
        onClick={onClose}
        aria-label="关闭通知"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.7071 4.70711C13.0976 4.31658 13.0976 3.68342 12.7071 3.29289C12.3166 2.90237 11.6834 2.90237 11.2929 3.29289L8 6.58579L4.70711 3.29289C4.31658 2.90237 3.68342 2.90237 3.29289 3.29289C2.90237 3.68342 2.90237 4.31658 3.29289 4.70711L6.58579 8L3.29289 11.2929C2.90237 11.6834 2.90237 12.3166 3.29289 12.7071C3.68342 13.0976 4.31658 13.0976 4.70711 12.7071L8 9.41421L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L9.41421 8L12.7071 4.70711Z" fill="currentColor"/>
        </svg>
      </button>
      
      {autoHideDuration > 0 && (
        <div 
          className="alert-progress"
          style={{ 
            width: `${progress}%`,
            backgroundColor: `var(--${type}-color)`,
            opacity: 0.3
          }}
        />
      )}
    </div>
  );
};

Alert.propTypes = {
  id: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  exiting: PropTypes.bool,
  autoHideDuration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

/**
 * 直接使用的消息通知组件，用于显示静态的消息通知
 */
export const AlertMessage = ({
  type = 'info', 
  title, 
  message, 
  onClose, 
  className,
  ...props
}) => {
  const alertClassNames = classNames('alert', {
    [`alert-${type}`]: true,
  }, className);

  const getIconByType = () => {
    switch(type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16H10V14H12V16ZM12 12H10V8H12V12ZM11 0C4.9 0 0 4.9 0 11C0 17.1 4.9 22 11 22C17.1 22 22 17.1 22 11C22 4.9 17.1 0 11 0ZM11 20C6 20 2 16 2 11C2 6 6 2 11 2C16 2 20 6 20 11C20 16 16 20 11 20Z" fill="currentColor"/>
          </svg>
        );
      default: // info
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="currentColor"/>
          </svg>
        );
    }
  };

  return (
    <div className={alertClassNames} role="alert" {...props}>
      <div className="alert-icon">
        {getIconByType()}
      </div>
      
      <div className="alert-content">
        {title && <h4 className="alert-title">{title}</h4>}
        {message && <p className="alert-message">{message}</p>}
      </div>
      
      {onClose && (
        <button 
          className="alert-close" 
          onClick={onClose}
          aria-label="关闭通知"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.7071 4.70711C13.0976 4.31658 13.0976 3.68342 12.7071 3.29289C12.3166 2.90237 11.6834 2.90237 11.2929 3.29289L8 6.58579L4.70711 3.29289C4.31658 2.90237 3.68342 2.90237 3.29289 3.29289C2.90237 3.68342 2.90237 4.31658 3.29289 4.70711L6.58579 8L3.29289 11.2929C2.90237 11.6834 2.90237 12.3166 3.29289 12.7071C3.68342 13.0976 4.31658 13.0976 4.70711 12.7071L8 9.41421L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L9.41421 8L12.7071 4.70711Z" fill="currentColor"/>
          </svg>
        </button>
      )}
    </div>
  );
};

AlertMessage.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

// 导出整个组件库
export default {
  AlertsProvider,
  useAlerts,
  AlertMessage,
};