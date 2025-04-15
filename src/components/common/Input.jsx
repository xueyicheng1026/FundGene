import React, { forwardRef } from 'react';
import classNames from 'classnames';
import './Input.css';

/**
 * 输入框组件
 * 支持多种变体、尺寸和状态
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.label - 输入框标签
 * @param {'text'|'password'|'email'|'number'|'tel'|'url'|'search'} props.type - 输入框类型
 * @param {string} props.placeholder - 占位文本
 * @param {string|number} props.value - 输入框值
 * @param {Function} props.onChange - 值变化处理函数
 * @param {string} props.name - 输入框名称
 * @param {string|boolean} props.error - 错误信息或错误状态
 * @param {string} props.helperText - 辅助文本
 * @param {boolean} props.required - 是否必填
 * @param {boolean} props.fullWidth - 是否占满容器宽度
 * @param {boolean} props.disabled - 是否禁用
 * @param {'sm'|'md'|'lg'} props.size - 输入框尺寸
 * @param {'default'|'filled'|'outlined'|'underlined'} props.variant - 输入框变体
 * @param {React.ReactNode} props.prefix - 前缀内容（图标或文本）
 * @param {React.ReactNode} props.suffix - 后缀内容（图标或文本）
 * @param {boolean} props.suffixClickable - 后缀是否可点击
 * @param {Function} props.onSuffixClick - 后缀点击事件处理函数
 * @param {string} props.className - 自定义类名
 */
const Input = forwardRef(({ 
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
  size = 'md',
  variant = 'default',
  prefix,
  suffix,
  suffixClickable = false,
  onSuffixClick,
  className,
  ...props
}, ref) => {
  const inputId = name || Math.random().toString(36).substring(2, 9);
  
  // 判断是否为搜索框
  const isSearch = type === 'search';
  
  const inputClasses = classNames(
    'input-field',
    `input-${size}`,
    {
      'input-error': error,
      'input-disabled': disabled,
      [`input-${variant}`]: variant !== 'default',
    },
    className
  );

  const formGroupClasses = classNames(
    'form-group',
    {
      'form-group-full-width': fullWidth,
      'input-with-icon': suffix,
      'input-with-prefix': prefix || isSearch,
      'input-search': isSearch
    }
  );

  // 处理搜索图标
  const renderSearchIcon = () => {
    if (!isSearch) return null;
    
    return (
      <span className="input-search-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </span>
    );
  };

  // 处理后缀的点击事件
  const handleSuffixClick = (e) => {
    if (suffixClickable && onSuffixClick) {
      e.stopPropagation();
      onSuffixClick(e);
    }
  };

  return (
    <div className={formGroupClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      
      {renderSearchIcon()}
      
      {prefix && <span className="input-prefix">{prefix}</span>}
      
      <input
        ref={ref}
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
      
      {suffix && (
        <span 
          className={classNames('input-icon', {
            'input-icon-clickable': suffixClickable
          })}
          onClick={handleSuffixClick}
        >
          {suffix}
        </span>
      )}
      
      {(error || helperText) && (
        <p className={`input-helper-text ${error ? 'input-error-text' : ''}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

/**
 * 文本区域组件
 */
export const TextArea = forwardRef(({
  rows = 4,
  className,
  ...props
}, ref) => {
  const textareaClasses = classNames(
    'input-field',
    className
  );
  
  return (
    <Input
      {...props}
      ref={ref}
      as="textarea"
      className={textareaClasses}
      rows={rows}
    />
  );
});

/**
 * 密码输入框组件
 */
export const PasswordInput = forwardRef(({
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  // 切换密码显示/隐藏
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // 密码可见性图标
  const visibilityIcon = showPassword ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  return (
    <Input
      {...props}
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      suffix={visibilityIcon}
      suffixClickable
      onSuffixClick={togglePasswordVisibility}
    />
  );
});

/**
 * 搜索输入框组件
 */
export const SearchInput = forwardRef(({
  ...props
}, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      type="search"
    />
  );
});

Input.displayName = 'Input';
TextArea.displayName = 'TextArea';
PasswordInput.displayName = 'PasswordInput';
SearchInput.displayName = 'SearchInput';

export default Input;
