import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './ChartStyles.css';

/**
 * 基础图表组件
 * 提供一致的图表容器、标题、加载状态和空状态
 * 
 * @param {Object} props 组件属性
 * @param {React.ReactNode} props.children 图表内容
 * @param {string} props.title 图表标题
 * @param {string} props.subtitle 图表副标题
 * @param {React.ReactNode} props.actions 图表操作区内容
 * @param {boolean} props.loading 是否正在加载
 * @param {boolean} props.empty 是否为空状态
 * @param {string} props.emptyMessage 空状态提示信息
 * @param {React.ReactNode} props.emptyIcon 空状态图标
 * @param {React.ReactNode} props.footer 图表底部内容
 * @param {React.ReactNode} props.legend 图表图例
 * @param {string} props.className 自定义类名
 */
const ChartContainer = ({
  children,
  title,
  subtitle,
  actions,
  loading = false,
  empty = false,
  emptyMessage = '暂无数据',
  emptyIcon,
  footer,
  legend,
  className,
  ...restProps
}) => {
  const renderEmptyState = () => (
    <div className="chart-empty">
      {emptyIcon && <div className="chart-empty-icon">{emptyIcon}</div>}
      <div className="chart-empty-text">{emptyMessage}</div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="chart-loading">
      <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
            <stop stopColor="currentColor" stopOpacity="0" offset="0%" />
            <stop stopColor="currentColor" stopOpacity=".631" offset="63.146%" />
            <stop stopColor="currentColor" offset="100%" />
          </linearGradient>
        </defs>
        <g fill="none" fillRule="evenodd">
          <g transform="translate(1 1)">
            <path d="M36 18c0-9.94-8.06-18-18-18" stroke="url(#a)" strokeWidth="2">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </path>
            <circle fill="currentColor" cx="36" cy="18" r="1">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>
      </svg>
    </div>
  );

  const renderLegend = () => {
    if (!legend) return null;
    
    return (
      <div className="chart-legend">
        {legend}
      </div>
    );
  };

  return (
    <div className={classNames('chart-container', className)} {...restProps}>
      {(title || actions) && (
        <div className="chart-header">
          <div>
            {title && <h3 className="chart-title">{title}</h3>}
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="chart-actions">{actions}</div>}
        </div>
      )}
      
      <div className="chart-body">
        {loading && renderLoadingState()}
        {!loading && empty && renderEmptyState()}
        {!loading && !empty && children}
      </div>
      
      {(footer || legend) && (
        <div className="chart-footer">
          {renderLegend()}
          {footer && <div className="chart-footer-actions">{footer}</div>}
        </div>
      )}
    </div>
  );
};

ChartContainer.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  loading: PropTypes.bool,
  empty: PropTypes.bool,
  emptyMessage: PropTypes.string,
  emptyIcon: PropTypes.node,
  footer: PropTypes.node,
  legend: PropTypes.node,
  className: PropTypes.string,
};

/**
 * 图表图例项组件
 * 
 * @param {Object} props 组件属性
 * @param {string} props.color 图例颜色
 * @param {string} props.label 图例标签
 */
export const ChartLegendItem = ({ color, label }) => (
  <div className="chart-legend-item">
    <span className="chart-legend-color" style={{ backgroundColor: color }} />
    <span>{label}</span>
  </div>
);

ChartLegendItem.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default ChartContainer;