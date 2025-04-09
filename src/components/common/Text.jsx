import React from 'react';
import classNames from 'classnames';

/**
 * 增强型文本组件，用于应用TextStyles.css中定义的文本样式
 * 使用示例:
 * <Text variant="heading" size="3xl" weight="bold" component="h2">标题文本</Text>
 * <Text variant="secondary" size="sm">次要信息文本</Text>
 */
const Text = ({
  children,
  variant = 'primary',
  size,
  weight,
  component = 'span',
  truncate = false,
  clamp,
  align,
  transform,
  italic,
  underline,
  nowrap,
  className,
  ...props
}) => {
  const Component = component;
  
  const textClasses = classNames(
    'text',
    {
      [`text-${variant}`]: variant,
      [`text-${size}`]: size,
      [`text-${weight}`]: weight,
      'text-truncate': truncate,
      [`text-clamp-${clamp}`]: clamp,
      [`text-${align}`]: align,
      [`text-${transform}`]: transform,
      'text-italic': italic,
      'text-underline': underline,
      'text-nowrap': nowrap,
    },
    className
  );
  
  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

/**
 * 标题组件 - Text组件的专门化版本，用于创建标题
 * 使用示例:
 * <Heading level={1}>一级标题</Heading>
 * <Heading level={3} className="custom-class">三级标题</Heading>
 */
export const Heading = ({
  children,
  level = 1,
  className,
  ...props
}) => {
  const validLevel = Math.min(Math.max(parseInt(level), 1), 6);
  const component = `h${validLevel}`;
  
  return (
    <Text
      component={component}
      variant="heading"
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
};

/**
 * 段落组件 - Text组件的专门化版本，用于创建段落
 * 使用示例:
 * <Paragraph>正文内容</Paragraph>
 * <Paragraph variant="secondary">次要段落</Paragraph>
 */
export const Paragraph = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <Text
      component="p"
      variant={variant}
      className={classNames('paragraph', className)}
      {...props}
    >
      {children}
    </Text>
  );
};

export default Text;
