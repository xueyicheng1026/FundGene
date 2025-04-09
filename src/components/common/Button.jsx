import React from 'react';
import classNames from 'classnames';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    'small': 'text-sm',
    'medium': 'text-md',
    'large': 'text-lg'
  };
  
  const buttonClasses = classNames(
    'button',
    `button-${variant}`,
    `button-${size}`,
    sizeClasses[size],
    {
      'button-full-width': fullWidth,
      'button-disabled': disabled,
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

// CSS
const styles = `
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-medium);
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: var(--transition-default);
  }

  .button-primary {
    background-color: var(--primary-color);
    color: white;
  }

  .button-primary:hover:not(.button-disabled) {
    background-color: var(--primary-dark);
  }

  .button-secondary {
    background-color: var(--neutral-100);
    color: var(--text-primary);
  }

  .button-secondary:hover:not(.button-disabled) {
    background-color: var(--neutral-200);
  }

  .button-outline {
    background-color: transparent;
    border: 1px solid var(--neutral-300);
    color: var(--text-primary);
  }

  .button-outline:hover:not(.button-disabled) {
    background-color: var(--neutral-50);
    border-color: var(--neutral-400);
  }

  .button-text {
    background-color: transparent;
    color: var(--primary-color);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .button-text:hover:not(.button-disabled) {
    background-color: rgba(37, 99, 235, 0.05);
  }

  .button-small {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .button-medium {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .button-large {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .button-full-width {
    width: 100%;
  }

  .button-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 深色模式按钮样式 */
  .dark-theme .button-secondary {
    background-color: var(--neutral-300);
    color: var(--text-primary);
  }

  .dark-theme .button-secondary:hover:not(.button-disabled) {
    background-color: var(--neutral-400);
  }

  .dark-theme .button-outline {
    border-color: var(--neutral-400);
    color: var(--text-primary);
  }

  .dark-theme .button-outline:hover:not(.button-disabled) {
    background-color: var(--neutral-300);
    border-color: var(--neutral-500);
  }

  .dark-theme .button-text {
    color: var(--primary-light);
  }

  .dark-theme .button-text:hover:not(.button-disabled) {
    background-color: rgba(59, 130, 246, 0.15);
  }

  .dark-theme .button-disabled {
    opacity: 0.5;
  }
`;

// 将样式插入到文档中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
