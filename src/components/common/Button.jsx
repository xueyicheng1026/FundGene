import React from 'react';
import classNames from 'classnames';
import './Button.css';

/**
 * 通用按钮组件
 * 支持多种变体、尺寸和状态
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 按钮内容
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {'button'|'submit'|'reset'} props.type - 按钮类型
 * @param {'primary'|'secondary'|'outline'|'text'|'success'|'error'|'warning'|'info'} props.variant - 按钮样式变体
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.size - 按钮尺寸
 * @param {boolean} props.disabled - 是否禁用
 * @param {boolean} props.loading - 是否处于加载状态
 * @param {boolean} props.fullWidth - 是否占满容器宽度
 * @param {React.ReactNode} props.icon - 按钮图标
 * @param {'left'|'right'} props.iconPosition - 图标位置
 * @param {boolean} props.iconOnly - 是否只显示图标
 * @param {'default'|'rounded'|'square'} props.shape - 按钮形状
 * @param {string} props.className - 自定义类名
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  shape = 'default',
  className,
  ...props
}) => {
  // 处理加载状态的图标
  const loadingIcon = (
    <span className="button-loading-indicator">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
        <path 
          d="M12 2C6.47715 2 2 6.47715 2 12C2 12.6343 2.06115 13.2546 2.17849 13.8557" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
      </svg>
    </span>
  );

  const buttonClasses = classNames(
    'button',
    `button-${variant}`,
    `button-${size}`,
    {
      'button-full-width': fullWidth,
      'button-disabled': disabled || loading,
      'button-loading': loading,
      'button-icon-only': iconOnly,
      'button-rounded': shape === 'rounded',
      'button-square': shape === 'square',
      [`button-icon-${iconPosition}`]: icon && !iconOnly,
    },
    className
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick && onClick(e);
  };

  // 处理按钮内容
  const renderContent = () => {
    if (iconOnly) {
      return icon || children;
    }

    if (loading) {
      return (
        <>
          {loadingIcon}
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className="button-icon">{icon}</span>
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          <span className="button-icon">{icon}</span>
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

/**
 * 按钮组组件
 * 用于组合多个相关的按钮
 */
export const ButtonGroup = ({ 
  children, 
  className, 
  vertical = false,
  ...props 
}) => {
  const groupClasses = classNames(
    'button-group',
    {
      'button-group-vertical': vertical
    },
    className
  );

  return (
    <div className={groupClasses} {...props}>
      {children}
    </div>
  );
};

export default Button;
