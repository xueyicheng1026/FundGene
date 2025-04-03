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
  const buttonClasses = classNames(
    'button',
    `button-${variant}`,
    `button-${size}`,
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
    font-weight: 500;
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: var(--transition-default);
    padding: 0.5rem 1rem;
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
    padding: 0.25rem 0.5rem;
  }

  .button-text:hover:not(.button-disabled) {
    background-color: rgba(37, 99, 235, 0.05);
  }

  .button-small {
    font-size: var(--font-size-sm);
    padding: 0.25rem 0.75rem;
  }

  .button-medium {
    font-size: var(--font-size-md);
    padding: 0.5rem 1rem;
  }

  .button-large {
    font-size: var(--font-size-lg);
    padding: 0.75rem 1.5rem;
  }

  .button-full-width {
    width: 100%;
  }

  .button-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 将样式插入到文档中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
