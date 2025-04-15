import React from 'react';
import classNames from 'classnames';
import './Card.css';

/**
 * 通用卡片组件
 * 用于包装内容的容器，支持不同的大小、阴影和边框样式
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 卡片内容
 * @param {string} props.className - 自定义类名
 * @param {string} props.title - 卡片标题
 * @param {string} props.subtitle - 卡片副标题
 * @param {React.ReactNode} props.extra - 卡片右上角额外内容
 * @param {React.ReactNode} props.footer - 卡片底部内容
 * @param {boolean} props.bordered - 是否显示边框
 * @param {'none'|'sm'|'md'|'lg'} props.shadow - 阴影大小
 * @param {'none'|'sm'|'md'|'lg'|'xl'} props.padding - 内边距大小
 * @param {boolean} props.hoverable - 是否在悬停时显示阴影效果
 * @param {'success'|'error'|'warning'|'info'} props.status - 卡片状态，添加对应颜色指示器
 * @param {boolean} props.highlighted - 是否高亮显示（左侧边框）
 * @param {boolean} props.noContent - 是否不添加内容容器
 */
const Card = ({ 
  children,
  className,
  title,
  subtitle,
  extra,
  footer,
  bordered = false,
  shadow = 'sm',
  padding = 'md',
  hoverable = false,
  status,
  highlighted = false,
  noContent = false,
  ...props 
}) => {
  const cardClasses = classNames(
    'card',
    {
      'card-bordered': bordered,
      'card-hoverable': hoverable,
      [`card-shadow-${shadow}`]: shadow && shadow !== 'sm',
      [`card-padding-${padding}`]: padding && padding !== 'md',
      'card-highlighted': highlighted,
      [`card-${status}`]: status,
    },
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {(title || extra) && (
        <div className="card-header">
          <div>
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {extra && <div className="card-extra">{extra}</div>}
        </div>
      )}
      
      {!noContent && (
        <div className="card-content">
          {children}
        </div>
      )}
      
      {noContent && children}
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * 卡片列表项组件
 */
export const CardListItem = ({ className, children, ...props }) => (
  <div className={classNames('card-list-item', className)} {...props}>
    {children}
  </div>
);

/**
 * 卡片分隔线组件
 */
export const CardDivider = ({ className, ...props }) => (
  <div className={classNames('card-divider', className)} {...props} />
);

/**
 * 卡片网格容器组件
 */
export const CardGrid = ({ 
  className, 
  children, 
  columns = 1,
  ...props 
}) => (
  <div 
    className={classNames(
      'card-grid', 
      columns > 1 && `card-grid-cols-${Math.min(columns, 3)}`,
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

/**
 * 卡片统计数字组件
 */
export const CardStat = ({ 
  className,
  value,
  label,
  ...props 
}) => (
  <div className={classNames('card-stat', className)} {...props}>
    <div className="card-stat-value">{value}</div>
    {label && <div className="card-stat-label">{label}</div>}
  </div>
);

export default Card;
