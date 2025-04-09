import React from 'react';
import classNames from 'classnames';

const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  helperText,
  required = false,
  fullWidth = false,
  disabled = false,
  className,
  ...props
}) => {
  const inputId = name || Math.random().toString(36).substring(2, 9);
  
  const inputClasses = classNames(
    'input-field',
    {
      'input-full-width': fullWidth,
      'input-error': error,
      'input-disabled': disabled,
    },
    className
  );

  const formGroupClasses = classNames(
    'form-group',
    {
      'form-group-full-width': fullWidth,
    }
  );

  return (
    <div className={formGroupClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label text-secondary text-sm">
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        disabled={disabled}
        required={required}
        {...props}
      />
      {(error || helperText) && (
        <p className={`input-helper-text ${error ? 'input-error-text text-error' : 'text-tertiary'} text-xs`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;

// CSS
const styles = `
  .form-group {
    margin-bottom: var(--spacing-md);
  }

  .form-group-full-width {
    width: 100%;
  }

  .input-label {
    display: block;
    margin-bottom: var(--spacing-xs);
  }

  .input-required {
    color: var(--error-color);
    margin-left: var(--spacing-xs);
  }

  .input-field {
    display: block;
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    line-height: var(--line-height-normal);
    color: var(--text-primary);
    background-color: white;
    background-clip: padding-box;
    border: 1px solid var(--neutral-300);
    border-radius: var(--border-radius-md);
    transition: var(--transition-default);
  }

  .input-field:focus {
    border-color: var(--primary-color);
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
  }

  .input-field::placeholder {
    color: var(--neutral-400);
  }

  .input-full-width {
    width: 100%;
  }

  .input-error {
    border-color: var(--error-color);
  }

  .input-error:focus {
    box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25);
  }

  .input-disabled {
    background-color: var(--neutral-100);
    opacity: 0.7;
    cursor: not-allowed;
  }

  .input-helper-text {
    margin-top: var(--spacing-xs);
  }
`;

// 将样式插入到文档中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
