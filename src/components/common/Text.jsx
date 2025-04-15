import React from 'react';
import classNames from 'classnames';

/**
 * 通用文本组件
 * 提供一致的文本样式处理，支持各种文本变体和修饰
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 文本内容
 * @param {string} props.className - 自定义类名
 * @param {'primary'|'secondary'|'tertiary'|'description'|'meta'|'hint'|'link'|'heading'|'tag'|'success'|'error'|'warning'|'info'} props.variant - 文本变体
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'} props.size - 文本大小
 * @param {'normal'|'medium'|'bold'|'extrabold'} props.weight - 文本粗细
 * @param {'left'|'center'|'right'|'justify'} props.align - 文本对齐
 * @param {'tight'|'normal'|'relaxed'} props.leading - 行高
 * @param {'tight'|'normal'|'wide'} props.tracking - 字间距
 * @param {boolean} props.italic - 是否斜体
 * @param {boolean} props.underline - 是否下划线
 * @param {boolean} props.lineThrough - 是否删除线
 * @param {boolean} props.uppercase - 是否大写
 * @param {boolean} props.lowercase - 是否小写
 * @param {boolean} props.capitalize - 是否首字母大写
 * @param {boolean} props.truncate - 是否截断文本
 * @param {number} props.clamp - 限制行数(2或3)，超出显示省略号
 * @param {string} props.as - 要渲染的HTML元素，默认为span
 */
const Text = ({
  children,
  className,
  variant,
  size,
  weight,
  align,
  leading,
  tracking,
  italic = false,
  underline = false,
  lineThrough = false,
  uppercase = false,
  lowercase = false,
  capitalize = false,
  truncate = false,
  clamp,
  as: Component = 'span',
  ...props
}) => {
  const textClasses = classNames(
    // 基础类
    'text-base',
    
    // 变体
    variant && `text-${variant}`,
    
    // 大小
    size && `text-${size}`,
    
    // 粗细
    weight && `text-${weight}`,
    
    // 对齐
    align && `text-${align}`,
    
    // 行高
    leading && `text-leading-${leading}`,
    
    // 字间距
    tracking && `text-tracking-${tracking}`,
    
    // 修饰
    italic && 'text-italic',
    underline && 'text-underline',
    lineThrough && 'text-line-through',
    uppercase && 'text-uppercase',
    lowercase && 'text-lowercase',
    capitalize && 'text-capitalize',
    
    // 截断
    truncate && 'text-truncate',
    clamp && `text-clamp-${clamp}`,
    
    // 自定义类
    className
  );

  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

/**
 * 标题组件 - 统一页面各级标题样式
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 标题内容
 * @param {1|2|3|4|5|6} props.level - 标题级别，对应h1-h6
 * @param {'hero'|'page'|'section'|'card'|'group'} props.type - 标题类型
 */
export const Heading = ({
  children,
  level = 2,
  type,
  className,
  ...props
}) => {
  const Component = `h${level}`;
  
  const titleClass = type ? `title-${type}` : null;
  
  const headingClasses = classNames(
    titleClass,
    className
  );
  
  return (
    <Component 
      className={headingClasses}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * 段落组件 - 统一段落文本样式
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 段落内容
 * @param {'default'|'secondary'|'small'} props.type - 段落类型
 */
export const Paragraph = ({
  children,
  type = 'default',
  className,
  ...props
}) => {
  const paragraphClass = type === 'default' 
    ? 'paragraph' 
    : type === 'secondary' 
      ? 'paragraph-secondary' 
      : type === 'small' 
        ? 'paragraph-small' 
        : null;
  
  const paragraphClasses = classNames(
    paragraphClass,
    className
  );
  
  return (
    <p 
      className={paragraphClasses}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * 描述文本组件 - 用于页面和区域描述
 */
export const Description = ({ children, className, ...props }) => (
  <p className={classNames('description', className)} {...props}>
    {children}
  </p>
);

/**
 * 标签文本组件 - 用于显示标签、徽章等小型文本
 */
export const Tag = ({ children, className, ...props }) => (
  <span className={classNames('text-tag', className)} {...props}>
    {children}
  </span>
);

/**
 * 标注文本组件 - 用于显示说明、注释等辅助文本
 */
export const Caption = ({ children, className, ...props }) => (
  <span className={classNames('text-caption', className)} {...props}>
    {children}
  </span>
);

/**
 * 强调文本组件 - 用于突出显示重要文本
 */
export const Emphasis = ({ children, className, ...props }) => (
  <em className={classNames('text-emphasis', className)} {...props}>
    {children}
  </em>
);

/**
 * 状态文本组件 - 用于显示状态相关的文本
 */
export const StatusText = ({ 
  children, 
  status = 'info', 
  className, 
  ...props 
}) => (
  <span 
    className={classNames(`text-state-${status}`, className)} 
    {...props}
  >
    {children}
  </span>
);

export default Text;
