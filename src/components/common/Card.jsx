import React from 'react';
import classNames from 'classnames';
import './Card.css';

/**
 * 卡片组件
 * 提供统一的卡片样式和功能
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 卡片内容
 * @param {string} props.className - 额外的CSS类名
 * @param {boolean} props.bordered - 是否显示边框
 * @param {string} props.shadow - 阴影大小 'none'|'sm'|'md'|'lg'
 * @param {string} props.padding - 内边距大小 'none'|'sm'|'md'|'lg'|'xl'
 */
const Card = ({ 
  children, 
  className, 
  bordered = true, 
  shadow = 'sm',
  padding = 'md',
  ...props 
}) => {
  const cardClasses = classNames(
    'card',
    {
      'card-bordered': bordered,
      [`card-shadow-${shadow}`]: shadow,
      [`card-padding-${padding}`]: padding,
    },
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
