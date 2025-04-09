import React from 'react';
import classNames from 'classnames';

/**
 * 通用文本组件，用于应用TextStyles.css中定义的文本样式
 * 
 * @param {string} variant - 文本变体: primary, secondary, tertiary, heading, description, meta, tag, hint, link, etc.
 * @param {string} size - 文本大小: xs, sm, md, lg, xl
 * @param {string} weight - 文本重量: normal, medium, bold, extrabold
 * @param {string} component - 要渲染的HTML元素: p, span, div, h1-h6
 * @param {boolean} truncate - 是否截断文本
 * @param {number} clamp - 截断的行数: 2, 3, 等
 */
const Text = ({
  children,
  variant = 'primary',
  size,
  weight,
  component = 'span',
  truncate = false,
  clamp,
  className,
  ...props
}) => {
  const Component = component;
  
  const textClasses = classNames(
    `text-${variant}`,
    size && `text-${size}`,
    weight && `text-${weight}`,
    truncate && 'text-truncate',
    clamp && `text-clamp-${clamp}`,
    className
  );
  
  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

export default Text;
