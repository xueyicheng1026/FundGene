# 字体样式系统

本文档详细介绍了项目中字体样式的实现和管理方式。

## 目录

- [概述](#概述)
- [核心文件结构](#核心文件结构)
- [变量系统](#变量系统)
- [文本样式类](#文本样式类)
- [排版组合](#排版组合)
- [React组件](#react组件)
- [主题切换](#主题切换)
- [响应式适配](#响应式适配)
- [最佳实践](#最佳实践)

## 概述

本项目采用了模块化、可组合的字体样式系统，主要通过以下方式实现：

1. **CSS变量**：在`variables.css`中定义统一的字体相关变量
2. **工具类**：在`TextStyles.css`中提供可组合的文本样式类
3. **预设组合**：在`typography.css`中提供常用的文本样式组合
4. **React组件**：通过`Text`组件提供编程式的样式应用方式
5. **主题支持**：在`dark-theme.css`中提供深色模式下的字体样式变量

这种多层次的实现方式既提供了高度的灵活性，也确保了界面风格的一致性。

## 核心文件结构

```
src/
├── styles/
│   ├── variables.css        # 基础变量定义
│   ├── TextStyles.css       # 文本样式类
│   ├── typography.css       # 排版组合样式
│   ├── dark-theme.css       # 深色主题变量
│   ├── responsive-variables.css # 响应式变量
│   └── globals.css          # 全局样式和导入
└── components/
    └── common/
        └── Text.jsx         # 文本组件
```

## 变量系统

在`variables.css`中，我们定义了所有与字体相关的CSS变量：

### 字体系列

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-heading: var(--font-family);
--font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
```

### 字体大小

```css
--font-size-base: 1rem;      /* 16px 基准大小 */
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-md: var(--font-size-base); /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 1.875rem;   /* 30px */
--font-size-4xl: 2.25rem;    /* 36px */
```

### 标题大小

```css
--heading-h1-size: var(--font-size-4xl);
--heading-h2-size: var(--font-size-3xl);
--heading-h3-size: var(--font-size-2xl);
--heading-h4-size: var(--font-size-xl);
--heading-h5-size: var(--font-size-lg);
--heading-h6-size: var(--font-size-md);
```

### 字体粗细

```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-bold: 600;
--font-weight-extrabold: 700;
```

### 行高和字间距

```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.6;
--line-height-heading: 1.3;

--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-heading: -0.02em;
```

### 文本颜色

```css
--text-primary: var(--neutral-900);
--text-secondary: var(--neutral-700);
--text-tertiary: var(--neutral-500);
--text-light: var(--neutral-50);

--text-heading: var(--neutral-900);
--text-bold: var(--neutral-900);
--text-title: var(--neutral-900);
--text-description: var(--neutral-700);
--text-meta: var(--neutral-500);
--text-hint: var(--neutral-600);
--text-link: var(--primary-color);
--text-link-hover: var(--primary-dark);
```

## 文本样式类

`TextStyles.css`提供了一系列可组合的文本样式类，遵循原子化设计理念：

### 文本变体

```css
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }
/* 其他变体... */
```

### 文本大小

```css
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-md { font-size: var(--font-size-md); }
/* 其他大小... */
```

### 文本粗细

```css
.text-normal { font-weight: var(--font-weight-normal); }
.text-medium { font-weight: var(--font-weight-medium); }
.text-bold { font-weight: var(--font-weight-bold); }
.text-extrabold { font-weight: var(--font-weight-extrabold); }
```

### 文本对齐

```css
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }
```

### 文本修饰

```css
.text-underline { text-decoration: underline; }
.text-line-through { text-decoration: line-through; }
.text-no-underline { text-decoration: none; }
.text-uppercase { text-transform: uppercase; }
/* 其他修饰... */
```

### 文本截断

```css
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 其他截断... */
```

## 排版组合

`typography.css`提供了预定义的文本样式组合，简化常见场景的样式应用：

```css
.title-hero {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-heading);
  color: var(--text-heading);
  margin-bottom: var(--spacing-lg);
}

.paragraph {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

/* 其他预设组合... */
```

## React组件

为了提供编程式的样式应用方式，我们实现了`Text`组件：

```jsx
// Text.jsx
import React from 'react';
import classNames from 'classnames';

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

export default Text;
```

同时还提供了特定场景的衍生组件：

```jsx
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
```

## 主题切换

在`dark-theme.css`中，我们为深色模式定义了特定的文本颜色变量：

```css
.dark-theme {
  --text-primary: #f9fafb;
  --text-secondary: #e5e7eb;
  --text-tertiary: #9ca3af;
  --text-light: #1f2937;
  
  --text-heading: #ffffff;
  --text-bold: #ffffff;
  --text-title: #ffffff;
  --text-description: #d1d5db;
  --text-meta: #cbd5e1;
  --text-hint: #94a3b8;
  --text-link: #60a5fa;
  --text-link-hover: #93c5fd;
  
  /* 其他深色主题变量... */
}
```

此外，`TextStyles.css`也包含了深色模式的特定样式调整：

```css
.dark-theme .text-primary {
  color: #f9fafb; /* 更亮的白色，增强对比度 */
}

.dark-theme .text-secondary {
  color: #e5e7eb; /* 明亮的灰色 */
}

/* 其他深色模式调整... */
```

## 响应式适配

在`responsive-variables.css`中，我们为不同设备尺寸定义了字体大小的调整：

```css
/* 平板设备 */
@media (max-width: 992px) {
  :root {
    --font-size-3xl: 1.75rem;
    --font-size-4xl: 2rem;
    /* 其他平板适配... */
  }
}

/* 移动设备 */
@media (max-width: 576px) {
  :root {
    --font-size-xl: 1.125rem;
    --font-size-2xl: 1.25rem;
    --font-size-3xl: 1.5rem;
    --font-size-4xl: 1.75rem;
    /* 其他移动设备适配... */
  }
}

/* 小屏幕手机 */
@media (max-width: 360px) {
  :root {
    --font-size-md: 0.9375rem;
    /* 其他小屏幕适配... */
  }
}
```

## 最佳实践

### HTML元素使用

对于简单的文本样式需求，直接使用HTML元素并应用文本样式类：

```html
<p class="text-secondary text-sm">这是一段次要说明文本</p>
<h2 class="text-heading text-2xl">这是一个二级标题</h2>
```

### 排版组合使用

对于常见的文本样式组合，使用typography.css中定义的预设类：

```html
<h1 class="title-hero">主标题</h1>
<p class="paragraph-secondary">次要段落内容</p>
```

### React组件使用

在React组件中，使用Text组件及其衍生组件：

```jsx
// 基本使用
<Text variant="secondary" size="sm">次要小文本</Text>

// 标题组件
<Heading level={2}>二级标题</Heading>

// 段落组件
<Paragraph variant="secondary">次要段落内容</Paragraph>

// 复杂组合
<Text 
  variant="primary"
  size="lg"
  weight="bold"
  component="div"
  truncate
>
  这是一个被截断的粗体大号主要文本
</Text>
```

### 组件样式中引用变量

在组件的CSS中，始终使用变量而非硬编码值：

```css
.component-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-heading);
}
```

### 避免内联样式

尽量避免使用内联样式，而是使用CSS类和变量：

```jsx
// 不推荐
<div style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>文本</div>

// 推荐
<div className="text-lg text-bold text-primary">文本</div>
```

### 添加新样式

1. 尽量使用现有样式类的组合
2. 如需添加新样式，先考虑是否应该添加到`TextStyles.css`或`typography.css`
3. 对于特定组件的样式，放在组件自己的CSS文件中
4. 添加新的全局变量时，确保同时更新`dark-theme.css`中的对应变量
